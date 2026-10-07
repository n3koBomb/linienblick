import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { distanceInMeters, searchStops, stopsInBounds, validateDataset } from '../../site/src/scripts/stops.js';

const dataset = JSON.parse(await readFile(new URL('../../site/public/data/stops-duesseldorf.json', import.meta.url)));

describe('Haltestellendaten', () => {
  it('enthält eindeutige, gültige Haltestellenorte statt einzelner Steige', () => {
    expect(validateDataset(dataset)).toBe(dataset);
    expect(dataset.stops.length).toBeGreaterThan(600);
    expect(dataset.stops.filter(stop => stop.name === 'Düsseldorf Hbf')).toHaveLength(1);
    expect(dataset.stops.every(stop => /^de:05111:[^:]+$/.test(stop.id))).toBe(true);
    expect(dataset.stops.every(stop => !stop.name.includes('Bstg'))).toBe(true);
  });

  it('findet Haltestellen mit Umlautvarianten und Hauptbahnhof/Hbf', () => {
    const id = 'de:05111:18235';
    expect(searchStops(dataset.stops, 'Duesseldorf Hauptbahnhof')[0].id).toBe(id);
    expect(searchStops(dataset.stops, 'Düsseldorf Hbf')[0].id).toBe(id);
    expect(searchStops(dataset.stops, 'Heinrich Heine').some(stop => stop.name.includes('Heinrich-Heine'))).toBe(true);
    expect(searchStops(dataset.stops, 'eine nicht existierende haltestelle')).toEqual([]);
  });

  it('filtert innerhalb der Kartengrenzen, ohne den Datensatz zu verändern', () => {
    const stops = [{ lat: 51.2, lon: 6.7 }, { lat: 51.3, lon: 6.8 }, { lat: 51.4, lon: 6.9 }];
    expect(stopsInBounds(stops, { south: 51.2, north: 51.3, west: 6.7, east: 6.8 })).toEqual(stops.slice(0, 2));
    expect(stops).toHaveLength(3);
  });

  it('weist fehlerhafte oder doppelte Koordinatendaten ab', () => {
    expect(() => validateDataset({ stops: [] })).toThrow();
    expect(() => validateDataset({ stops: [dataset.stops[0], dataset.stops[0]] })).toThrow();
    expect(() => validateDataset({ stops: [{ ...dataset.stops[0], lat: '51.2' }] })).toThrow();
    expect(() => validateDataset({ stops: [{ ...dataset.stops[0], lat: 0 }] })).toThrow();
  });

  it('berechnet die Luftlinienentfernung in plausiblen Metern', () => {
    expect(distanceInMeters({ lat: 51.2, lon: 6.7 }, { lat: 51.2, lon: 6.7 })).toBe(0);
    const distance = distanceInMeters({ lat: 51.2, lon: 6.7 }, { lat: 51.21, lon: 6.7 });
    expect(distance).toBeGreaterThan(1110);
    expect(distance).toBeLessThan(1120);
  });
});
