import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { distanceInMeters, searchStops, stopsInBounds, validateDataset } from '../site/src/scripts/stops.js';

const dataset = JSON.parse(await readFile(new URL('../site/public/data/stops-duesseldorf.json', import.meta.url)));

test('Düsseldorfer Datensatz enthält eindeutige, gültige Haltestellenorte statt einzelner Steige', () => {
  assert.equal(validateDataset(dataset), dataset);
  assert.ok(dataset.stops.length > 600);
  assert.equal(dataset.stops.filter(stop => stop.name === 'Düsseldorf Hbf').length, 1);
  assert.ok(dataset.stops.every(stop => /^de:05111:[^:]+$/.test(stop.id)));
  assert.ok(dataset.stops.every(stop => !stop.name.includes('Bstg')));
});

test('Suche unterstützt Schreibweisen mit Umlauten und Hauptbahnhof/Hbf', () => {
  const id = 'de:05111:18235';
  assert.equal(searchStops(dataset.stops, 'Duesseldorf Hauptbahnhof')[0].id, id);
  assert.equal(searchStops(dataset.stops, 'Düsseldorf Hbf')[0].id, id);
  assert.ok(searchStops(dataset.stops, 'Heinrich Heine').some(stop => stop.name.includes('Heinrich-Heine')));
  assert.deepEqual(searchStops(dataset.stops, 'eine nicht existierende haltestelle'), []);
});

test('Kartenfilter arbeitet einschließlich der Grenzen und verändert den Datensatz nicht', () => {
  const stops = [{ lat: 51.2, lon: 6.7 }, { lat: 51.3, lon: 6.8 }, { lat: 51.4, lon: 6.9 }];
  assert.deepEqual(stopsInBounds(stops, { south: 51.2, north: 51.3, west: 6.7, east: 6.8 }), stops.slice(0, 2));
  assert.equal(stops.length, 3);
});

test('Fehlerhafte oder doppelte Koordinatendaten werden abgewiesen', () => {
  assert.throws(() => validateDataset({ stops: [] }));
  assert.throws(() => validateDataset({ stops: [dataset.stops[0], dataset.stops[0]] }));
  assert.throws(() => validateDataset({ stops: [{ ...dataset.stops[0], lat: '51.2' }] }));
  assert.throws(() => validateDataset({ stops: [{ ...dataset.stops[0], lat: 0 }] }));
});

test('Standortentfernung ist eine Luftlinie mit sinnvollen Meterwerten', () => {
  assert.equal(distanceInMeters({ lat: 51.2, lon: 6.7 }, { lat: 51.2, lon: 6.7 }), 0);
  const distance = distanceInMeters({ lat: 51.2, lon: 6.7 }, { lat: 51.21, lon: 6.7 });
  assert.ok(distance > 1110 && distance < 1120);
});
