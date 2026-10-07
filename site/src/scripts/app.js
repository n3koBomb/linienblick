import * as L from '/public/vendor/leaflet/leaflet-src.esm.js';
import { distanceInMeters, searchStops, stopsInBounds, validateDataset } from './stops.js';

const CENTER = [51.2277, 6.7735];
const byId = id => document.getElementById(id);
const searchInput = byId('search-input');
const searchResults = byId('search-results');
const clearSearchButton = byId('clear-search');
const viewportOnly = byId('viewport-only');
const list = byId('stop-results');
const status = byId('map-status');
const lineSelect = byId('line-select');
const patternSelect = byId('pattern-select');
const number = new Intl.NumberFormat('de');
const mapConfig = window.LINIENBLICK_MAP_CONFIG;
let stops = [];
let stopById = new Map();
let stopsSource = null;
let lines = [];
let stopLines = new Map();
let linesLoaded = false;
let linesFailed = false;
let selectedId = null;
let location = null;
let positionMarker;
let accuracyCircle;
let pending = false;

const map = L.map('map', { zoomControl: false, minZoom: mapConfig.minZoom, maxZoom: mapConfig.maxZoom }).setView(CENTER, 13);
L.control.zoom({ position: 'bottomright', zoomInTitle: 'Vergrößern', zoomOutTitle: 'Verkleinern' }).addTo(map);
const locateButton = document.createElement('button');
locateButton.type = 'button';
locateButton.className = 'locate-icon-button';
locateButton.title = 'Mein Standort';
locateButton.setAttribute('aria-label', 'Mein Standort');
locateButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m21 3-7.2 18-3.1-8.7L2 9.2 21 3Z"></path><path d="m10.7 12.3 4.6-4.6"></path></svg>';
const locateControl = L.control({ position: 'bottomright' });
locateControl.onAdd = () => locateButton;
locateControl.addTo(map);
const tiles = L.tileLayer(mapConfig.tileUrl, { maxZoom: mapConfig.maxZoom, attribution: mapConfig.attribution}).addTo(map);
map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
const markers = L.layerGroup().addTo(map);
const renderer = L.canvas({ padding: 0 });
const routeLayer = L.layerGroup().addTo(map);
const selectionLayer = L.layerGroup().addTo(map);
let tileFailures = 0;
tiles.on('loading', () => { tileFailures = 0; });
tiles.on('tileerror', () => { tileFailures++; byId('tile-warning').hidden = false; });
tiles.on('load', () => { if (tileFailures === 0) byId('tile-warning').hidden = true; });
byId('retry-tiles').addEventListener('click', () => tiles.redraw());

function visibleStops() {
  const bounds = map.getBounds();
  return stopsInBounds(stops, { south: bounds.getSouth(), north: bounds.getNorth(), west: bounds.getWest(), east: bounds.getEast() });
}

function popupContent(stop) {
  const box = document.createElement('div');
  const heading = document.createElement('strong');
  heading.textContent = stop.name;
  const text = document.createElement('p');
  text.textContent = 'Ausgewählte Haltestelle · Düsseldorf';
  const section = document.createElement('section');
  section.className = 'stop-popup-lines';
  const label = document.createElement('strong');
  label.className = 'stop-popup-lines-title';
  label.textContent = 'Linien';
  section.append(label);

  const servedLines = stopLines.get(stop.id) || [];
  if (servedLines.length) {
    const chips = document.createElement('div');
    chips.className = 'stop-line-chips';
    for (const line of servedLines) {
      const chip = document.createElement('span');
      chip.className = 'stop-line-chip';
      chip.textContent = line.name;
      chip.title = [modeLabels[line.mode] || 'Linie', line.agencyName, line.longName].filter(Boolean).join(' · ');
      chip.style.setProperty('--line-color', lineColor(line));
      chips.append(chip);
    }
    section.append(chips);
  } else {
    const empty = document.createElement('span');
    empty.className = 'stop-popup-lines-empty';
    empty.textContent = linesLoaded
      ? 'Keine Linien im geladenen Ausschnitt.'
      : linesFailed ? 'Linieninformationen konnten nicht geladen werden.' : 'Linien werden geladen …';
    section.append(empty);
  }

  box.append(heading, text, section);
  return box;
}

