# LinienBlick

**Öffentliche Karten- und Dokumentations-App für Fahrkartenkontrollen im Düsseldorfer Nahverkehr.**

LinienBlick soll eine große, interaktive Karte von Düsseldorf mit Bahnlinien, Haltestellen und dokumentierten Fahrkartenkontrollen verbinden. Nutzer können eine selbst erlebte oder beobachtete Kontrolle als Bericht eintragen. Andere Besucher sehen diese Berichte auf der Karte und können vergangene Meldungen sowie zusammengefasste Statistiken nachvollziehen.

Dieses README erklärt die Projektidee, die bisher getroffenen Entscheidungen, die Ergebnisse der Verkehrsdatenprüfung und die nächsten Umsetzungsschritte. Es richtet sich sowohl an Menschen, die das Projekt verstehen möchten, als auch an spätere Entwickler.

**Dokumentationsstand: 7. Oktober 2026.** Der hier beschriebene Implementierungsstand bezieht sich auf die in diesem Konzeptgespräch nachgewiesene Arbeit. Der aktuelle Code im Repository wurde für dieses Dokument nicht geprüft. Geplante Funktionen werden deshalb ausdrücklich als geplant dargestellt.

Zugehöriges Repository: [n3koBomb/linienbahn](https://github.com/n3koBomb/linienbahn).

## 1. Zweck und Grundidee

LinienBlick soll Beobachtungen zu Fahrkartenkontrollen strukturiert dokumentieren und öffentlich nachvollziehbar machen. Im Mittelpunkt stehen das Ereignis, sein Zeitpunkt, die betreffende Verbindung und der zugehörige Ort.

Die App ist als unabhängiges Dokumentationsprojekt vorgesehen. Sie soll weder als offizielle Anwendung der Rheinbahn oder der Stadt Düsseldorf auftreten noch zur Fahrt ohne gültigen Fahrschein auffordern. Auf der Oberfläche soll ihr Zweck verständlich erklärt werden.

Es sollen Ereignisse dokumentiert werden, ohne einzelne Kontrolleure zu identifizieren. Namen, Fotos und Personenbeschreibungen von Mitarbeitern sind im vorgesehenen Meldeformular nicht enthalten.

Öffentliche Nutzermeldungen können eine hilfreiche Dokumentation bilden, garantieren aber keine vollständige Erfassung aller tatsächlichen Kontrollen. Diese Grenze muss auch bei Auswertungen erkennbar bleiben.

## 2. Beschlossene Anforderungen und offene Vorschläge

| Thema | Stand |
| --- | --- |
| Schwerpunkt Düsseldorf und Rheinbahn | Beschlossen |
| Große Karte auf Basis von OpenStreetMap | Beschlossen |
| Karte, Meldungen und Statistiken öffentlich sichtbar | Beschlossen |
| Meldungen regulär sofort veröffentlichen | Beschlossen |
| Technisch bedingte Verzögerungen bei Überlastung oder Verbindungsproblemen | Beschlossen |
| Linien mit Haltestellenfolge auf der Karte anzeigen | Beschlossen; schematische GTFS-Verläufe sind umgesetzt, genaue Streckengeometrien fehlen noch |
| Rote Meldungspunkte an zugeordneten Haltestellen | Beschlossen |
| Einzelne Berichte unterscheidbar halten | Beschlossen |
| Öffentliche Anzeige der gerade aktiven Besucher | Beschlossen; genaue Zählregeln sind vorgeschlagen |
| Responsive Web-App als erste Umsetzung | Vorgeschlagen |
| Anschauen ohne Anmeldung; Meldungen mit Account erstellen | Vorgeschlagen, noch nicht abschließend entschieden |
| Nutzer mit Nickname statt öffentlichem Klarnamen | Vorgeschlagen |
| Detailfelder, Filter, Aufbewahrung und Export | Teilweise ausgearbeitet; endgültige Einstellungen offen |

Eine absichtliche Veröffentlichung erst am Folgetag wurde zunächst vorgeschlagen, anschließend aber zugunsten einer sofortigen Veröffentlichung verworfen. Verzögerungen sind als technische Ausnahme vorgesehen.

## 3. Bereits erledigte Arbeit

Die Projektidee und der grundlegende Bedienablauf wurden gemeinsam ausgearbeitet. Außerdem wurden zehn lokale GTFS-Dateien vollständig eingelesen und auf zentrale Verknüpfungen geprüft.

Dabei wurden insbesondere ermittelt:

- Anzahl der Datensätze und vorhandene Spalten.
- Rheinbahn-Betreiberkennungen und zugehörige Linien und Fahrten.
- Haltestellenkoordinaten und Stationszuordnungen.
- Vorhandene Richtungskennungen und fehlende Zielbeschriftungen.
- Betriebskennungen, Kalenderdaten und Tagesausnahmen.
- Verweise zwischen Unternehmen, Linien, Fahrten, Stationen und Umsteigebeziehungen.
- Fehlende Streckengeometrien im hochgeladenen Datenbestand.

Die Datenanalyse ist umgesetzt. Der Kartenprototyp zeigt Haltestellen sowie auswählbare, schematische Linienverläufe aus der GTFS-Haltestellenfolge. Die Karte füllt den Bildschirm; Suche, Treffer und Haltestelleninformationen liegen als schwebende Elemente darüber. Karte und Projektinformationen sind getrennte Ansichten. Eine produktive Speicherung, Nutzerverwaltung oder geografisch genaue Streckengeometrie ist damit nicht umgesetzt.

## 4. Geplante Oberfläche

### Kartenansicht

Die Karte ist der Hauptbereich der Anwendung und nutzt den größten Teil des Bildschirms. Sie soll Orientierung ermöglichen und gleichzeitig die dokumentierten Ereignisse sichtbar machen.

Vorgesehene Bedienelemente:

- Suche nach Haltestelle oder Ort.
- Zoomsteuerung und Schaltfläche „Mein Standort“.
- Linienauswahl und Zeitraumfilter.
- Gut erreichbarer Button „Kontrolle dokumentieren“.
- Wechsel zur Meldungsliste als Alternative zur Kartenbedienung.
- Kleine Online-Anzeige im oberen Bereich.
- Sichtbare Quellenangabe für die Kartengrundlage.

Auf dem Handy öffnen sich Details in einem hochziehbaren Bereich am unteren Bildschirmrand. Auf einem größeren Bildschirm ist eine Seitenleiste vorgesehen, während die Karte sichtbar bleibt.

Als spätere Navigation wurden „Karte“, „Meine Berichte“, „Auswertung“ und „Einstellungen“ vorgeschlagen. Für den ersten Prototyp stehen vier Ansichten im Vordergrund: Karte, Meldeformular, Meldungsdetails und Meldungsliste.

### Gestaltung und Zugänglichkeit

Die Oberfläche soll verständlich, ruhig und auch unterwegs gut bedienbar sein. Dazu gehören ausreichend große Schaltflächen, lesbare Schrift, klare Feldbeschriftungen, sichtbarer Tastaturfokus und verständliche Rückmeldungen.

Die Listenansicht muss dieselben wesentlichen Informationen und Aktionen wie die Karte anbieten. Bedeutungen dürfen nicht ausschließlich durch Farbe vermittelt werden. Rote Punkte erhalten deshalb ergänzende Beschriftungen beziehungsweise zugängliche Namen.

Als Gestaltungsrichtung wurde im weiteren Projektkontext eine Düsseldorf-orientierte Palette aus Rot, Blau, Weiß, Schwarz und Grau vorgeschlagen:

| Farbe | HEX | Vorgesehene Verwendung |
| --- | --- | --- |
| Rot | `#E30018` | Meldungsmarkierungen und gezielte Hervorhebungen |
| Blau | `#009FDF` | Markenakzent und ausgewählte Bedienelemente |
| Schwarz | `#000000` | Text und starke Kontraste |
| Weiß | `#FFFFFF` | Helle Flächen |
| Grau | `#A5A5A5` | Ergänzende Flächen und dekorative Elemente |

Die tatsächlichen Farbkombinationen müssen auf Lesbarkeit geprüft werden. Die Palette allein gewährleistet keine barrierefreie Darstellung. Eine abschließende Logoentscheidung und eine Prüfung der Verwendung offizieller Kennzeichen sind hier nicht dokumentiert.

## 5. Aufbau der Karte

Die Kartenansicht besteht aus drei getrennten Ebenen:

| Ebene | Inhalt |
| --- | --- |
| Grundkarte | Straßen, Stadtteile und Orientierungspunkte aus OpenStreetMap |
| Verkehrsnetz | Bahnlinien, Fahrtrichtungen, Streckenvarianten und Haltestellen |
| Dokumentation | Öffentliche Kontrollberichte als rote Meldungspunkte |

### Bahnlinien

Eine ausgewählte Linie soll von ihrer Start- bis zur Endhaltestelle mit allen Zwischenhalten dargestellt werden. Die Karte passt ihren Ausschnitt an den ausgewählten Verlauf an. Die aktive Linie wird hervorgehoben; weitere Linien bleiben zurückhaltend sichtbar.

Hin- und Rückrichtung sowie abweichende Fahrtvarianten müssen berücksichtigt werden. Eine Linie kann Düsseldorf verlassen. Als Vorschlag soll deshalb der vollständige Verlauf sichtbar sein, statt ihn am Stadtrand abzuschneiden.

Linienfarben müssen so eingesetzt werden, dass sie von den roten Ereignismarkierungen unterscheidbar bleiben. Hinterlegte GTFS-Farben sind verfügbar, müssen aber nicht ungeprüft für die gesamte Karte übernommen werden.

### Haltestellen und Bahnsteige

Eine Haltestelle kann im GTFS-Datensatz aus mehreren Einträgen bestehen: übergeordnete Station, einzelne Bahnsteige und weitere Haltepunkte. In der Kartenübersicht sollen zusammengehörige Einträge als verständliche Haltestelle erscheinen. Im Meldeformular kann der genaue Bahnsteig zusätzlich ausgewählt werden.

Die Zusammenfassung erfolgt anhand der vorhandenen Stationsbeziehungen und geeigneter Kennungen. Gleiche Namen allein reichen nicht als eindeutige Zuordnung.

### Rote Meldungspunkte

Ein Punkt kennzeichnet den dokumentierten Beobachtungsort. Mehrere Berichte an derselben Haltestelle bleiben einzeln zugänglich. Beim Antippen öffnet sich eine Liste beziehungsweise die Detailansicht.

Beim Herauszoomen können nahe beieinanderliegende Punkte zu einem Sammelpunkt mit einer Zahl zusammengefasst werden. Beim Hineinzoomen oder Öffnen werden die einzelnen Orte und Berichte erreichbar.

Für Kontrollen zwischen zwei Haltestellen soll ein Abschnitt auswählbar sein. Die Darstellung muss erkennen lassen, dass die Beobachtung zwischen den Halten stattfand. Die genaue Darstellung dieses Falls ist noch auszuarbeiten.

## 6. Kontrollberichte und Meldeformular

In der Oberfläche wird „Kontrollbericht“ oder „Meldung“ verwendet. Der Begriff „Ticket“ könnte mit der Fahrkarte verwechselt werden.

Vorgeschlagene Felder:

| Feld | Vorgesehenes Verhalten |
| --- | --- |
| Haltestelle oder Abschnitt | Pflichtangabe; über Suche oder Karte auswählbar |
| Linie | Pflichtangabe mit Auswahl „Unbekannt“ |
| Beobachtungszeitpunkt | Pflichtangabe; tatsächlicher Zeitpunkt, nachträglich eintragbar |
| Fahrtrichtung | Optional; möglichst über ein verständliches Fahrtziel auswählbar |
| Bahnsteig | Optional, soweit entsprechende Daten vorliegen |
| Situation | „Im Fahrzeug“ oder „An der Haltestelle“; Pflichtstatus noch offen |
| Beobachtung | „Selbst kontrolliert“ oder „Kontrolle beobachtet“; Pflichtstatus noch offen |
| Notiz | Optionaler kurzer und sachlicher Beschreibungstext |

Berichte sind für die öffentliche Dokumentation vorgesehen. Der ursprüngliche Vorschlag einer standardmäßig privaten Sichtbarkeit wurde zugunsten einer öffentlichen Karte geändert. Private Entwürfe auf dem eigenen Gerät sind weiterhin als Ergänzung möglich.

### Standort bestätigen

Der aktuelle Gerätestandort ist zunächst nur ein Vorschlag. Vor dem Speichern bestätigt der Nutzer den Beobachtungsort. Wer den Bericht später abschickt, darf dadurch nicht versehentlich die falsche Haltestelle dokumentieren.

Eine dauerhafte Standortaufzeichnung ist für diesen Ablauf nicht erforderlich. Das manuelle Auswählen eines Ortes muss auch ohne Standortfreigabe funktionieren.

### Zeitpunkte getrennt speichern

Jeder Bericht benötigt mindestens getrennte Angaben für:

- Zeitpunkt der Beobachtung.
- Zeitpunkt der Erstellung beziehungsweise des Servereingangs.
- Zeitpunkt der öffentlichen Veröffentlichung.

Ein heute veröffentlichter Bericht über eine Kontrolle von gestern gehört in der zeitlichen Ereignisansicht weiterhin zu gestern.

## 7. Veröffentlichung und Verhalten bei Störungen

Regulär werden Meldungen nach erfolgreicher Prüfung und Speicherung unmittelbar öffentlich verfügbar. Andere geöffnete Geräte sollen neue Berichte automatisch erhalten. Die konkrete technische Übertragung ist noch auszuwählen.

Bei schlechter Verbindung oder Serverüberlastung muss die Oberfläche den tatsächlichen Zustand verständlich anzeigen:

| Zustand | Beispiel für die Rückmeldung |
| --- | --- |
| Übertragung läuft | „Meldung wird gesendet …“ |
| Noch nicht übertragen | „Verbindung unterbrochen. Meldung bleibt auf diesem Gerät vorgemerkt.“ |
| Dauerhaft auf dem Server gespeichert, Veröffentlichung ausstehend | „Meldung gespeichert. Veröffentlichung verzögert sich.“ |
| Öffentlich abrufbar | „Meldung veröffentlicht.“ |
| Abgelehnt | Konkreter Grund und Möglichkeit zur Korrektur |

„Gespeichert“ darf erst nach einer Bestätigung der dauerhaften Speicherung auf dem Server angezeigt werden. „Auf diesem Gerät vorgemerkt“ setzt voraus, dass die entsprechende lokale Speicherung tatsächlich implementiert ist.

Bei hoher Last bekommt das Annehmen und Speichern von Berichten Vorrang. Aufwendige Auswertungen sowie Karten- und Online-Zahl-Aktualisierungen können seltener erfolgen. Wenn notwendig, wird die weitere Verarbeitung über eine dauerhaft gespeicherte Warteschlange abgewickelt.

Wiederholte Übertragungsversuche desselben Berichts müssen erkannt werden. Mehrfaches Tippen und automatische Wiederholungen dürfen keine zusätzlichen Berichte erzeugen. Der Beobachtungszeitpunkt bleibt bei jeder Verzögerung unverändert.

## 8. Berichte unterscheiden und Ereignisse zusammenfassen

Jeder Bericht erhält eine eigene Kennung. Eine Darstellung wie `M-1042` ist ein Beispiel; das genaue Kennungsformat ist noch offen.

Es werden drei unterschiedliche Fälle behandelt:

1. **Wiederholtes Absenden desselben Berichts:** technisch verhindern, dass mehrere Datensätze entstehen.
2. **Mehrere unterschiedliche Berichte am selben Ort:** auf der Karte gemeinsam erreichbar machen, die Berichte aber getrennt erhalten.
3. **Mehrere Berichte über möglicherweise dieselbe Kontrolle:** eine nachvollziehbare Zuordnung zu einem gemeinsamen Ereignis ermöglichen.

Ähnlicher Ort, Zeitpunkt und gleiche Linie liefern Hinweise auf einen Zusammenhang. Sie beweisen nicht, dass es dieselbe Kontrolle war. Eine unsichere Zuordnung muss deshalb als „möglicherweise zusammengehörig“ erkennbar bleiben.

Veröffentlichte Meldungen sind zunächst Nutzerangaben. Die Veröffentlichung oder eine Moderatorprüfung bestätigt nicht automatisch, dass das geschilderte Ereignis tatsächlich stattgefunden hat.

## 9. Filter, Archiv und Statistiken

Als Zeitraumfilter wurden „Heute“, „7 Tage“, „30 Tage“ und „Eigener Zeitraum“ vorgeschlagen. Die Filter sollen gleichzeitig auf Karte und Liste wirken. Ältere Berichte bleiben im vorgesehenen Archiv erreichbar; die endgültige Aufbewahrungsdauer ist noch festzulegen.

Weitere sinnvolle Filter sind Linie, Fahrtrichtung und Haltestelle. Ein Filter darf nur dann angeboten werden, wenn die zugehörigen Daten zuverlässig vorhanden sind.

Die ersten Auswertungen sollen zeigen:

- Anzahl veröffentlichter Meldungen pro Tag beziehungsweise Monat.
- Verteilung der Meldungen auf Linien und Haltestellen.
- Entwicklung der eingegangenen Dokumentation im ausgewählten Zeitraum.
- Anzahl zusammengefasster Ereignisse, sobald eine nachvollziehbare Ereigniszuordnung umgesetzt ist.

**Meldungsanzahl und Ereignisanzahl werden getrennt ausgewiesen.** Mehrere Personen können dieselbe Kontrolle melden. Auch die Erfassungsaktivität der Nutzer beeinflusst die Zahlen.

Die Statistik darf daher nicht aus „hier wurden zehn Berichte eingereicht“ die Aussage „hier fanden insgesamt zehn Kontrollen statt“ ableiten. Eine fehlende Meldung bedeutet lediglich, dass kein passender Bericht vorliegt. Eine zuverlässige Kontrollwahrscheinlichkeit lässt sich aus diesen Nutzermeldungen allein nicht bestimmen.

## 10. Öffentliche Online-Anzeige

Die App soll eine kleine Anzeige der gerade aktiven Besucher erhalten. Ein Beispiel lautet: „Rund 128 gerade aktiv“. Die Zahl ist ein Platzhalter für die Gestaltung und kein bereits gemessener Wert.

Vorgeschlagene Regeln für die erste Umsetzung:

- Aktive Browsersitzungen mit einem Lebenszeichen innerhalb der letzten zwei Minuten zählen.
- Besucher ohne Account berücksichtigen.
- Mehrere Tabs desselben Browsers möglichst zusammenfassen.
- Anzeige ungefähr alle 30 Sekunden aktualisieren.
- Ausschließlich die Gesamtzahl öffentlich darstellen.
- Bei einer Störung „Online-Zahl derzeit nicht verfügbar“ anzeigen.

Die Messung erfasst Sitzungen, keine eindeutig identifizierten Menschen. Eine Person kann beispielsweise am Handy und Computer gleichzeitig aktiv sein. Die zeitlichen Grenzen und das Verhalten bei Hintergrund-Tabs sind vor der Umsetzung genauer festzulegen.

## 11. Nutzerverwaltung, Moderation und Einstellungen

### Vorgeschlagenes Zugangsmodell

Die öffentliche Karte und Auswertungen sollen ohne Anmeldung erreichbar sein. Für das Erstellen von Berichten wurde ein Account mit Nickname empfohlen. Diese Empfehlung ist noch keine endgültige Produktentscheidung.

Mit einem Account sollen Nutzer ihre eigenen Berichte wiederfinden, bearbeiten und löschen können. Ob der Nickname bei jeder öffentlichen Meldung angezeigt wird und welche Änderungen im Verlauf sichtbar bleiben, ist noch offen.

### Moderation

Für eine öffentliche Plattform sind eine Funktion zum Melden problematischer Beiträge und eine Oberfläche für deren Prüfung vorgesehen. Moderatoren sollen unangemessene oder offensichtlich fehlerhafte Inhalte bearbeiten beziehungsweise ausblenden können. Rechte, Prüfablauf und Auswirkungen auf Statistiken müssen dokumentiert werden.

Ein Moderationsstatus beschreibt die Bearbeitung eines Berichts. Er ist keine unabhängige Verifikation der geschilderten Kontrolle.

### Vorgeschlagene Einstellungen und Ergänzungen

- Helles, dunkles oder systemabhängiges Design.
- Gut lesbare und anpassbare Schriftgröße.
- Standortfreigabe nur bei entsprechender Nutzeraktion.
- Persönliche Standardfilter und bevorzugte Linien.
- Entwürfe zum späteren Übertragen.
- Export eigener Berichte, beispielsweise als CSV oder PDF.
- Festgelegte Aufbewahrungsdauer, Datenexport und Kontolöschung.

Die konkreten Datenschutzinformationen, Löschregeln, Moderationsrechte und Nutzungsbedingungen müssen vor einem öffentlichen Betrieb ausgearbeitet werden. In diesem README wird keine abgeschlossene rechtliche Prüfung behauptet.

## 12. Ergebnis der GTFS-Datenprüfung

Die folgenden Ergebnisse beziehen sich auf die neun tatsächlich hochgeladenen Dateien des besprochenen VRR-Datensatzes. Sie gelten nicht automatisch für spätere Versionen.

### Metadaten

| Eigenschaft | Wert |
| --- | --- |
| Herausgeber | VRR |
| Interne Feed-Version | `20260825` |
| Angegebener Beginn | 1. Juli 2026 |
| Angegebenes Ende | 31. Dezember 2026 |
| Bezug des Downloads | Vom Nutzer als „August 2026 IV“ heruntergeladen |

Der angegebene Zeitraum beschreibt den Feed. Er garantiert nicht, dass zwischenzeitliche Fahrplanänderungen bereits berücksichtigt sind.

### Dateien und Datensätze

Alle Zahlen zählen Datenzeilen ohne Kopfzeile.

| Datei | Einträge | Verwendung |
| --- | ---: | --- |
| `agency.txt` | 58 | Unternehmen und Betreiberkennungen |
| `routes.txt` | 1.741 | Liniennummern, Namen, Kategorien und Farben |
| `stops.txt` | 32.564 | Haltestellen, Stationen, Bahnsteige und Koordinaten |
| `trips.txt` | 220.511 | Zuordnung von Fahrten zu Linien, Betriebskennungen und Richtungen |
| `calendar.txt` | 6.840 | Kalender-Grundregeln |
| `calendar_dates.txt` | 255.656 | Betrieb an konkreten Tagen |
| `transfers.txt` | 76.078 | Umsteigebeziehungen |
| `shapes.txt` | 0 | Keine Streckenpunkte vorhanden |
| `stop_times.txt` | 5.240.109 | Geordnete Haltestellen und Zeiten je Fahrt |
| `feed_info.txt` | 1 | Herausgeber, Version und Zeitraum |

Die Rohdateien liegen nur lokal in `temp/` und werden nicht mit der Website veröffentlicht. Das Importskript liest `stop_times.txt` zeilenweise und erzeugt eine kompakte Datei mit den Düsseldorfer Linienmustern.

### Rheinbahn im Datensatz

Unter dem Namen „Rheinbahn AG“ wurden zwei Betreiberkennungen gefunden: `rbg-70` und `btm-70`. Ihnen sind gemeinsam 148 Linieneinträge und 54.367 Fahrten zugeordnet.

| Im Feed verwendete Kategorie | Linieneinträge |
| --- | ---: |
| `route_type = 1` — Stadtbahn-/U-Bahn-Kategorie | 13 |
| `route_type = 0` — Straßenbahn | 8 |
| `route_type = 3` — Bus | 126 |
| Weiterer Eintrag mit `route_type = 405` | 1 |

Die Zahlen enthalten Sonderverkehre und Verbindungen außerhalb Düsseldorfs. Die bloße Aufnahme einer Linie in den Feed bedeutet nicht, dass jede Variante an jedem Tag verkehrt.

Die U79 steht sowohl unter Rheinbahn als auch unter DVG. Eine gemeinsame Darstellung soll die getrennten Quellkennungen erhalten. Linien dürfen nicht allein nach ihrer angezeigten Nummer zusammengeführt werden; Bezeichnungen wie „E“ kommen mehrfach vor.

### Haltestellen und Stationshierarchie

Es wurden 1.987 Einträge mit dem Kennungspräfix `de:05111:` gefunden. Diese Zahl umfasst Haltepunkte und Stationseinträge und ist keine Zählung eindeutig unterschiedener Haltestellen.

Bei D-Moorenstraße sind beispielsweise acht Datensätze vorhanden, darunter eine übergeordnete Station und Bahnsteige. Die Stationsverweise ermöglichen eine gemeinsame Darstellung.

Bei der durchgeführten Prüfung lagen keine fehlenden oder außerhalb der zulässigen Wertebereiche liegenden Haltestellenkoordinaten vor. Das beweist noch nicht die geografische Genauigkeit jedes einzelnen Punktes.

### Kalenderbesonderheit

Alle Wochenflags in `calendar.txt` stehen auf `0`. Der Betrieb an einzelnen Tagen wird in diesem Feed über `calendar_dates.txt` hinzugefügt. Ein Import, der nur den Wochenkalender auswertet, würde deshalb keine regulären Betriebstage erkennen.

### Fehlende Zielbeschriftungen

Bei allen 54.367 Rheinbahn-Fahrten ist `trip_headsign` leer. Außerdem haben 69 der 148 Rheinbahn-Linieneinträge keine Langbezeichnung. Die Richtungskennungen `0` und `1` sind vorhanden, liefern aber allein keine verständlichen Zielnamen.

### Fehlende Streckengeometrien

Die `shapes.txt` enthält nur die Kopfzeile und ist 74 Byte groß. Bei allen 220.511 Fahrten ist `shape_id` leer. Die tatsächlichen Straßen- und Gleisverläufe sind deshalb in diesen Dateien nicht enthalten.

Die Linienansicht verbindet die geordnete Haltestellenfolge mit geraden Abschnitten zwischen den Haltestellenkoordinaten. Sie zeigt die Bedienungsfolge schematisch, nicht den exakten Verlauf entlang von Straßen und Gleisen.

### Geprüfte Verknüpfungen

Bei der durchgeführten Prüfung wurden keine doppelten Betreiber-, Linien-, Haltestellen- oder Fahrt-IDs gefunden. Es gab keine fehlenden referenzierten Betreiber, Linien, Betriebskennungen, Elternstationen oder Umsteigehaltestellen. Ebenso wurden keine fehlerhaften Spaltenanzahlen in den geprüften CSV-Zeilen festgestellt.

Der Linienimport verarbeitet 5.240.109 Stop-Zeit-Zeilen. Für 137 Linien mit mindestens zwei Düsseldorfer Haltestellen entstehen 870 unterschiedliche Fahrtmuster: 90 Buslinien, 24 Zug- und S-Bahn-Linien, 14 Stadtbahnlinien, acht Straßenbahnlinien und eine weitere Schienenlinie. Die Haltestellenkennungen aus `stop_times.txt` lassen sich über ihre DHID-Präfixe den 630 zusammengefassten Kartenorten zuordnen. Gleich benannte Linien bleiben über ihre GTFS-Linien- und Betreiberkennungen getrennt.

Diese Aufbereitung ist keine vollständige Validierung eines kompletten GTFS-Pakets. Insbesondere enthält der Feed keine Streckenpunkte in `shapes.txt`.

## 13. Was bereits mit den vorhandenen Daten möglich ist

| Funktion | Voraussetzung beziehungsweise Grenze |
| --- | --- |
| Haltestellenkarte und Haltestellensuche | Mit `stops.txt` möglich |
| Zusammengefasste Stationen und Bahnsteigauswahl | Mit Stationsbeziehungen und geeigneter Zuordnung möglich |
| Linienauswahl nach Verkehrsmittel und Betreiber | Mit `agency.txt` und `routes.txt` möglich; im Kartenprototyp umgesetzt |
| Berichte einer gewählten Haltestelle und Linie zuordnen | Möglich; eine automatische Prüfung der Linien-Haltestellen-Beziehung fehlt noch |
| Rote Meldungspunkte und Meldungsliste | Unabhängig von einer vollständigen Liniengeometrie umsetzbar |
| Fahrten mit ihren Betriebsdaten verbinden | Mit `trips.txt` und den Kalenderdateien möglich |
| Geordnete Düsseldorfer Haltestellenfolge einer Linienfahrt | Mit `stop_times.txt`, `trips.txt` und `routes.txt` umgesetzt |
| Vollständige Ziel- und Fahrtvarianten zuverlässig auswerten | Erfordert weitere Daten beziehungsweise Aufbereitung |
| Schematische Linie über ihre Haltestellen zeichnen | Mit den geordneten GTFS-Haltestellenfolgen umgesetzt |
| Exakten Verlauf entlang von Straßen und Gleisen zeichnen | Erfordert zusätzliche Streckengeometrien |

## 14. Geplante Datenaufbereitung und technische Grundlage

OpenStreetMap dient als Kartengrundlage. Die eigenen Berichte werden separat in der Datenbank der Anwendung gespeichert. Sie sind keine Änderungen an der OpenStreetMap-Datenbank.

Leaflet wurde als mögliche Bibliothek für die interaktive Kartenanzeige vorgeschlagen. Die endgültige Auswahl des Kartenanbieters, des Backends, der Datenbank und der Echtzeitübertragung ist noch offen. Ein konkreter, bereits installierter Software-Stack wird hier nicht behauptet.

### HTML-Grundgerüst und Web-Metadaten

Im ergänzenden Projektkontext wurde außerdem ein nutzbares HTML-Grundgerüst mit folgenden Bestandteilen angefragt:

- Seitentitel, Beschreibung, Zeichencodierung, Sprache und mobile Viewport-Einstellungen.
- Stylesheet-Verknüpfungen und gezieltes Vorladen tatsächlich benötigter Ressourcen.
- Open-Graph- und Twitter-/X-Metadaten für geteilte Links.
- Canonical-URL und Sprachalternativen, sobald echte veröffentlichte Adressen und Übersetzungen vorliegen.
- Strukturierte Daten über `application/ld+json`, passend zur Anwendung und mit belegbaren Angaben.
- Favicons und `site.webmanifest` mit dem Projektnamen LinienBlick.
- `robots.txt`, `sitemap.xml` und eine zur späteren Hosting-Umgebung passende `_headers`-Datei.

Der aktuelle Inhalt dieser Dateien im Repository wurde für dieses README nicht geprüft. Beim Ausbau müssen Metadaten, Domain, Vorschaubilder, Ressourcenpfade und Sprachversionen mit der tatsächlich veröffentlichten Anwendung übereinstimmen. Ein Manifest allein bedeutet noch nicht, dass Offline-Funktionen umgesetzt sind.

### GTFS-Import

Die App soll einen kleinen, vorbereiteten Datenbestand verwenden. Die großen Originaldateien werden beim Import verarbeitet, statt bei jedem Kartenaufruf vollständig geladen zu werden.

Vorgesehen sind:

1. Relevante Betreiber und Linien auswählen.
2. Haltestellen und Stationsbeziehungen aufbereiten.
3. Quellkennungen erhalten und mit stabilen internen App-Kennungen verbinden.
4. Feed-Version und Datenstand dokumentieren.
5. Aktualisierungen prüfen, bevor sie den aktiven Datenbestand ersetzen.
6. Bestehende Berichte auch nach Änderungen an den Verkehrsdaten verständlich erhalten.

### Import der großen `stop_times.txt`

`scripts/import_lines.py` verarbeitet die große Datei zeilenweise und verbindet Haltestellenfolgen über `trips.txt` mit `routes.txt` und `agency.txt`. Der Aufruf aus dem Worker-Paket lautet `npm run import:lines`. Die Ausgabe `site/public/data/lines-duesseldorf.json` enthält nur die Linienmuster im Düsseldorfer Kartendatensatz; die Rohdateien und die einzelnen Abfahrtszeiten werden nicht ausgeliefert.

Die Linienauswahl zeigt Verkehrsmittel, Linie, Betreiber und verfügbare Fahrtmuster. Bei Linien mit mehreren Varianten kann ein einzelner Verlauf ausgewählt werden. `trip_headsign` ist im untersuchten Feed überwiegend leer; die Auswahl nennt deshalb Start- und Endhaltestelle des jeweiligen Düsseldorfer Ausschnitts.

### Ergänzende Streckengeometrien

Als mögliche Quelle wurden ÖPNV-Routenrelationen in OpenStreetMap genannt. Die passenden Relationen müssen gefunden und hinsichtlich Richtung, Varianten, Aktualität und Nutzungsbedingungen geprüft werden. Die konkrete Zuordnung zum GTFS-Bestand steht noch aus.

### Kartenanbieter und Offline-Funktionen

Die Kartennutzung muss die Bedingungen des gewählten Anbieters erfüllen. Bei den öffentlichen OSM-Standardkacheln sind insbesondere sichtbare Quellenangabe, angemessenes Caching und die Vorgaben zur Identifizierung der Anwendung zu berücksichtigen.

Ein vollständiger Offline-Download von Düsseldorf über die öffentlichen OSM-Standardserver ist nicht vorgesehen. Falls später Offline-Karten benötigt werden, muss dafür ein ausdrücklich geeigneter Anbieter oder eine eigene Infrastruktur gewählt werden. Lokal gespeicherte Berichtsentwürfe sind eine davon getrennte Funktion.

## 15. Erste Umsetzung in drei Schritten

### Schritt 1: Karte und Bedienung

Der erste durchgängige Ablauf lautet:

**Düsseldorf öffnen → Haltestelle auswählen → Kontrolle dokumentieren → Bericht in Karte und Liste sehen.**

Umfang des Prototyps:

- Responsive Kartenansicht für Handy und Computer.
- Importierte Haltestellen und Suchfunktion.
- Linienauswahl für Bus, Stadtbahn, Straßenbahn und Zug.
- Meldeformular, Meldungsdetails und Meldungsliste.
- Rote Punkte und zusammengefasste Meldungen.
- Erste Zeitraumfilter.
- Klar gekennzeichnete Beispieldaten für Bedienungsprüfungen.

Die Linienverläufe beruhen auf Haltestellenfolgen und sind zwischen den Halten schematisch. Für geografisch genaue Linienführungen werden weiterhin passende Streckengeometrien benötigt.

### Schritt 2: Öffentliche Speicherung

- Dauerhafte Speicherung der Berichte.
- Sofortige öffentliche Bereitstellung.
- Automatische Aktualisierung auf anderen geöffneten Geräten.
- Verständliche Übertragungs- und Veröffentlichungszustände.
- Schutz vor wiederholtem Absenden desselben Berichts.
- Bearbeiten und Löschen eigener Meldungen.
- Umsetzung des zuvor festgelegten Zugangs- und Moderationsmodells.

### Schritt 3: Online-Anzeige und Auswertung

- Zählen aktiver Sitzungen nach dokumentierten Regeln.
- Öffentliche Online-Anzeige mit Fehlerzustand.
- Statistiken nach Tag, Linie und Haltestelle.
- Archiv und zusätzliche Filter.
- Später eine nachvollziehbare Zuordnung zusammengehöriger Ereignisse.

Die tatsächlichen Liniengeometrien aus passenden GTFS-Shapes oder geprüften ÖPNV-Routenrelationen bleiben ein möglicher nächster Ausbauschritt.

## 16. Kriterien für eine nutzbare erste Version

Die erste Version gilt als brauchbar, wenn folgende Abläufe nachvollziehbar funktionieren:

- Besucher öffnen die Karte ohne Anmeldung und finden eine Haltestelle über die Suche.
- Ein Bericht lässt sich auch ohne Standortfreigabe am richtigen Ort erstellen.
- Ein veröffentlichter Bericht erscheint in Karte und Liste und kann auf einem zweiten Gerät abgerufen werden.
- Eine nachträglich erfasste Beobachtung wird nach ihrem Beobachtungszeitpunkt eingeordnet.
- Mehrere Berichte an derselben Haltestelle bleiben einzeln erreichbar.
- Wiederholtes Absenden erzeugt keinen zusätzlichen Bericht.
- Verbindungs- und Verarbeitungsprobleme werden ohne falsche Speicherbestätigung angezeigt.
- Die wesentlichen Aktionen sind auf dem Handy, mit Tastatur und über die Listenansicht bedienbar.
- Beispieldaten, Nutzerangaben und tatsächliche Messwerte sind eindeutig unterscheidbar.

Diese Punkte sind Abnahmekriterien für die spätere Umsetzung. Sie sind noch keine bestandenen Tests.

## 17. Noch zu entscheiden oder zu erledigen

- Endgültiges Modell für Accounts, Anmeldung und öffentliche Nicknames.
- Pflichtstatus der Situations- und Beobachtungsfelder.
- Bearbeitungsregeln, Löschung, Aufbewahrung und Änderungsverlauf.
- Moderationsrechte, Meldegründe und Umgang mit problematischen Beiträgen.
- Exakte Filtervoreinstellungen und Darstellung von Abschnittsmeldungen.
- Verfahren zur Zuordnung mehrerer Berichte zu einem Ereignis.
- Backend, Datenbank, Kartenanbieter und Echtzeitübertragung.
- Updateverfahren für den bereits umgesetzten Import von `stop_times.txt`.
- Quelle und Zuordnung der tatsächlichen Streckenverläufe.
- Updateverfahren für Verkehrsdaten und Umgang mit Umleitungen.
- Konkrete Definition aktiver Sitzungen und Behandlung von Hintergrund-Tabs.
- Endgültiges Logo, Farbkontraste und zugängliche Gestaltung.
- Datenschutzinformationen, Nutzungsbedingungen, Quellen- und Lizenzangaben für den öffentlichen Betrieb.
- Installations-, Entwicklungs- und Deploymentanleitung, sobald die Implementierung feststeht.

Als nächster konkreter Arbeitsschritt werden die vier Kernansichten und ihre Felder verbindlich festgelegt. Daraus entsteht der erste bedienbare Kartenprototyp.

## 18. Referenzen

- [OpenStreetMap](https://www.openstreetmap.org/) — Kartengrundlage.
- [OSM-Standardkacheln: Nutzungsregeln](https://operations.osmfoundation.org/policies/tiles/) — Bedingungen für die öffentlichen Rasterkacheln.
- [Leaflet: Quick Start](https://leafletjs.com/examples/quick-start/) — mögliche Kartenbibliothek.
- [GTFS Schedule Reference](https://gtfs.org/documentation/schedule/reference/) — Struktur und Bedeutung der Verkehrsdaten.
- [VRR OpenDataPortal](https://www.vrr.de/service/opendataportal/) — Zugang zu den öffentlichen Verkehrsdaten.
- [OpenData ÖPNV](https://www.opendata-oepnv.de/) — Plattform des besprochenen GTFS-Downloads.
- [OpenStreetMap: Public Transport](https://wiki.openstreetmap.org/wiki/Public_transport) — Modellierung von ÖPNV-Routen.

Die Datensatzangaben in diesem README stammen aus der Prüfung der hochgeladenen Dateien. Weitere Entscheidungen und Fortschritte sollen bei der Umsetzung in diesem Dokument nachgeführt werden.
