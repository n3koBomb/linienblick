"""Create the small map dataset from local VRR GTFS files; never publish the raw feed."""
import argparse
import csv
import hashlib
import json
import re
from pathlib import Path


def import_stops(stops_path, feed_path):
    with stops_path.open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    parents = {r["stop_id"]: r for r in rows if r["location_type"] == "1"}
    groups = {}
    for row in rows:
        if row["location_type"] not in ("", "0", "1"):
            continue
        dhid = row.get("NVBW_HST_DHID", "") or ":".join(row["stop_id"].split(":")[:3]).removesuffix("_Parent")
        if not dhid.startswith("de:05111:"):
            continue
        try:
            lat, lon = float(row["stop_lat"]), float(row["stop_lon"])
        except (ValueError, KeyError):
            continue
        if not (51.0 < lat < 51.5 and 6.5 < lon < 7.1):
            continue
        groups.setdefault(dhid, []).append(row)

    result = []
    for dhid, group in groups.items():
        station = next((r for r in group if r["location_type"] == "1"), None)
        if station is None:
            station = next((parents[r["parent_station"]] for r in group if r["parent_station"] in parents), None)
        reference = station or min(group, key=lambda r: len(r["stop_name"]))
        name = re.sub(r"\s+Bstg\s+\S+.*$", "", reference["stop_name"]).strip()
        name = re.sub(r"^(?:D-|Düsseldorf\s+)", "", name)
        if name == "Hbf":
            name = "Düsseldorf Hbf"
        lat = float(reference["stop_lat"]) if station else sum(float(r["stop_lat"]) for r in group) / len(group)
        lon = float(reference["stop_lon"]) if station else sum(float(r["stop_lon"]) for r in group) / len(group)
        result.append({"id": dhid, "name": name, "lat": round(lat, 7), "lon": round(lon, 7),
                       "platformCount": len({r["stop_id"] for r in group if r["location_type"] != "1"})})

    with feed_path.open(encoding="utf-8-sig", newline="") as file:
        feed = next(csv.DictReader(file))
    return {
        "source": {"publisher": feed["feed_publisher_name"], "version": feed["feed_version"],
                   "validFrom": feed["feed_start_date"], "validUntil": feed["feed_end_date"],
                   "municipalityCode": "05111", "selection": "Düsseldorfer Haltestellen nach DHID de:05111",
                   "stopsSha256": hashlib.sha256(stops_path.read_bytes()).hexdigest()},
        "stops": sorted(result, key=lambda s: (s["name"].casefold(), s["id"]))
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stops", required=True, type=Path)
    parser.add_argument("--feed-info", required=True, type=Path)
    parser.add_argument("--output", type=Path, default=Path("site/public/data/stops-duesseldorf.json"))
    args = parser.parse_args()
    dataset = import_stops(args.stops, args.feed_info)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dataset, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(dataset['stops'])} Haltestellen → {args.output}")
