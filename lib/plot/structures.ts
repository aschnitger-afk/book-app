export interface PlotBeat {
  name: string;
  description: string;
  act: 'act1' | 'act2a' | 'act2b' | 'act3';
  position?: number; // 0-100 percentage in story
  tensionLevel?: number; // 0-100 for tension curve visualization
  glossary?: string[]; // Key terms used in this beat that should be explained
}

export interface PlotStructure {
  id: string;
  name: string;
  description: string;
  detailedDescription: string; // More elaborate description for selection screen
  explanation: string;
  acts: string;
  complexity: 'Einfach' | 'Mittel' | 'Komplex';
  pros: string[];
  cons: string[];
  bestFor: string[];
  idealFor: string[]; // More detailed use cases
  beats: PlotBeat[];
}

// Glossary of common plotting terms
export const PLOT_GLOSSARY: Record<string, { short: string; full: string; example?: string }> = {
  'Hook': {
    short: 'Der Einstiegshaken',
    full: 'Ein Element am Anfang der Geschichte, das sofortiges Interesse weckt. Kann eine spannende Szene, ein rätselhafter Satz oder ein emotionales Dilemma sein. Ziel: Der Leser muss weiterlesen wollen.',
    example: 'Beispiel: "Der Brief kam an einem Dienstag, an dem alles endete."'
  },
  'Midpoint': {
    short: 'Die Geschichte wendet sich',
    full: 'Die Mitte der Geschichte (ca. Seite 150 bei einem 300-Seiten-Roman), wo sich die Richtung ändert. Der Protagonist wechselt von reaktiv (Dinge passieren ihm) zu proaktiv (er ergreift die Initiative). Oder: Ein falscher Sieg scheint errungen, entpuppt sich aber als Pyrrhussieg.',
    example: 'Beispiel: Der Detektiv findet den vermeintlichen Mörder - aber es war ein Köder.'
  },
  'Pinch Point': {
    short: 'Der Antagonist zeigt Stärke',
    full: 'Ein Moment im 2. Akt, wo der Antagonist (oder die antagonistische Kraft) seine wahre Macht demonstriert. Erinnert den Leser an die Gefahr und erhöht die Spannung. Es gibt typischerweise zwei Pinch Points.',
    example: 'Beispiel: Der Bösewicht entführt die Schwester des Helden - und zeigt, dass er immer einen Schritt voraus ist.'
  },
  'Inciting Incident': {
    short: 'Das auslösende Ereignis',
    full: 'Das Ereignis, das die Geschichte in Gang setzt und den Protagonisten aus seiner gewöhnlichen Welt reißt. Ohne dieses Ereignis gäbe es keine Geschichte. Es stellt das Leben des Helden auf den Kopf.',
    example: 'Beispiel: Gandalf taucht bei Bilbo auf. Ein Mord wird entdeckt. Ein Brief kommt an.'
  },
  'Catalyst': {
    short: 'Der Funke',
    full: 'Ein lebensveränderndes Ereignis, das den Protagonisten zwingt, zu handeln. Ähnlich wie Inciting Incident, aber oft dramatischer und unwiderruflich.',
    example: 'Beispiel: Das Haus brennt nieder. Der Protagonist verliert seinen Job.'
  },
  'All Is Lost': {
    short: 'Der Tiefpunkt',
    full: 'Der Moment im späten 2. Akt, wo alles aussichtslos erscheint. Der Protagonist hat verloren, die Hoffnung ist am Boden. Oft begleitet von einem "Tod" (physisch, beruflich oder emotional).',
    example: 'Beispiel: Obi-Wan stirbt. Der Held wird verraten und ist völlig allein.'
  },
  'Climax': {
    short: 'Der Höhepunkt',
    full: 'Die finale Konfrontation zwischen Protagonist und Antagonist. Die Spannung erreicht ihr Maximum. Hier wird entschieden, wer gewinnt und welches Thema triumphiert.',
    example: 'Beispiel: Luke gegen Vader. Der letzte Kampf gegen den Drachen.'
  },
  'B Story': {
    short: 'Die Nebenhandlung',
    full: 'Eine parallele Handlung, meist eine Beziehungsgeschichte (Romantik oder Freundschaft), die dem Protagonisten hilft, die Lösung für das Hauptproblem zu finden.',
    example: 'Beispiel: Die Liebesgeschichte in einem Action-Film, die dem Helden emotionalen Halt gibt.'
  },
  'Opening Image': {
    short: 'Das erste Bild',
    full: 'Die erste Szene des Buches/Films, die visuell oder emotional den Ausgangszustand des Protagonisten zeigt. Wird oft gespiegelt vom Final Image am Ende.',
    example: 'Beispiel: Ein einsamer Detektiv in einer heruntergekommenen Bar → später: Er hat Freunde gefunden.'
  },
  'Theme Stated': {
    short: 'Das Thema wird genannt',
    full: 'Ein Moment im frühen 1. Akt, wo das zentrale Thema der Geschichte ausgesprochen wird - oft ohne dass der Protagonist (oder der Leser) es versteht.',
    example: 'Beispiel: "Liebe bedeutet, loszulassen." - Der Protagonist widerspricht, am Ende wird er es verstehen.'
  },
  'Debate': {
    short: 'Die Zögern-Phase',
    full: 'Nach dem Catalyst zögert der Protagonist, die Herausforderung anzunehmen. Er diskutiert mit sich selbst oder anderen, was er tun sollte. Die "ultimative Frage" wird gestellt.',
    example: 'Beispiel: "Soll ich wirklich nach Mordor gehen? Ich bin nur ein Hobbit!"'
  },
  'Dark Night': {
    short: 'Die Nacht der Seele',
    full: 'Der Moment nach "All Is Lost", wo der Protagonist emotional verarbeitet, was passiert ist. Wie fühlt es sich an, völlig am Boden zu sein? Hier findet er oft die innere Erkenntnis für die Lösung.',
    example: 'Beispiel: Der Held sitzt allein im Regen und erkennt, was er wirklich will.'
  },
  'Call to Adventure': {
    short: 'Der Ruf',
    full: 'Der Moment, wo der Protagonist aufgefordert wird, seine gewöhnliche Welt zu verlassen. Kann ein literaler Ruf sein oder ein Ereignis, das ihn herausfordert.',
    example: 'Beispiel: Gandalf markiert Bilbos Tür. Harry bekommt seinen Hogwarts-Brief.'
  },
  'Mentor': {
    short: 'Der Weise',
    full: 'Eine Figur, die dem Helden Rat, Ausrüstung oder Weisheit gibt, bevor er sich auf den Weg macht. Der Mentor kann später ausfallen oder sogar sterben.',
    example: 'Beispiel: Obi-Wan Kenobi, Dumbledore, Gandalf'
  },
  'Threshold': {
    short: 'Die Schwelle',
    full: 'Der Punkt, an dem der Protagonist die gewöhnliche Welt verlässt und in die unbekannte Welt der Geschichte eintritt. Kein Zurück mehr möglich.',
    example: 'Beispiel: Bilbo verlässt die Shire. Neo nimmt die rote Pille.'
  },
  'Ordeal': {
    short: 'Die große Prüfung',
    full: 'Die schwierigste Herausforderung im 2. Akt, oft im Mittelpunkt oder am Ende. Der Held steht vor seinem größten Fehler oder seiner größten Angst.',
    example: 'Beispiel: Harry im Verbotenen Wald. Luke im Trash Compactor.'
  },
  'Elixir': {
    short: 'Das Heilmittel',
    full: 'Was der Held aus seiner Reise mitbringt - physisch (ein Objekt) oder metaphorisch (Weisheit, Veränderung). Er kann es teilen, um seine Welt zu heilen.',
    example: 'Beispiel: Der Ring wird zerstört. Der Held kehrt weise zurück.'
  },
  'Ki': {
    short: 'Einführung (起)',
    full: 'Der erste Teil der Kishōtenketsu-Struktur: Die Einführung von Ideen, Charakteren und Ausgangslage. Ohne Konflikt, nur Aufbau.',
    example: 'Beispiel: Ein Dorf bereitet sich auf ein Fest vor.'
  },
  'Shō': {
    short: 'Entwicklung (承)',
    full: 'Der zweite Teil: Die Weiterführung und Vertiefung dessen, was in Ki eingeführt wurde. Die Situation entwickelt sich natürlich.',
    example: 'Beispiel: Die Dorfbewohner arbeiten zusammen, das Fest vorzubereiten.'
  },
  'Ten': {
    short: 'Wendung (転)',
    full: 'Der dritte Teil: Eine überraschende Wendung oder ein Twist, der die Perspektive ändert. Das Herzstück der Struktur.',
    example: 'Beispiel: Ein Sturm zerstört alles - aber die Dorfbewohner finden eine neue Gemeinschaft.'
  },
  'Ketsu': {
    short: 'Auflösung (結)',
    full: 'Der vierte Teil: Die Verbindung zum Anfang und die Schlussfolgerung. Die Geschichte kommt zu einem befriedigenden Abschluss.',
    example: 'Beispiel: Das Fest findet statt, aber anders als erwartet - alle sind glücklich.'
  },
  'Rising Action': {
    short: 'Steigende Handlung',
    full: 'Die Serie von Ereignissen, die die Spannung aufbauen. Komplikationen häufen sich, Hindernisse werden größer, der Einsatz steigt.',
    example: 'Beispiel: Der Held verliert den ersten Kampf, dann seinen Verbündeten, dann seine Waffe.'
  },
  'Disturbance': {
    short: 'Die Störung',
    full: 'Ein Ereignis, das die Balance des normalen Lebens stört. Kleinere als ein Inciting Incident, aber es signalisiert, dass etwas kommt.',
    example: 'Beispiel: Ein seltsamer Lärm in der Nacht. Ein unerwarteter Besucher.'
  },
  'Doorway': {
    short: 'Die Tür',
    full: 'Ein Punkt ohne Rückkehr. Sobald der Protagonist diese Schwelle überschreitet, kann er nicht mehr zu seinem alten Leben zurück. Es gibt zwei Türen: eine in den Konflikt, eine in das Finale.',
    example: 'Beispiel: Der Vertrag ist unterschrieben. Das Flugzeug ist gestartet.'
  },
  'Plot Point': {
    short: 'Der Wendepunkt',
    full: 'Ein Ereignis, das die Handlung in eine neue Richtung lenkt. Es gibt typischerweise zwei große Plot Points: einer am Ende von Akt 1, einer am Ende von Akt 2.',
    example: 'Beispiel: Der Held beschließt, das Geheimnis zu lüften. Der Antagonist entführt jemanden.'
  },
  'Resolution': {
    short: 'Die Auflösung',
    full: 'Der Abschnitt nach dem Climax, wo lose Fäden gebunden werden. Die neue Normalität wird gezeigt.',
    example: 'Beispiel: Der Held kehrt nach Hause zurück. Die Hochzeit findet statt.'
  },
  'Krise': {
    short: 'Die Entscheidung',
    full: 'Der Moment, wo der Protagonist eine unmögliche Wahl treffen muss - oft zwischen zwei gleich wichtigen Dingen.',
    example: 'Beispiel: Seine Familie retten ODER die Welt retten.'
  },
  'Fun and Games': {
    short: 'Das Versprechen einlösen',
    full: 'Der Teil der Geschichte, wo die Prämisse zum Leben erwacht. Wenn es ein Superhelden-Film ist: Hier zeigt er seine Kräfte. Wenn es eine RomCom ist: Hier kommen die lustigen Missverständnisse.',
    example: 'Beispiel: Der Hobbit im Elbenwald. Die erste Begegnung in einer RomCom.'
  },
  'Final Image': {
    short: 'Das letzte Bild',
    full: 'Die letzte Szene des Buches, die das Opening Image spiegelt. Zeigt die Transformation des Protagonisten durch den Kontrast.',
    example: 'Beispiel: Anfang: Allein und arm. Ende: Umgeben von Freunden und erfolgreich.'
  },
  'Approach': {
    short: 'Die Annäherung',
    full: 'Der Teil, wo der Held sich der finalen Herausforderung nähert. Vorbereitung, Aufbau, letzte Hindernisse.',
    example: 'Beispiel: Der Marsch auf den dunklen Turm. Die Reise zur Höhle des Drachen.'
  },
  'Reward': {
    short: 'Der Preis',
    full: 'Nach der größten Prüfung erhält der Held eine Belohnung - physisch (Schatz, Schwert) oder emotional (Erkenntnis, Stärke).',
    example: 'Beispiel: Das Schwert aus dem Stein. Die Erkenntnis, wer der wahre Vater ist.'
  },
  'Resurrection': {
    short: 'Die Auferstehung',
    full: 'Die finale Prüfung am Lebensende. Der Held muss alles riskieren, "stirbt" symbolisch und wird neu geboren.',
    example: 'Beispiel: Harry "stirbt" und besiegt Voldemort. Der Held opfert sich und überlebt.'
  },
  'Tests': {
    short: 'Die Prüfungen',
    full: 'Eine Serie von Herausforderungen in der neuen Welt, die den Helden testen. Er findet Verbündete und Feinde.',
    example: 'Beispiel: Die Prüfungen in der Zauberschule. Die erste Begegnung mit dem Antagonisten.'
  },
};

