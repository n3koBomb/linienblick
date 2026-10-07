# LinienBlick: Farben, Icon und rechtliche Einordnung

Stand: 07.10.2026. Geprüft wurden öffentliche Primärquellen zur Gestaltung und zum Kennzeichenrecht. Dies ist eine begrenzte Einschätzung, keine verbindliche Freigabe oder vollständige Markenregisterrecherche.

## Ergebnis für diesen Entwurf

Ein eigener Düsseldorf-bezogener Webauftritt mit Rot, Blau, Weiß, Schwarz und Grau ist grundsätzlich möglich. Die veröffentlichten Farbwerte allein sind aber keine Lizenz für das gesamte städtische Corporate Design. Farben und Farbkombinationen können unter bestimmten Voraussetzungen selbst markenrechtlich geschützt sein. Schutzumfang, konkrete Nutzung und Verwechslungsgefahr bleiben entscheidend. Für die vorliegende eigenständige Gestaltung erscheint die dekorative Farbnutzung vertretbar; garantiert konfliktfrei ist sie damit nicht.

„Für Düsseldorf“ beschreibt hier den geografischen Bezug. Beschreibende geografische Angaben sind nach § 23 MarkenG grundsätzlich unter Beachtung der anständigen Gepflogenheiten nutzbar. Daraus folgt keine städtische Unterstützung oder Lizenz.

Die Stadt weist darauf hin, dass das klassische Wappen und ihre übrigen Logos und Wort-/Bildmarken nicht allgemein zur Nutzung freigegeben sind. Ein separates Wappenzeichen ist unter den veröffentlichten Bedingungen unverändert nutzbar. Es wird in diesem Entwurf nicht verwendet. Bahn, Rheinturm und Rheinlinie sind eigenständig gestaltete Motive ohne amtlichen Anspruch.

Der private Absender wird im Footer klar benannt. Eine solche Erklärung ersetzt nicht die nötige gestalterische Eigenständigkeit: Bei einem insgesamt irreführenden Auftritt würde ein Hinweis allein nicht genügen. Die eigene Marke LinienBlick, die eigene Komposition und die Systemschrift schaffen hier Abstand. Die kostenpflichtige Hausschrift LL Duesseldorf Circular wird nicht übernommen.

Die Einschätzung betrifft Farben und visuellen Auftritt. Sie ist keine Prüfung des späteren Appbetriebs oder sämtlicher Inhalte.

## Farbsystem

| Wert | Rolle |
| --- | --- |
| `#E30018` | Markenrot, große Überschrift im Hellmodus, Icon |
| `#009FDF` | Markenblau, Linien und grafische Orientierung |
| `#000000` | Haupttext und schwarze Iconelemente |
| `#FFFFFF` | Seitenbasis und Iconhintergrund |
| `#A5A5A5` | Dekorative graue Details |
| `#006B98` | Funktionales Blau für kleine Links auf Weiß |
| `#626262` | Lesbarer sekundärer Text auf Weiß |

Die Palette steht in `base.css`. Dunkelmodus und Tastaturfokus haben eigene funktionale Werte. Meldungsarten sollen später zusätzlich zu Farben immer Text oder Symbole erhalten. Das App-Icon enthält keine Aussage über die Gültigkeit eines Tickets oder den Status einer Meldung.

## Dateivarianten

- Hauptmotiv: generiertes PNG, 1254 × 1254 Pixel; Rasterbild, kein SVG-Master.
- App-Icons: PNG mit 192 und 512 Pixeln, Apple-Touch-Icon mit 180 Pixeln.
- Maskable: separates PNG mit 512 Pixeln und zusätzlichem weißem Sicherheitsabstand.
- Favicon: vereinfachtes echtes SVG und ICO mit 16/32/48 Pixeln.
- Social-Vorschau: 1200 × 630 Pixel; lokal vorhanden, öffentliche URL nach Festlegung der Domain aktivieren.

Die Bildgenerierung wurde mit dem vorherigen Icon als Änderungsreferenz ausgeführt. Gestaltungsbrief: eigenes Düsseldorf-Motiv aus roter Bahnfront, schwarzem Rheinturm und blauer Rhein-/Linienkurve auf Weiß; keine städtischen Zeichen, keine Operatorlogos, keine Schrift im Icon.

## Primärquellen

- Düsseldorf Marketing, Farbdefinitionen: https://www.duesseldorf-marketing.de/farben
- Stadt Düsseldorf, Bedingungen und Abgrenzung des Wappenzeichens: https://www.duesseldorf.de/rathaus-online/wappenzeichen-fuer-privaten-gebrauch
- Düsseldorf Marketing, Schriftlizenz: https://www.duesseldorf-marketing.de/schrift
- DPMA, Markenformen/Farbmarken: https://dpma.de/marken/anmeldung/erforderliche_angaben/markenformenundderendarstellung/
- § 3 MarkenG, schutzfähige Zeichen: https://www.gesetze-im-internet.de/markeng/__3.html
- § 14 MarkenG, Umfang des Markenschutzes: https://www.gesetze-im-internet.de/markeng/__14.html
- § 23 MarkenG, beschreibende Angaben: https://www.gesetze-im-internet.de/markeng/__23.html
- § 5 UWG, Irreführung: https://www.gesetze-im-internet.de/uwg_2004/__5.html

## Prüfung des Pakets

Aktive Dateiverweise, interne Sprunglinks, JSON-LD, Manifest-Iconpfade, Bildabmessungen, ICO-Größen und SVG/XML-Struktur wurden geprüft. Alle verwendeten normalen Textfarbpaare erreichen mindestens 4,5:1. Das ursprüngliche Blau auf Weiß erreicht rund 2,99:1, das Grau rund 2,46:1; deshalb sind sie dekorativen Akzenten vorbehalten. Die markanten Bildteile des Maskable-Icons liegen innerhalb des mittigen Sicherheitskreises.

Ein ausgeführter Browsercheck für Desktop, Mobil und Dunkelmodus war in dieser Umgebung nicht möglich. Die responsive Gestaltung und Theme-Regeln wurden statisch geprüft; eine vollständige visuelle und assistive Prüfung bleibt offen.