function refreshSelectedPopup() {
  const stop = stopById.get(selectedId);
  if (!stop) return;
  selectionLayer.eachLayer(marker => marker.setPopupContent(popupContent(stop)));
}

function renderMarkers() {
  markers.clearLayers();
  const visible = visibleStops();
  byId('map-stop-count').textContent = map.getZoom() < 13
    ? 'Haltestellen ab Zoomstufe 13 sichtbar.'
    : `${number.format(visible.length)} Haltestellen im Ausschnitt`;
  if (map.getZoom() < 13) return;
  for (const stop of visible) {
    if (stop.id === selectedId) continue;
    L.circleMarker([stop.lat, stop.lon], { renderer, radius: map.getZoom() >= 15 ? 6 : 4,
      color: '#006b98', weight: 1.5, fillColor: '#ffffff', fillOpacity: 1,
    }).on('click', () => selectStop(stop, false)).addTo(markers);
  }
}

function updateSelectionButtons() {
  for (const button of list.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.stopId === selectedId));
  }
}

function selectStop(stop, navigate = true) {
  selectedId = stop.id;
  searchResults.hidden = true;
  byId('selected-name').textContent = stop.name;
  byId('selected-description').textContent = 'Zusammengefasster Haltestellenort aus dem VRR-Feed. Zugehörige Linienverläufe kannst du links auswählen.';
  const osm = new URL('https://www.openstreetmap.org/');
  osm.searchParams.set('mlat', String(stop.lat));
  osm.searchParams.set('mlon', String(stop.lon));
  osm.hash = `map=17/${stop.lat}/${stop.lon}`;
  byId('osm-stop-link').href = osm.href;
  byId('selected-stop').hidden = false;
  selectionLayer.clearLayers();
  L.circleMarker([stop.lat, stop.lon], { radius: 10, color: '#e30018', weight: 3,
    fillColor: '#ffffff', fillOpacity: 1,
  }).bindPopup(popupContent(stop), { maxWidth: 300, maxHeight: 320 }).addTo(selectionLayer).openPopup();
  if (navigate) map.setView([stop.lat, stop.lon], Math.max(map.getZoom(), 16));
  updateSelectionButtons();
  renderMarkers();
  const url = new URL(window.location.href);
  url.searchParams.set('stop', stop.id);
  url.hash = 'karte';
  history.replaceState(null, '', url);
  status.textContent = `${stop.name} ausgewählt.`;
}

function clearSelection() {
  selectedId = null;
  selectionLayer.clearLayers();
  byId('selected-stop').hidden = true;
  updateSelectionButtons();
  renderMarkers();
  const url = new URL(window.location.href);
  url.searchParams.delete('stop');
  history.replaceState(null, '', url);
  status.textContent = 'Haltestellenauswahl aufgehoben.';
  searchInput.focus();
}

function updateResults() {
  if (pending || stops.length === 0) return;
  const query = searchInput.value.trim();
  const hasSearch = query.length > 0 || viewportOnly.checked;
  clearSearchButton.hidden = !query;
  searchResults.hidden = !hasSearch;
  if (!hasSearch) return;

  const matches = searchStops(viewportOnly.checked ? visibleStops() : stops, query);
  if (!query) {
    const center = location || { lat: map.getCenter().lat, lon: map.getCenter().lng };
    matches.sort((a, b) => distanceInMeters(center, a) - distanceInMeters(center, b));
  }
  byId('results-title').textContent = 'Haltestellen';
  byId('result-count').textContent = `${number.format(matches.length)} Treffer`;
  const message = byId('results-message');
  message.hidden = matches.length > 0 && matches.length <= 40;
  message.textContent = matches.length === 0
    ? 'Keine Haltestelle gefunden. Ändere die Suche oder den Kartenausschnitt.'
    : 'Die ersten 40 Treffer werden angezeigt. Mit einem genaueren Namen findest du schneller dein Ziel.';
  const fragment = document.createDocumentFragment();
  for (const stop of matches.slice(0, 40)) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.stopId = stop.id;
    button.setAttribute('aria-pressed', String(stop.id === selectedId));
    const icon = document.createElement('span');
    icon.className = 'result-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'H';
    const text = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = stop.name;
    const description = document.createElement('span');
    description.className = 'result-description';
    description.textContent = location
      ? `${number.format(Math.round(distanceInMeters(location, stop)))} m Luftlinie`
      : 'Haltestelle · Düsseldorf';
    text.append(title, description);
    const arrow = document.createElement('span');
    arrow.className = 'result-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    button.append(icon, text, arrow);
    button.addEventListener('click', () => selectStop(stop));
    row.append(button);
    fragment.append(row);
  }
  list.replaceChildren(fragment);
}

