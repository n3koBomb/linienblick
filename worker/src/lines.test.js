import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const [lineData, stopData] = await Promise.all([
  readFile(new URL('../../site/public/data/lines-duesseldorf.json', import.meta.url), 'utf8'),
  readFile(new URL('../../site/public/data/stops-duesseldorf.json', import.meta.url), 'utf8'),
]).then(([lines, stops]) => [JSON.parse(lines), JSON.parse(stops)]);
const stopIds = new Set(stopData.stops.map(stop => stop.id));

describe('GTFS-Linienverläufe', () => {
  it('enthält die Linien mit ihren echten GTFS-Verkehrstypen', () => {
    expect(lineData.source.stopsVersion).toBe(stopData.source.version);
    expect(lineData.lines.length).toBeGreaterThan(100);
    expect(new Set(lineData.lines.map(line => line.mode))).toEqual(new Set(['bus', 'train', 'stadtbahn', 'tram', 'rail-other']));
    expect(lineData.lines.every(line => line.agencyName && line.patterns.length > 0)).toBe(true);
  });

  it('hält gleich benannte Linien verschiedener Betreiber getrennt', () => {
    const u79 = lineData.lines.filter(line => line.name === 'U79');
    expect(u79).toHaveLength(2);
    expect(new Set(u79.map(line => line.agencyName))).toEqual(new Set(['Duisburger Verkehrsgesellschaft AG', 'Rheinbahn AG']));
  });

  it('verweist in jedem Fahrtmuster nur auf vorhandene Kartenorte', () => {
    for (const line of lineData.lines) {
      for (const pattern of line.patterns) {
        expect(pattern.stops.length).toBeGreaterThanOrEqual(2);
        expect(pattern.stops.every(id => stopIds.has(id))).toBe(true);
        expect(pattern.tripCount).toBeGreaterThan(0);
      }
    }
  });
});
