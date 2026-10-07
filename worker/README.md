# LinienBlick Worker

Der Ordner `worker/` ist das eigenständige Wrangler- und Vitest-Paket. Wrangler lädt die Dateien aus `../site`; ein Vite-Build ist nicht erforderlich.

Die öffentliche Seitenstruktur folgt MIRoKIT: Inhalte liegen in `site/`, während Bilder, Daten, Favicons, Manifest und vendorte Bibliotheken in `site/public/` liegen. `public/` bleibt dabei Teil der URL, zum Beispiel wird `site/public/favicon/favicon.svg` unter `/public/favicon/favicon.svg` ausgeliefert. `robots.txt`, `sitemap.xml` und `_headers` liegen direkt in `site/`.

Die Kartenkachelquelle ist in `site/src/config/map-config.js` austauschbar. Der Prototyp verwendet den deutschen Kartenstil von `tile.openstreetmap.de`. Dessen Betreiber erlaubt Website-Einbindungen nur für nichtkommerzielle Zwecke und begrenzt die Kachelrate pro IP; für einen größeren öffentlichen Betrieb ist daher eine eigene oder vertraglich passende Kachelquelle auszuwählen.

## Linien aus GTFS vorbereiten

Für die Linienauswahl benötigt der Import `stop_times.txt`, `trips.txt`, `routes.txt` und `agency.txt` aus derselben GTFS-Version. Die großen Rohdateien bleiben lokal unter `temp/` und werden nicht veröffentlicht. Der Import erzeugt daraus `site/public/data/lines-duesseldorf.json`:

```sh
cd worker
npm run import:lines
```

Der VRR-Feed enthält keine `shapes.txt`-Geometrien. Die erzeugten Verläufe verbinden daher die geordneten Haltestellenkoordinaten mit geraden Abschnitten; sie bilden keine exakten Straßen- oder Gleisverläufe ab.

## Lokal starten

```sh
cd worker
npm ci
npm run dev
```

Wrangler verwendet lokal `wrangler.local.jsonc` und startet die Vorschau standardmäßig unter `http://localhost:8787`.

## Tests

```sh
cd worker
npm test
npm run test:workers
```

`npm test` führt die Vitest-Tests für Haltestellendaten und Worker-Weiterleitung aus. `npm run test:workers` startet Integrationstests im Cloudflare-Workers-Runtime-Pool und prüft, ob Wrangler die Startseite und statische Dateien ausliefert.

Die Produktionskonfiguration lässt sich ohne Veröffentlichung prüfen:

```sh
npm run deploy -- --dry-run
```