async function loadStops() {
  if (pending) return;
  pending = true;
  searchInput.disabled = viewportOnly.disabled = true;
  byId('retry-stops').hidden = true;
  byId('results-message').hidden = false;
  byId('results-message').textContent = 'Haltestellen werden geladen.';
  list.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/public/data/stops-duesseldorf.json', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dataset = validateDataset(await response.json());
    stops = dataset.stops;
    stopsSource = dataset.source || null;
    stopById = new Map(stops.map(stop => [stop.id, stop]));
    const version = String(dataset.source?.version || '');
    const date = /^\d{8}$/.test(version) ? `${version.slice(6, 8)}.${version.slice(4, 6)}.${version.slice(0, 4)}` : 'unbekannt';
    byId('feed-version').textContent = `${number.format(stops.length)} Haltestellen · Stand ${date}`;
    searchInput.disabled = viewportOnly.disabled = false;
    status.textContent = `Karte bereit. ${number.format(stops.length)} Haltestellen verfügbar.`;
  } catch (error) {
    searchResults.hidden = false;
    byId('results-message').hidden = false;
    byId('results-message').textContent = 'Haltestellen konnten nicht geladen werden. Die Kartenbedienung bleibt verfügbar.';
    byId('result-count').textContent = 'Nicht geladen';
    byId('retry-stops').hidden = false;
    status.textContent = 'Haltestellendaten nicht verfügbar.';
    console.error('Haltestellendaten:', error);
  } finally {
    pending = false;
    list.setAttribute('aria-busy', 'false');
    if (stops.length) {
      updateResults();
      renderMarkers();
      restoreSelection();
    }
  }
}

const modeLabels = {
  stadtbahn: 'Stadtbahn',
  train: 'Zug und S-Bahn',
  tram: 'Straßenbahn',
  bus: 'Bus',
  'rail-other': 'Weiterer Schienenverkehr',
  other: 'Weitere Linien',
};

function lineColor(line) {
  return line.color ? `#${line.color}` : ({
    stadtbahn: '#006b98', train: '#8d3f8f', tram: '#c45117', bus: '#277044',
    'rail-other': '#5d6470', other: '#5d6470',
  })[line.mode] || '#006b98';
}

function renderPattern(line, pattern) {
  routeLayer.clearLayers();
  const patternStops = pattern.stops.map(id => stopById.get(id)).filter(Boolean);
  if (patternStops.length < 2) {
    byId('line-help').textContent = 'Für diesen Verlauf fehlen Haltestellenkoordinaten.';
    return;
  }

  const coordinates = patternStops.map(stop => [stop.lat, stop.lon]);
  const color = lineColor(line);
  L.polyline(coordinates, { color: '#ffffff', weight: 9, opacity: .95, lineCap: 'round', lineJoin: 'round' }).addTo(routeLayer);
  L.polyline(coordinates, { color, weight: 5, opacity: .95, lineCap: 'round', lineJoin: 'round' }).addTo(routeLayer);
  for (const stop of new Map(patternStops.map(stop => [stop.id, stop])).values()) {
    L.circleMarker([stop.lat, stop.lon], {
      renderer, radius: 5, color, weight: 2, fillColor: '#ffffff', fillOpacity: 1,
    }).bindTooltip(stop.name).on('click', () => selectStop(stop, false)).addTo(routeLayer);
  }
  map.fitBounds(L.latLngBounds(coordinates), { padding: [32, 32], maxZoom: 16 });
  byId('line-help').textContent = `${line.name} · ${modeLabels[line.mode] || 'Linie'} · ${patternStops.length} Haltestellen · ${number.format(pattern.tripCount)} Fahrten im Feed. Zwischen den Haltestellen ist der Verlauf schematisch.`;
}

