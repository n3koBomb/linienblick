import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../style/map.css';
import { distanceInMeters, searchStops, stopsInBounds, validateDataset } from './stops.js';

const CENTER = [51.2277, 6.7735];
const POPULAR_IDS = ['de:05111:18235', 'de:05111:18036', 'de:05111:18230', 'de:05111:18249', 'de:05111:18237', 'de:05111:18830'];
const byId = id => document.getElementById(id);
const searchInput = byId('search-input');
const viewportOnly = byId('viewport-only');
const list = byId('stop-results');
const status = byId('map-status');
const number = new Intl.NumberFormat('de');
let stops = [];
let selectedId = null;
let location = null;
let positionMarker;
let accuracyCircle;
let pending = false;

const map = L.map('map', { zoomControl: false, minZoom: 9, maxZoom: 19 }).setView(CENTER, 13);
L.control.zoom({ position: 'bottomright', zoomInTitle: 'Vergrößern', zoomOutTitle: 'Verkleinern' }).addTo(map);
const tiles = L.tileLayer(import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende',
}).addTo(map);
map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
const markers = L.layerGroup().addTo(map);
const renderer = L.canvas({ padding: 0.3 });
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
  box.append(heading, text);
  return box;
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
  byId('selected-name').textContent = stop.name;
  byId('selected-description').textContent = 'Zusammengefasster Haltestellenort aus dem VRR-Feed. Linien und Abfahrten folgen später.';
  const osm = new URL('https://www.openstreetmap.org/');
  osm.searchParams.set('mlat', String(stop.lat));
  osm.searchParams.set('mlon', String(stop.lon));
  osm.hash = `map=17/${stop.lat}/${stop.lon}`;
  byId('osm-stop-link').href = osm.href;
  byId('selected-stop').hidden = false;
  selectionLayer.clearLayers();
  L.circleMarker([stop.lat, stop.lon], { radius: 10, color: '#e30018', weight: 3,
    fillColor: '#ffffff', fillOpacity: 1,
  }).bindPopup(popupContent(stop)).addTo(selectionLayer).openPopup();
  if (navigate) map.setView([stop.lat, stop.lon], Math.max(map.getZoom(), 16));
  updateSelectionButtons();
  renderMarkers();
  history.replaceState(null, '', `#stop=${encodeURIComponent(stop.id)}`);
  status.textContent = `${stop.name} ausgewählt.`;
}

function clearSelection() {
  selectedId = null;
  selectionLayer.clearLayers();
  byId('selected-stop').hidden = true;
  updateSelectionButtons();
  renderMarkers();
  if (window.location.hash.startsWith('#stop=')) history.replaceState(null, '', window.location.pathname + window.location.search);
  status.textContent = 'Haltestellenauswahl aufgehoben.';
  searchInput.focus();
}

function updateResults() {
  if (pending || stops.length === 0) return;
  const query = searchInput.value.trim();
  let matches = searchStops(viewportOnly.checked ? visibleStops() : stops, query);
  const recommended = !query && !viewportOnly.checked && !location;
  if (recommended) {
    matches = POPULAR_IDS.map(id => stops.find(stop => stop.id === id)).filter(Boolean);
  } else if (!query) {
    const center = location || { lat: map.getCenter().lat, lon: map.getCenter().lng };
    matches.sort((a, b) => distanceInMeters(center, a) - distanceInMeters(center, b));
  }
  byId('results-title').textContent = recommended ? 'Schnell gefunden' : 'Haltestellen';
  byId('result-count').textContent = `${number.format(matches.length)} ${recommended ? 'Orte' : 'Treffer'}`;
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
    const response = await fetch('/data/stops-duesseldorf.json', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dataset = validateDataset(await response.json());
    stops = dataset.stops;
    const version = String(dataset.source?.version || '');
    const date = /^\d{8}$/.test(version) ? `${version.slice(6, 8)}.${version.slice(4, 6)}.${version.slice(0, 4)}` : 'unbekannt';
    byId('feed-version').textContent = `${number.format(stops.length)} Haltestellen · Stand ${date}`;
    searchInput.disabled = viewportOnly.disabled = false;
    status.textContent = `Karte bereit. ${number.format(stops.length)} Haltestellen verfügbar.`;
  } catch (error) {
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

function restoreSelection() {
  if (!window.location.hash.startsWith('#stop=')) return;
  const id = new URLSearchParams(window.location.hash.slice(1)).get('stop');
  const stop = stops.find(item => item.id === id);
  if (stop && selectedId !== id) selectStop(stop);
}

byId('stop-search').addEventListener('submit', event => {
  event.preventDefault();
  list.querySelector('button')?.click();
});
searchInput.addEventListener('input', updateResults);
viewportOnly.addEventListener('change', updateResults);
byId('retry-stops').addEventListener('click', loadStops);
byId('clear-selection').addEventListener('click', clearSelection);
byId('reset-map').addEventListener('click', () => {
  map.setView(CENTER, 13);
  status.textContent = 'Karte auf Düsseldorf zurückgesetzt.';
});
map.on('moveend', () => {
  renderMarkers();
  if (viewportOnly.checked) updateResults();
});
window.addEventListener('hashchange', restoreSelection);

const locateButton = byId('locate-me');
function locationDone(message) {
  locateButton.disabled = false;
  locateButton.removeAttribute('aria-busy');
  locateButton.querySelector('span').textContent = 'Mein Standort';
  status.textContent = message;
}
locateButton.addEventListener('click', () => {
  if (!window.isSecureContext || !navigator.geolocation) {
    status.textContent = 'Standort ist hier nicht verfügbar. Nutze HTTPS oder suche eine Haltestelle.';
    return;
  }
  locateButton.disabled = true;
  locateButton.setAttribute('aria-busy', 'true');
  locateButton.querySelector('span').textContent = 'Standort wird gesucht …';
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
      : 'Standort gefunden. Für diese Umgebung liegen keine Düsseldorfer Haltestellen vor. Mit Stadtübersicht kommst du zurück.');
  }, error => {
    const messages = { 1: 'Standortfreigabe abgelehnt. Du kannst weiter über die Haltestellensuche navigieren.',
      2: 'Standort konnte nicht bestimmt werden. Versuche es erneut oder nutze die Suche.',
      3: 'Standortsuche hat zu lange gedauert. Versuche es erneut oder nutze die Suche.' };
    locationDone(messages[error.code] || 'Standort nicht verfügbar. Nutze die Haltestellensuche.');
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
});

new ResizeObserver(() => map.invalidateSize()).observe(byId('map'));
loadStops();
