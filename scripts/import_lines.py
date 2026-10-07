"""Build compact Düsseldorf line patterns from a local VRR GTFS feed."""
import argparse
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


def read_csv(path, required):
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        missing = set(required) - set(reader.fieldnames or ())
        if missing:
            raise ValueError(f"{path} is missing required columns: {', '.join(sorted(missing))}")
        yield from reader


def normalize_mode(route_type):
    try:
        route_type = int(route_type)
    except (TypeError, ValueError):
        return "other"
    if route_type == 0:
        return "tram"
    if route_type == 1:
        return "stadtbahn"
    if route_type == 2 or 100 <= route_type < 200:
        return "train"
    if route_type == 3 or 700 <= route_type < 800:
        return "bus"
    if 400 <= route_type < 500:
        return "rail-other"
    return "other"


def read_agencies(path):
    agencies = {}
    if path is None:
        return agencies
    for row in read_csv(path, {"agency_id", "agency_name"}):
        agency_id = row["agency_id"]
        if not agency_id or agency_id in agencies:
            raise ValueError(f"Missing or duplicate agency_id in {path}: {agency_id!r}")
        agencies[agency_id] = (row.get("agency_name") or "").strip()
    return agencies


def read_routes(path, agencies):
    routes = {}
    for row in read_csv(path, {"route_id", "route_type"}):
        route_id = row["route_id"]
        if not route_id or route_id in routes:
            raise ValueError(f"Missing or duplicate route_id in {path}: {route_id!r}")
        short_name = (row.get("route_short_name") or "").strip()
        long_name = (row.get("route_long_name") or "").strip()
        agency_id = (row.get("agency_id") or "").strip()
        color = (row.get("route_color") or "").strip().lstrip("#")
        routes[route_id] = {
            "id": route_id,
            "name": short_name or long_name or route_id,
            "longName": long_name,
            "agencyId": agency_id,
            "agencyName": agencies.get(agency_id, ""),
            "routeType": row["route_type"],
            "mode": normalize_mode(row["route_type"]),
            "color": color.upper() if re.fullmatch(r"[0-9a-fA-F]{6}", color) else "",
        }
    return routes


def read_trips(path):
    trips = {}
    for row in read_csv(path, {"trip_id", "route_id"}):
        trip_id = row["trip_id"]
        if not trip_id or trip_id in trips:
            raise ValueError(f"Missing or duplicate trip_id in {path}: {trip_id!r}")
        trips[trip_id] = {
            "routeId": row["route_id"],
            "directionId": (row.get("direction_id") or "").strip(),
            "headsign": (row.get("trip_headsign") or "").strip(),
        }
    return trips


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_lines(stop_times_path, trips_path, routes_path, stops_path, agencies_path=None):
    stops_data = json.loads(stops_path.read_text(encoding="utf-8"))
    stops = {stop["id"]: stop for stop in stops_data["stops"]}
    routes = read_routes(routes_path, read_agencies(agencies_path))
    trips = read_trips(trips_path)
    patterns = defaultdict(set)
    pattern_headsigns = defaultdict(Counter)
    usage = defaultdict(set)
    unmatched_trips = Counter()
    row_count = 0
    completed_trips = set()
    previous_trip_id = None
    previous_sequence = -1
    trip_stops = []

    def add_segment(trip_id, segment):
        if len(segment) < 2:
            return
        trip = trips.get(trip_id)
        if trip is None:
            unmatched_trips["missing_trip"] += 1
            return
        route_id = trip["routeId"]
        if route_id not in routes:
            unmatched_trips["missing_route"] += 1
            return
        key = (route_id, trip["directionId"], tuple(segment))
        patterns[key].add(trip_id)
        if trip["headsign"]:
            pattern_headsigns[key][trip["headsign"]] += 1
        usage[route_id].add(trip_id)

    def finish_trip(trip_id, segment):
        if trip_id is not None:
            add_segment(trip_id, segment)

    for row in read_csv(stop_times_path, {"trip_id", "stop_id", "stop_sequence"}):
        row_count += 1
        trip_id = row["trip_id"]
        if trip_id != previous_trip_id:
            finish_trip(previous_trip_id, trip_stops)
            trip_stops = []
            if trip_id in completed_trips:
                raise ValueError("stop_times.txt must keep each trip's rows together")
            if previous_trip_id is not None:
                completed_trips.add(previous_trip_id)
            previous_trip_id = trip_id
            previous_sequence = -1

        try:
            sequence = int(row["stop_sequence"])
        except (TypeError, ValueError) as error:
            raise ValueError(f"Invalid stop_sequence at row {row_count + 1}") from error
        if sequence <= previous_sequence:
            raise ValueError(f"stop_sequence is not increasing within trip {trip_id}")
        previous_sequence = sequence

        stop_id_parts = row["stop_id"].split(":")
        dhid = ":".join(stop_id_parts[:3]) if len(stop_id_parts) >= 3 else ""
        if dhid not in stops:
            finish_trip(trip_id, trip_stops)
            trip_stops = []
        elif not trip_stops or trip_stops[-1] != dhid:
            trip_stops.append(dhid)

    finish_trip(previous_trip_id, trip_stops)
    if unmatched_trips:
        raise ValueError(f"GTFS references missing trip/route metadata: {dict(unmatched_trips)}")

    lines = []
    for route_id, route in routes.items():
        route_patterns = []
        for (pattern_route_id, direction_id, sequence), pattern_trips in patterns.items():
            if pattern_route_id != route_id:
                continue
            headsign_counts = pattern_headsigns[(pattern_route_id, direction_id, sequence)]
            headsign = headsign_counts.most_common(1)[0][0] if headsign_counts else ""
            route_patterns.append({
                "directionId": direction_id,
                "headsign": headsign,
                "tripCount": len(pattern_trips),
                "stops": list(sequence),
            })
        if route_patterns:
            route_patterns.sort(key=lambda pattern: (-pattern["tripCount"], pattern["directionId"], pattern["stops"]))
            lines.append({**route, "tripCount": len(usage[route_id]), "patterns": route_patterns})

    lines.sort(key=lambda line: (line["mode"], line["name"].casefold(), line["id"]))
    return {
        "source": {
            "stopsVersion": stops_data.get("source", {}).get("version", "unknown"),
            "stopsSha256": stops_data.get("source", {}).get("stopsSha256", ""),
            "feedValidFrom": stops_data.get("source", {}).get("validFrom", ""),
            "feedValidUntil": stops_data.get("source", {}).get("validUntil", ""),
            "stopTimesSha256": sha256_file(stop_times_path),
            "tripsSha256": sha256_file(trips_path),
            "routesSha256": sha256_file(routes_path),
            "agenciesSha256": sha256_file(agencies_path) if agencies_path else "",
            "stopTimesRows": row_count,
            "geometry": "straight-segments-between-stop-coordinates",
        },
        "lines": lines,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stop-times", required=True, type=Path)
    parser.add_argument("--trips", required=True, type=Path)
    parser.add_argument("--routes", required=True, type=Path)
    parser.add_argument("--agencies", type=Path)
    parser.add_argument("--stops", type=Path, default=Path("site/public/data/stops-duesseldorf.json"))
    parser.add_argument("--output", type=Path, default=Path("site/public/data/lines-duesseldorf.json"))
    args = parser.parse_args()
    result = build_lines(args.stop_times, args.trips, args.routes, args.stops, args.agencies)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(result['lines'])} Linien aus {result['source']['stopTimesRows']} stop_times-Zeilen → {args.output}")
