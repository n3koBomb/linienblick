# LinienBlick

Eine unabhängige Karte für Düsseldorf und die Grundlage für ein späteres Kontrolltagebuch. Dieser erste Ausbauschritt ist ohne Anmeldung nutzbar.

## Aktuell verfügbar

- Leaflet-/OpenStreetMap-Karte mit Zoom und Stadtübersicht.
- 630 echte Düsseldorfer Haltestellenorte aus dem bereitgestellten VRR-GTFS-Feed.
- Suche mit Umlautvarianten sowie Hauptbahnhof/Hbf, Auswahl über Liste und Kartenpunkte.
- Optionaler Filter auf den aktuellen Kartenausschnitt.
- Haltestellendetails, OpenStreetMap-Link und teilbare Auswahl per URL-Hash.
- Standortabfrage auf Klick, Genauigkeitskreis und Luftlinienentfernungen; keine Speicherung der Position.
- Responsive Ansicht, Hell-/Dunkelmodus, Tastaturbedienung und verständliche Lade-/Fehlermeldungen.

Die Punkte zeigen Haltestellen, keine Kontrollen. Kontrollberichte, Anmeldung, Linienzuordnung, echte Liniengeometrien, Abfahrten und Statistiken sind noch nicht implementiert. Aus `stops.txt` allein lässt sich die tatsächlich bediente Linie nicht zuverlässig ableiten.

## Lokal starten

Node.js ab 22.12 benötigt:

```sh
npm ci
npm run dev
```

Die im Terminal angezeigte Adresse öffnen, standardmäßig `http://localhost:5173`. Für einen geprüften statischen Build:

```sh
npm test
npm run build
npm run preview
```

Der Inhalt von `dist/` ist die veröffentlichbare Seite. Bei Cloudflare Pages: Build-Befehl `npm run build`, Ausgabeordner `dist`, Repository-Root als Arbeitsverzeichnis. Diese Änderung veröffentlicht die Seite nicht automatisch.

## Struktur

| Pfad | Zweck |
| --- | --- |
| `site/index.html` | App-Oberfläche und Metadaten |
| `site/src/style/` | Basispalette, App-Hülle, Kartenoberfläche |
| `site/src/scripts/app.js` | Karte, Suche, Auswahl, Standort und Fehlermeldungen |
| `site/src/scripts/stops.js` | Suchnormalisierung, Koordinatenprüfung und Entfernung |
| `site/public/data/stops-duesseldorf.json` | Kleiner, vorbereiteter Haltestellen-Ausschnitt |
| `site/public/` | Unverändert kopierte Icons, Manifest, Header und SEO-Dateien |
| `scripts/import_stops.py` | Reproduzierbarer GTFS-Import |
| `worker/` | Platzhalter für das spätere Backend |

Vite veröffentlicht `site/public/` an der URL-Wurzel: `site/public/favicon/icon-192.png` ist unter `/favicon/icon-192.png` erreichbar. `public` ist kein Teil der öffentlichen URL.

## Haltestellendaten aktualisieren

Quelle ist der vom Nutzer bereitgestellte VRR-Feed mit Version `20260825`, gültig laut `feed_info.txt` von 01.07.2026 bis 31.12.2026. Der JSON-Ausschnitt enthält die Herkunft und den SHA-256-Wert der ursprünglichen `stops.txt`. Die Daten stellen Haltestellenorte dar; sie garantieren weder aktuelle Bedienung noch Vollständigkeit aller Verkehrsarten.

```sh
npm run import:stops -- --stops /pfad/stops.txt --feed-info /pfad/feed_info.txt
```

Unter Windows je nach Python-Installation den Befehl direkt mit `py scripts/import_stops.py ...` ausführen.

Der Import wählt DHIDs mit `de:05111:` aus, gruppiert nach Haltestellenkennung und nutzt bevorzugt die Koordinate einer Parent-Station. Ohne Parent wird die Mitte der zugehörigen Punkte verwendet. Steig-Suffixe werden aus Anzeigenamen entfernt; Kennungen bleiben erhalten. Die sehr große `stop_times.txt` wird dafür nicht benötigt und die Rohdateien werden nicht in Git aufgenommen.

## Karte, Standort und Datenschutz

Leaflet 1.9.4 wird lokal über den Build ausgeliefert; es ist kein Laufzeit-CDN nötig. Der Kartenhintergrund wird direkt von `https://tile.openstreetmap.org/` bezogen, mit sichtbarer Attribution und normalen Browser-Cache-Mechanismen. Keine Tile-Vorabdownloads oder Offline-Karten. Der Anbieter erhält technisch bedingt die IP-Adresse und die angefragten Ausschnitte. OSM-Tiles sind ein Dienst ohne Verfügbarkeitsgarantie; vor größerem öffentlichem Betrieb einen geeigneten Anbieter wählen.

Ein alternativer Anbieter kann beim Build mit `VITE_TILE_URL` konfiguriert werden. Seine Attribution/Nutzungsbedingungen müssen dann passend in `app.js` übernommen werden; die OSM-Attribution bleibt für OSM-basierte Kartendaten erforderlich.

Standort wird einmalig nach einem Klick abgefragt, nicht kontinuierlich verfolgt und nicht an ein eigenes Backend übertragen. Browserberechtigung und HTTPS sind erforderlich; localhost funktioniert für die Entwicklung. Keine Standortabfrage beim Seitenaufruf. Die Anfrage eines zum Standort passenden Kartenausschnitts lässt dessen ungefähren Ort für den Kartenanbieter erkennen. Entfernungen sind Luftlinien, keine Fußwege.

## Hosting und erster öffentlicher Start

`_headers`, `robots.txt` und `sitemap.xml` liegen jetzt in `site/public/`, damit Vite sie in den Build übernimmt. `_headers` gilt für statische Cloudflare-Pages-Antworten; Pages Functions/Workers setzen Header im Code. Der lokale Vite-Server und `vite preview` erzwingen diese Header nicht. Die CSP ist weiterhin eine begrenzte Grundlage für Basis-URL, Objekte, Einbettung und Formularziele, keine vollständige Ressourcen-Allowlist.

Die in `index.html` bereits eingetragene Domain `linienblick.com` bleibt erhalten. Die Sitemap/Robots-Vorlage enthält weiterhin einen deutlich gekennzeichneten Domain-Platzhalter und kündigt noch keine Sitemap an. Vor dem Start Domain konsistent eintragen, die echte Bereitstellung prüfen und `noindex` nur bei gewollter Indexierung entfernen. Zusätzliche Sprachseiten sind noch nicht vorhanden; Englisch wurde deshalb nicht als Übersetzung derselben deutschen URL ausgezeichnet.

Die Palette und eigene Symbolik sind in [DESIGN-NOTES.md](./DESIGN-NOTES.md) dokumentiert. Das Projekt ist kein Angebot der Stadt Düsseldorf, Rheinbahn oder des VRR.

## Technische Grundlagen

- https://leafletjs.com/reference-1.9.4.html
- https://operations.osmfoundation.org/policies/tiles/
- https://vite.dev/guide/
- https://gtfs.org/documentation/schedule/reference/