export const PLOT_STRUCTURES: PlotStructure[] = [
  {
    id: 'heros_journey',
    name: "Hero's Journey (Campbell/Vogler)",
    description: "Der klassische Held auf einer Transformationsreise",
    detailedDescription: `Die Hero's Journey ist die Urstruktur epischer Geschichten seit Tausenden von Jahren. Entwickelt vom Mythologen Joseph Campbell und vereinfacht von Drehbuchautor Christopher Vogler für Hollywood.

Die Struktur folgt einem Helden, der seine vertraute Welt verlässt, in eine unbekannte Welt voller Gefahren eintaucht, dort Prüfungen besteht, einen tiefen Tiefpunkt erleidet und schließlich transformiert zurückkehrt.

Besonders geeignet für Geschichten über persönliches Wachstum, epische Abenteuer und Charaktere, die sich fundamental ändern müssen.`,
    explanation: "Joseph Campbells Monomythos, popularisiert von Christopher Vogler. Der Held verlässt die gewöhnliche Welt, durchlebt Prüfungen, erleidet einen Tiefpunkt und kehrt verändert zurück. Ideal für epische Geschichten mit starkem Charakterbogen.",
    acts: "3",
    complexity: "Mittel",
    pros: [
      "Zeitlos bewährt und universell verständlich",
      "Starker emotionaler Bogen für den Protagonisten",
      "Klare Meilensteine für jede Geschichtesphase",
      "Funktioniert in fast jedem Genre"
    ],
    cons: [
      "Kann formelhaft wirken wenn nicht kreativ angepasst",
      "Fokus auf einzelnen Helden, weniger auf Ensemble",
      "Der 'All is Lost'-Moment kann vorhersehbar sein"
    ],
    bestFor: ["Fantasy", "Abenteuer", "Science-Fiction", "Mythologie"],
    idealFor: [
      "Fantasy-Epen wie Herr der Ringe oder Star Wars",
      "Coming-of-Age Geschichten",
      "Mythologische Adaptionen",
      "Abenteuerromane mit starkem Protagonisten"
    ],
    beats: [
      { name: "Gewöhnliche Welt", description: "Held in vertrauter Umgebung, vor der Abreise", act: "act1", tensionLevel: 10, glossary: ['Hook'] },
      { name: "Call to Adventure", description: "Herausforderung erscheint, Status quo gefährdet", act: "act1", tensionLevel: 20, glossary: ['Call to Adventure'] },
      { name: "Weigerung", description: "Zögern, Angst vor dem Unbekannten", act: "act1", tensionLevel: 25, glossary: ['Debate'] },
      { name: "Treffen mit dem Mentor", description: "Weiser Ratgeber bereitet vor", act: "act1", tensionLevel: 30, glossary: ['Mentor'] },
      { name: "Überschreiten der Schwelle", description: "Punkt of no return, Abreise", act: "act1", tensionLevel: 40, glossary: ['Threshold'] },
      { name: "Tests, Verbündete, Feinde", description: "Anpassung an die neue Welt", act: "act2a", tensionLevel: 45, glossary: ['Tests', 'Rising Action'] },
      { name: "Annäherung", description: "Vorbereitung auf die große Herausforderung", act: "act2a", tensionLevel: 55, glossary: ['Approach'] },
      { name: "Die Hölle", description: "Tiefster Punkt, scheinbare Niederlage", act: "act2b", tensionLevel: 85, glossary: ['All Is Lost', 'Ordeal'] },
      { name: "Belohnung", description: "Sieg über den inneren Äußeren Feind", act: "act2b", tensionLevel: 60, glossary: ['Reward'] },
      { name: "Der Weg zurück", description: "Flucht/Rückkehr, neue Gefahr", act: "act3", tensionLevel: 70, glossary: ['Rising Action'] },
      { name: "Auferstehung", description: "Finale Prüfung, vollständige Transformation", act: "act3", tensionLevel: 95, glossary: ['Resurrection', 'Climax'] },
      { name: "Rückkehr mit dem Elixir", description: "Heimkehr mit Erkenntnis/Gabe", act: "act3", tensionLevel: 20, glossary: ['Elixir', 'Resolution'] },
    ]
  },
  {
    id: 'save_the_cat',
    name: "Save the Cat! (Blake Snyder)",
    description: "Hollywood-Beat-Sheet für kommerzielle Blockbuster",
    detailedDescription: `Save the Cat! ist das bekannteste Drehbuch-System Hollywoods, entwickelt von Blake Snyder. Der Name kommt von einer Szene, in der der Held eine Katze rettet, damit das Publikum ihn sofort mag.

Das System definiert 15 präzise "Beats" mit exakten Seitenzahlen (z.B. Catalyst auf Seite 12, Midpoint auf Seite 55). Es ist extrem strukturiert und perfekt für kommerzielle, zugängliche Geschichten.

Die Stärke liegt in den emotionalen "Bezahlmomenten" und der garantierten Zufriedenheit des Publikums. Ideal, wenn du einen Page-Turner schreiben willst, der verkauft.`,
    explanation: "Blake Snyders 15-Beat-Struktur für Drehbücher, perfekt für kommerzielle Geschichten. Betont starke Hooks ('Save the Cat'-Moment), klare Logline und emotionale Bezahlmomente. Seite für Seite ausgearbeitet.",
    acts: "3",
    complexity: "Mittel",
    pros: [
      "Sehr präzise Timing-Vorgaben (z.B. Catalyst auf Seite 10)",
      "Ausgezeichnet für kommerzielle, zugängliche Geschichten",
      "Klare emotionale Bezahlmomente",
      "Funktioniert besonders gut für Komödien und Action"
    ],
    cons: [
      "Kann zu rigide/formelhaft wirken",
      "Weniger flexibel für experimentelle Erzählungen",
      "Fokus auf kommerziellen Erfolg kann künstlerische Tiefe beeinträchtigen"
    ],
    bestFor: ["Action", "Komödie", "RomCom", "Thriller"],
    idealFor: [
      "Kommerzielle Romane, die verkaufen sollen",
      "Romantische Komödien",
      "Action-Blockbuster-Stil",
      "Debütromane mit klarem Plan"
    ],
    beats: [
      { name: "Opening Image", description: "Vorher/Nachher in visuellem Kontrast", act: "act1", tensionLevel: 5, glossary: ['Opening Image', 'Hook'] },
      { name: "Theme Stated", description: "Thema wird ausgesprochen", act: "act1", tensionLevel: 10, glossary: ['Theme Stated'] },
      { name: "Setup", description: "Welt, Charaktere, Problem etablieren", act: "act1", tensionLevel: 15, glossary: ['Hook'] },
      { name: "Catalyst", description: "Lebensveränderndes Ereignis", act: "act1", tensionLevel: 35, glossary: ['Catalyst', 'Inciting Incident'] },
      { name: "Debate", description: "Die ultimative Frage", act: "act1", tensionLevel: 40, glossary: ['Debate'] },
      { name: "Break into Two", description: "Entscheidung, in neue Welt gehen", act: "act1", tensionLevel: 45, glossary: ['Threshold', 'Plot Point'] },
      { name: "B Story", description: "Liebes-/Freundschaftsgeschichte", act: "act2a", tensionLevel: 30, glossary: ['B Story'] },
      { name: "Fun and Games", description: "Versprechen der Prämisse wird eingelöst", act: "act2a", tensionLevel: 50, glossary: ['Fun and Games'] },
      { name: "Midpoint", description: "Falscher Sieg oder falscher Verlust", act: "act2a", tensionLevel: 60, glossary: ['Midpoint'] },
      { name: "Bad Guys Close In", description: "Interne/externe Gegner rücken vor", act: "act2b", tensionLevel: 75, glossary: ['Rising Action', 'Pinch Point'] },
      { name: "All Is Lost", description: "Scheinbarer Tod, Tiefpunkt", act: "act2b", tensionLevel: 90, glossary: ['All Is Lost'] },
      { name: "Dark Night", description: "Wie fühlt es sich an?", act: "act2b", tensionLevel: 85, glossary: ['Dark Night'] },
      { name: "Break into Three", description: "Lösung durch B-Story", act: "act3", tensionLevel: 70, glossary: ['Doorway'] },
      { name: "Finale", description: "Neue Welt, Herausforderungen meistern", act: "act3", tensionLevel: 95, glossary: ['Climax'] },
      { name: "Final Image", description: "Gegenteil des Opening Image", act: "act3", tensionLevel: 15, glossary: ['Final Image', 'Resolution'] },
    ]
  },
  {
    id: 'three_act',
    name: "Drei-Akt-Struktur (Klassisch)",
    description: "Die universelle Erzählstruktur - Setup, Konfrontation, Auflösung",
    detailedDescription: `Die Drei-Akt-Struktur ist die Urform allen Geschichtenerzählens, seit es Theater gibt. Aristoteles beschrieb sie bereits im 4. Jahrhundert v. Chr.

Akt 1 (Setup): Etwa 25% der Geschichte. Wir lernen die Welt, den Helden und das Problem kennen. Endet mit dem Inciting Incident.

Akt 2 (Konfrontation): Etwa 50% der Geschichte. Der Held kämpft gegen Hindernisse, es gibt Wendungen und Wendungen. Der berüchtigte "zweite Akt" wird durch Pinch Points und einen Midpoint strukturiert.

Akt 3 (Auflösung): Etwa 25% der Geschichte. Der Höhepunkt, die finale Konfrontation und die Auflösung.

Diese Struktur ist intuitiv, flexibel und funktioniert in jedem Genre.`,
    explanation: "Die Urstruktur allen Erzählens: Akt 1 etabliert die Welt und den Konflikt, Akt 2 eskaliert durch Komplikationen und Wendungen, Akt 3 führt zum Höhepunkt und der Auflösung. Einfach, flexibel, zeitlos.",
    acts: "3",
    complexity: "Einfach",
    pros: [
      "Die intuitivste und universellste Struktur",
      "Funktioniert in jeder Länge und jedem Genre",
      "Leicht zu planen und zu schreiben",
      "Gut für Anfänger und Profis gleichermaßen"
    ],
    cons: [
      "Kann zu vorhersehbar sein",
      "Der zweite Akt neigt zur Sumpfphase",
      "Wenig konkrete Guidance im Vergleich zu detaillierteren Systemen"
    ],
    bestFor: ["Alle Genres", "Anfänger", "Klassische Literatur"],
    idealFor: [
      "Klassische Romane jeder Art",
      "Literarische Fiktion",
      "Debütromane",
      "Autoren, die nicht zu starr planen wollen"
    ],
    beats: [
      { name: "Hook", description: "Sofortiges Interesse wecken", act: "act1", tensionLevel: 15, glossary: ['Hook'] },
      { name: "Inciting Incident", description: "Ereignis startet die Geschichte", act: "act1", tensionLevel: 30, glossary: ['Inciting Incident'] },
      { name: "First Plot Point", description: "Keine Rückkehr mehr möglich", act: "act1", tensionLevel: 45, glossary: ['Plot Point', 'Threshold'] },
      { name: "Rising Action", description: "Komplikationen häufen sich", act: "act2a", tensionLevel: 50, glossary: ['Rising Action'] },
      { name: "Pinch Point 1", description: "Antagonist zeigt Macht", act: "act2a", tensionLevel: 60, glossary: ['Pinch Point'] },
      { name: "Midpoint", description: "Spiegelpunkt, falsche Annahme", act: "act2a", tensionLevel: 65, glossary: ['Midpoint'] },
      { name: "Pinch Point 2", description: "Gegner noch mächtiger", act: "act2b", tensionLevel: 75, glossary: ['Pinch Point'] },
      { name: "Krise", description: "Niedrigster Punkt", act: "act2b", tensionLevel: 85, glossary: ['Krise', 'All Is Lost'] },
      { name: "Second Plot Point", description: "Letzte Information, Vorbereitung", act: "act2b", tensionLevel: 70, glossary: ['Plot Point'] },
      { name: "Climax", description: "Endgültige Konfrontation", act: "act3", tensionLevel: 98, glossary: ['Climax'] },
      { name: "Resolution", description: "Neue Normalität", act: "act3", tensionLevel: 20, glossary: ['Resolution'] },
    ]
  },
  {
    id: 'seven_point',
    name: "Seven-Point Structure (Dan Wells)",
    description: "Vom Ende zurückwärts planen - effizient und zielgerichtet",
    detailedDescription: `Die Seven-Point Structure wurde von Autor Dan Wells popularisiert (bekannt von der "John Wayne Cleaver"-Serie). Die besondere Methode: Du planst vom Ende her!

Schritt 1: Entscheide, wie die Geschichte endet (Resolution)
Schritt 2: Was ist der vorherige Tiefpunkt? (Plot Point 2)
Schritt 3: Was ist der Midpoint?
Schritt 4: Wo beginnt die Geschichte? (Hook)

Diese Rückwärts-Planung verhindert, dass du dich in Sackgassen schreibst. Besonders bei Mystery und Thrillern hilft es, alle Spuren von Anfang an richtig zu legen.

Ideal für Autoren, die das Ende ihrer Geschichte kennen und effizient dorthin arbeiten wollen.`,
    explanation: "Dan Wells' Methode beginnt mit dem Ende und arbeitet sich rückwärts. Sieben Schlüsselmomente definieren den Plot: Hook, Plot Points, Midpoint, Pinch Points, Resolution. Ideal für Autoren, die das Ende kennen.",
    acts: "3",
    complexity: "Mittel",
    pros: [
      "Beginne mit dem Ende - kein planloses Schreiben",
      "Sehr zielgerichtet und effizient",
      "Gute Balance zwischen Struktur und Freiheit",
      "Hilft bei Plot-Holes vor dem Schreiben"
    ],
    cons: [
      "Erfordert, das Ende zu kennen (nicht für alle Autoren geeignet)",
      "Weniger Raum für Entdeckung beim Schreiben",
      "Kann zu mechanisch wirken"
    ],
    bestFor: ["Mystery", "Thriller", "Crime", "Zielgerichtete Autoren"],
    idealFor: [
      "Mystery-Romane mit komplexen Lösungen",
      "Thriller mit Twist-Endungen",
      "Crime-Stories",
      "Autoren, die das Ende zuerst kennen"
    ],
    beats: [
      { name: "Hook", description: "Protagonist in entgegengesetzter Endzustand", act: "act1", tensionLevel: 10, glossary: ['Hook'] },
      { name: "Plot Point 1", description: "Handlung beginnt, Weg zum Ziel", act: "act1", tensionLevel: 40, glossary: ['Plot Point', 'Inciting Incident'] },
      { name: "Pinch Point 1", description: "Druck durch Antagonist/Kräfte", act: "act2a", tensionLevel: 55, glossary: ['Pinch Point'] },
      { name: "Midpoint", description: "Proaktiv statt reaktiv, falsche Annahme", act: "act2a", tensionLevel: 65, glossary: ['Midpoint'] },
      { name: "Pinch Point 2", description: "Noch mehr Druck, alles verlieren", act: "act2b", tensionLevel: 80, glossary: ['Pinch Point'] },
      { name: "Plot Point 2", description: "Letzte Info, Verzweiflung", act: "act2b", tensionLevel: 85, glossary: ['Plot Point', 'All Is Lost'] },
      { name: "Resolution", description: "Ziel erreicht, Transformation", act: "act3", tensionLevel: 90, glossary: ['Resolution', 'Climax'] },
    ]
  },
  {
    id: 'snowflake',
    name: "Schneeflocken-Methode (Randy Ingermanson)",
    description: "Von einfach zu komplex - iterativ entwickeln",
    detailedDescription: `Die Schneeflocken-Methode wurde von Physiker und Autor Randy Ingermanson entwickelt. Der Name kommt davon, wie Schneeflocken wachsen: von einem Kern aus kristallisieren sie Schicht für Schicht.

Die Methode hat 10 Schritte, die von extrem einfach (ein Satz) zu extrem detailliert (Szenen-Entwürfe) führen:

1. Ein Satz (15 Wörter)
2. Ein Absatz (5 Sätze)
3. Charakter-Sheets
4. Jeder Satz wird ein Absatz
5. Charakter-Synopsis
6. Die 4 Absätze werden zu 4 Seiten
7. Charakter-Details
8. Szenen-Liste
9. Szenen-Entwurf für jedes Kapitel
10. Roman schreiben

Diese Methode reduziert Rewrite-Aufwand enorm, erfordert aber Disziplin in der Planungsphase.`,
    explanation: "Randy Ingermansons iterativer Ansatz: Beginne mit einem Satz, erweitere auf einen Absatz, dann Charaktere, Szenen, Kapitel. Wie eine Schneeflocke, die Kristall für Kristall wächst. Perfekt für Planer.",
    acts: "Variabel",
    complexity: "Komplex",
    pros: [
      "Systematischer Aufbau von einfach zu komplex",
      "Charaktere werden früh und tief entwickelt",
      "Sehr detaillierter Plan vor dem Schreiben",
      "Reduziert Rewrite-Aufwand erheblich"
    ],
    cons: [
      "Sehr zeitintensiv in der Planungsphase",
      "Erfordert hohe Disziplin",
      "Wenig Raum für spontane Entdeckungen",
      "Kann überwältigend wirken"
    ],
    bestFor: ["Komplexe Romane", "Serien", "Fantasy-Epen", "Detailplaner"],
    idealFor: [
      "Komplexe Fantasy-Epen mit vielen Charakteren",
      "Mehrteilige Serien",
      "Historische Romane mit viel Recherche",
      "Autoren, die mehr planen als schreiben wollen"
    ],
    beats: [
      { name: "Schritt 1: Ein Satz", description: "15 Wörter, was ist die Geschichte?", act: "act1", tensionLevel: 5 },
      { name: "Schritt 2: Fünf Sätze", description: "Setup, drei Katastrophen, Ende", act: "act1", tensionLevel: 20 },
      { name: "Schritt 3: Charaktere", description: "Für jeden: Ziel, Motivation, Konflikt", act: "act1", tensionLevel: 30 },
      { name: "Schritt 4: Szenen", description: "Jede Szene aus Satz zu Absatz", act: "act2a", tensionLevel: 45 },
      { name: "Schritt 5: Charakter-Synopsis", description: "Eine Seite pro Hauptcharakter", act: "act2a", tensionLevel: 50 },
      { name: "Schritt 6: Längere Synopsis", description: "Vier Seiten aus den fünf Sätzen", act: "act2b", tensionLevel: 60 },
      { name: "Schritt 7: Szenen-Listen", description: "Detaillierte Liste jeder Szene", act: "act2b", tensionLevel: 70 },
      { name: "Schritt 8: Szenen-Draft", description: "Erster Entwurf jeder Szene", act: "act3", tensionLevel: 80 },
    ]
  },
  {
    id: 'fichtean',
    name: "Fichtean Curves",
    description: "Kontinuierliche Eskalation durch kleine Krisen",
    detailedDescription: `Fichtean Curves basieren auf der Philosophie von Johann Gottlieb Fichte. Statt klarer Akte gibt es eine kontinuierliche Eskalation durch eine Serie von Krisen.

Der Held kämpft sich von einer Krise zur nächsten, wobei jede Krise schlimmer ist als die vorherige. Es gibt keine langen, ruhigen Passagen - die Spannung steigt stetig an.

Diese Struktur ist perfekt für Page-Turner, bei denen der Leser nicht aufhören kann zu lesen. Besonders effektiv in Thrillern und Action-Romanen.

Die Krisen sind wie Wellen: Jede Welle ist höher als die vorherige, bis zur finalen Welle (Climax).`,
    explanation: "Nach Johann Gottlieb Fichte: Statt weniger großer Akte gibt es eine Reihe kleiner Krisen, die kontinuierlich eskalieren. Der Held kämpft sich von Krise zu Krise, jede schwerer als die vorherige, bis zum Höhepunkt.",
    acts: "Kontinuierlich",
    complexity: "Mittel",
    pros: [
      "Kontinuierliche Spannung ohne langsame Passagen",
      "Sehr dynamisch und fesselnd",
      "Flexibel anpassbar an jede Länge",
      "Ideal für page-turner"
    ],
    cons: [
      "Kann Leser ermüden ohne Pausen",
      "Weniger Raum für Charakterentwicklung",
      "Schwierig, langfristige Arcs zu planen"
    ],
    bestFor: ["Thriller", "Action", "Page-Turner", "Suspense"],
    idealFor: [
      "Action-Thriller im Jack-Reacher-Stil",
      "Page-Turner, die man nicht weglegen kann",
      "Serien mit episodischer Struktur",
      "Geschichten mit hohem Tempo"
    ],
    beats: [
      { name: "Ausgangslage", description: "Held in Ausgangssituation", act: "act1", tensionLevel: 10 },
      { name: "Krise 1", description: "Erste Herausforderung", act: "act1", tensionLevel: 30 },
      { name: "Krise 2", description: "Größere Herausforderung", act: "act2a", tensionLevel: 45 },
      { name: "Krise 3", description: "Noch schwieriger", act: "act2a", tensionLevel: 60 },
      { name: "Krise 4", description: "Fast unüberwindbar", act: "act2b", tensionLevel: 75 },
      { name: "Krise 5", description: "Tiefster Punkt", act: "act2b", tensionLevel: 85 },
      { name: "Klimax", description: "Finale Konfrontation", act: "act3", tensionLevel: 98, glossary: ['Climax'] },
      { name: "Auflösung", description: "Nachwirkungen", act: "act3", tensionLevel: 25, glossary: ['Resolution'] },
    ]
  },
  {
    id: 'kishotenketsu',
    name: "Kishōtenketsu (起承転結)",
    description: "Vier-Akt-Struktur ohne Konflikt - asiatische Erzählkunst",
    detailedDescription: `Kishōtenketsu ist die klassische Struktur ostasiatischer Erzählungen (China, Japan, Korea) und funktioniert völlig anders als westliche Strukturen.

Die vier Teile:
起 (Ki) - Einführung: Charaktere und Setting werden vorgestellt
承 (Shō) - Entwicklung: Die Situation entwickelt sich weiter
転 (Ten) - Wendung: Eine überraschende Wendung ändert die Perspektive
結 (Ketsu) - Auflösung: Die Geschichte findet einen befriedigenden Abschluss

Das Besondere: Es gibt keinen direkten Konflikt! Die Spannung entsteht durch die Wendung (Ten), nicht durch Helden vs. Schurke. Dies erlaubt sanftere, philosophischere Geschichten.

Perfekt für Slice-of-Life, Charakterstudien und Geschichten, die nicht auf Kampf basieren.`,
    explanation: "Die klassische ostasiatische Struktur (Ki-Shō-Ten-Ketsu) verzichtet auf direkten Konflikt. Stattdessen: Einführung, Entwicklung, Wendung/Twist, Auflösung. Ideen entwickeln sich organisch, oft durch Erkenntnis statt Kampf.",
    acts: "4",
    complexity: "Einfach",
    pros: [
      "Eine völlig andere, erfrischende Erzählweise",
      "Kein Zwang zu ständigem Konflikt",
      "Perfekt für Slice-of-Life und Charakterstudien",
      "Fördert kreative, nicht-lineare Lösungen"
    ],
    cons: [
      "Kann für westliche Leser ungewohnt sein",
      "Weniger traditionelle Spannungsbögen",
      "Marketing kann schwieriger sein"
    ],
    bestFor: ["Slice of Life", "Charakterstudien", "Lyrik", "Literarische Fiktion"],
    idealFor: [
      "Slice-of-Life Geschichten",
      "Charakterstudien ohne großen Außenkonflikt",
      "Philosophische Erzählungen",
      "Manga und Anime im Stil von Studio Ghibli"
    ],
    beats: [
      { name: "Ki (起) - Einführung", description: "Ideen, Charaktere, Ausgangslage", act: "act1", tensionLevel: 10, glossary: ['Ki'] },
      { name: "Shō (承) - Entwicklung", description: "Weiterführung, Vertiefung", act: "act2a", tensionLevel: 30, glossary: ['Shō'] },
      { name: "Ten (転) - Wendung", description: "Überraschende Wendung/Twist", act: "act2b", tensionLevel: 60, glossary: ['Ten'] },
      { name: "Ketsu (結) - Auflösung", description: "Verbindung zu Anfang, Schlussfolgerung", act: "act3", tensionLevel: 40, glossary: ['Ketsu'] },
    ]
  },
  {
    id: 'disturbance_doorway',
    name: "Disturbance & Two Doorways (James Bell)",
    description: "Ein Störung, zwei Übergänge - minimalistisch und effektiv",
    detailedDescription: `James Scott Bell ("Plot & Structure") schlägt einen minimalistischen Ansatz vor, der auf nur drei Elemente reduziert:

1. Disturbance (Störung): Etwas stört die Balance des normalen Lebens. Etwas ist anders, aber noch nicht kritisch.

2. Doorway 1 (Tür 1): Ein Punkt ohne Rückkehr. Der Held kann nicht mehr zu seinem alten Leben zurück. Er muss sich dem Konflikt stellen.

3. Doorway 2 (Tür 2): Die finale Schwelle. Alles ist auf dem Spiel. Der Held muss handeln oder alles verlieren.

Dazwischen: Die "Todesarena" - der Held kämpft um sein physisches, berufliches oder psychologisches Überleben.

Diese Struktur gibt maximalen Freiraum für die Mitte der Geschichte und eignet sich besonders für Autoren, die gerne "aus dem Handgelenk" schreiben.`,
    explanation: "James Scott Bells minimalistischer Ansatz: Jede Geschichte braucht nur eine Anfangsstörung und zwei Türen (Punkte ohne Rückkehr). Einfach, aber effektiv. Die erste Tür führt in Konflikt, die zweite in den finalen Kampf.",
    acts: "3",
    complexity: "Einfach",
    pros: [
      "Minimalistisch und leicht anzuwenden",
      "Fokus auf das Wesentliche",
      "Viel Freiheit für die Mitte",
      "Gut für Pantser (die beim Schreiben planen)"
    ],
    cons: [
      "Weniger Guidance für komplexe Geschichten",
      "Kann zu dünn werden bei langen Romanen",
      "Erfordert mehr Füllung in Akt 2"
    ],
    bestFor: ["Kurzromane", "Thriller", "Pantser", "Schnelle Entwürfe"],
    idealFor: [
      "Kurzromane und Novellen",
      "Schnelle Thriller",
      "Autoren, die pantsern (beim Schreiben planen)",
      "Erste Entwürfe, die später ausgebaut werden"
    ],
    beats: [
      { name: "Ausgangslage", description: "Held in normalem Leben", act: "act1", tensionLevel: 5 },
      { name: "Disturbance", description: "Etwas stört die Balance", act: "act1", tensionLevel: 20, glossary: ['Disturbance'] },
      { name: "Tür 1", description: "Keine Rückkehr mehr, Handlung beginnt", act: "act1", tensionLevel: 45, glossary: ['Doorway', 'Plot Point'] },
      { name: "Tod-Arena", description: "Konfrontation mit Tod (physisch/professionell/psychologisch)", act: "act2a", tensionLevel: 60 },
      { name: "Tür 2", description: "Letzte Chance, finale Entscheidung", act: "act2b", tensionLevel: 80, glossary: ['Doorway'] },
      { name: "Finale", description: "Letzte Schlacht, alles aufs Spiel", act: "act3", tensionLevel: 95, glossary: ['Climax'] },
    ]
  }
];

// Helper function to get tension data for visualization
export function getTensionCurveData(structure: PlotStructure): { position: number; tension: number; label: string }[] {
  return structure.beats.map((beat, index) => ({
    position: (index / (structure.beats.length - 1)) * 100,
    tension: beat.tensionLevel || 50,
    label: beat.name
  }));
}
