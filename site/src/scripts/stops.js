const collator = new Intl.Collator('de', { sensitivity: 'base', numeric: true });

export function normalizeSearch(value) {
  return String(value).toLocaleLowerCase('de').replaceAll('ß', 'ss')
    .replaceAll('ä', 'a').replaceAll('ö', 'o').replaceAll('ü', 'u')
    .replaceAll('ae', 'a').replaceAll('oe', 'o').replaceAll('ue', 'u')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/hauptbahnhof/g, 'hbf').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function validateDataset(value) {
  if (!value || !Array.isArray(value.stops) || value.stops.length === 0) {
    throw new Error('Keine Haltestellendaten vorhanden.');
  }
  const ids = new Set();
  for (const stop of value.stops) {
    if (typeof stop.id !== 'string' || !stop.id || ids.has(stop.id) || typeof stop.name !== 'string' || !stop.name.trim()
      || !Number.isFinite(stop.lat) || !Number.isFinite(stop.lon)
      || stop.lat < 51 || stop.lat > 51.5 || stop.lon < 6.5 || stop.lon > 7.1) {
      throw new Error('Ungültige Haltestellendaten.');
    }
    ids.add(stop.id);
  }
  return value;
}

export function searchStops(stops, query) {
  const tokens = normalizeSearch(query).split(' ').filter(Boolean);
  return stops.filter(stop => {
    const text = normalizeSearch(`${stop.name} ${stop.id}`);
    return tokens.every(token => text.includes(token));
  }).sort((a, b) => {
    const phrase = normalizeSearch(query);
    const prefixA = normalizeSearch(a.name).startsWith(phrase);
    const prefixB = normalizeSearch(b.name).startsWith(phrase);
    return Number(prefixB) - Number(prefixA) || collator.compare(a.name, b.name);
  });
}

export function stopsInBounds(stops, bounds) {
  return stops.filter(stop => stop.lat >= bounds.south && stop.lat <= bounds.north
    && stop.lon >= bounds.west && stop.lon <= bounds.east);
}

export function distanceInMeters(a, b) {
  const radians = value => value * Math.PI / 180;
  const lat = radians(b.lat - a.lat);
  const lon = radians(b.lon - a.lon);
  const h = Math.sin(lat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(lon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