function chooseLine() {
  const line = lines.find(item => item.id === lineSelect.value);
  routeLayer.clearLayers();
  patternSelect.replaceChildren(new Option(line ? 'Fahrtrichtung wählen …' : 'Erst Linie auswählen', ''));
  patternSelect.disabled = !line;
  if (!line) {
    byId('line-help').textContent = 'Wähle eine Linie, um einen Fahrtverlauf auf der Karte zu sehen.';
    return;
  }

  const patternLabels = new Map();
  const prepared = line.patterns.map((pattern, index) => {
    const first = stopById.get(pattern.stops[0])?.name || 'Außerhalb des Ausschnitts';
    const last = stopById.get(pattern.stops.at(-1))?.name || 'Außerhalb des Ausschnitts';
    const label = pattern.headsign || `${first} → ${last}`;
    patternLabels.set(label, (patternLabels.get(label) || 0) + 1);
    return { pattern, index, label };
  });
  const seenLabels = new Map();
  for (const { pattern, index, label } of prepared) {
    const duplicate = patternLabels.get(label) > 1;
    const variant = (seenLabels.get(label) || 0) + 1;
    seenLabels.set(label, variant);
    const description = duplicate ? `${label} · Variante ${variant}` : label;
    patternSelect.add(new Option(`${description} · ${pattern.stops.length} Halte · ${number.format(pattern.tripCount)} Fahrten`, String(index)));
  }
  patternSelect.disabled = line.patterns.length === 0;
  if (line.patterns.length) {
    patternSelect.value = '0';
    renderPattern(line, line.patterns[0]);
  }
  else byId('line-help').textContent = 'Für diese Linie liegt im Düsseldorfer Ausschnitt keine Fahrt mit mindestens zwei Haltestellen vor.';
}

async function loadLines() {
  try {
    const response = await fetch('/public/data/lines-duesseldorf.json', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dataset = await response.json();
    if (!Array.isArray(dataset.lines) || dataset.lines.length === 0) throw new Error('Keine Linien im Datensatz');
    if (dataset.source?.stopsVersion !== stopsSource?.version
      || dataset.source?.stopsSha256 !== stopsSource?.stopsSha256) {
      throw new Error('Linien- und Haltestellendatensatz haben unterschiedliche Versionen.');
    }
    lines = dataset.lines;
    stopLines = new Map();
    for (const line of lines) {
      const servedStops = new Set(line.patterns.flatMap(pattern => pattern.stops));
      for (const stopId of servedStops) {
        if (!stopLines.has(stopId)) stopLines.set(stopId, []);
        stopLines.get(stopId).push(line);
      }
    }
    linesLoaded = true;
    linesFailed = false;
    refreshSelectedPopup();
    const placeholder = new Option('Linie auswählen …', '');
    const groups = new Map();
    for (const [mode, label] of Object.entries(modeLabels)) {
      const group = document.createElement('optgroup');
      group.label = label;
      groups.set(mode, group);
    }
    for (const line of lines) {
      const group = groups.get(line.mode) || groups.get('other');
      const identity = line.agencyName || line.longName || line.id;
      const option = new Option(`${line.name} · ${identity}`, line.id);
      option.title = line.longName || identity;
      group.append(option);
    }
    lineSelect.replaceChildren(placeholder, ...[...groups.values()].filter(group => group.children.length));
    lineSelect.disabled = false;
    byId('line-count').textContent = `${number.format(lines.length)} Linien`;
    lineSelect.addEventListener('change', chooseLine);
    patternSelect.addEventListener('change', () => {
      const line = lines.find(item => item.id === lineSelect.value);
      const pattern = line?.patterns[Number(patternSelect.value)];
      if (line && pattern) renderPattern(line, pattern);
    });
  } catch (error) {
    linesFailed = true;
    refreshSelectedPopup();
    byId('line-count').textContent = 'Nicht geladen';
    byId('line-help').textContent = 'Linienverläufe konnten nicht geladen werden.';
    console.error('GTFS-Linien:', error);
  }
}

function restoreSelection() {
  const url = new URL(window.location.href);
  const legacyHash = window.location.hash.startsWith('#stop=')
    ? new URLSearchParams(window.location.hash.slice(1)).get('stop') : null;
  const id = url.searchParams.get('stop') || legacyHash;
  const stop = stops.find(item => item.id === id);
  if (stop && selectedId !== id) selectStop(stop);
}

function showView() {
  const isAbout = window.location.hash === '#projektinfo';
  document.body.dataset.view = isAbout ? 'about' : 'map';
  byId('karte').hidden = isAbout;
  byId('projektinfo').hidden = !isAbout;
  for (const link of document.querySelectorAll('.site-nav a')) {
    const current = link.hash === (isAbout ? '#projektinfo' : '#karte');
    if (current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  document.title = isAbout
    ? 'Über LinienBlick – unabhängiges Projekt für Düsseldorf'
    : 'LinienBlick – Karte und Haltestellen für Düsseldorf';
  if (!isAbout) requestAnimationFrame(() => map.invalidateSize());
}

byId('stop-search').addEventListener('submit', event => {
  event.preventDefault();
  list.querySelector('button')?.click();
});
searchInput.addEventListener('input', updateResults);
clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  updateResults();
  searchInput.focus();
});
viewportOnly.addEventListener('change', updateResults);
byId('retry-stops').addEventListener('click', loadStops);
byId('clear-selection').addEventListener('click', clearSelection);
map.on('moveend', () => {
  renderMarkers();
  if (viewportOnly.checked) updateResults();
});
window.addEventListener('hashchange', () => {
  showView();
  restoreSelection();
});

function locationDone(message) {
  locateButton.disabled = false;
  locateButton.removeAttribute('aria-busy');
  locateButton.setAttribute('aria-label', 'Mein Standort');
  locateButton.title = 'Mein Standort';
  status.textContent = message;
}
locateButton.addEventListener('click', () => {
  if (!window.isSecureContext || !navigator.geolocation) {
    status.textContent = 'Standort ist hier nicht verfügbar. Nutze HTTPS oder suche eine Haltestelle.';
    return;
  }
  locateButton.disabled = true;
  locateButton.setAttribute('aria-busy', 'true');
  locateButton.setAttribute('aria-label', 'Standort wird gesucht');
  locateButton.title = 'Standort wird gesucht';
  status.textContent = 'Dein Browser fragt bei Bedarf nach der Standortfreigabe.';
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude, accuracy } = position.coords;
    location = { lat: latitude, lon: longitude };
    if (positionMarker) map.removeLayer(positionMarker);
    if (accuracyCircle) map.removeLayer(accuracyCircle);
    accuracyCircle = L.circle([latitude, longitude], { radius: accuracy, color: '#006b98', weight: 1,
      fillColor: '#009fdf', fillOpacity: 0.1, interactive: false }).addTo(map);
    positionMarker = L.circleMarker([latitude, longitude], { radius: 8, color: '#ffffff', weight: 3,
      fillColor: '#006b98', fillOpacity: 1 }).bindTooltip('Dein ungefährer Standort').addTo(map);
    map.setView([latitude, longitude], 15);
    updateResults();
    const nearby = stops.some(stop => distanceInMeters(location, stop) < 5000);
    locationDone(nearby
      ? `Standort gefunden. Genauigkeit ungefähr ${number.format(Math.round(accuracy))} Meter.`
      : 'Standort gefunden. Für diese Umgebung liegen keine Düsseldorfer Haltestellen vor. Nutze die Suche für Düsseldorf.');
  }, error => {
    const messages = { 1: 'Standortfreigabe abgelehnt. Du kannst weiter über die Haltestellensuche navigieren.',
      2: 'Standort konnte nicht bestimmt werden. Versuche es erneut oder nutze die Suche.',
      3: 'Standortsuche hat zu lange gedauert. Versuche es erneut oder nutze die Suche.' };
    locationDone(messages[error.code] || 'Standort nicht verfügbar. Nutze die Haltestellensuche.');
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
});

new ResizeObserver(() => map.invalidateSize()).observe(byId('map'));
showView();
loadStops().then(() => { if (stops.length) loadLines(); });
