// Extended library with 100+ authors for style analysis and comparison
// Each profile includes 10-dimensional linguistic characteristics

export interface StyleProfile {
  id: string;
  name: string;
  author: string;
  description: string;
  characteristics: {
    pacing: number; // 1=langsam/lyrisch, 10=schnell/action
    dialogueDensity: number; // 1=narrativ, 10=dialoglastig
    descriptionLevel: number; // 1=minimal, 10=sehr detailliert
    sentenceComplexity: number; // 1=einfach/kurz, 10=komplex/lang
    vocabularyRichness: number; // 1=einfach, 10=anspruchsvoll
    emotionalDepth: number; // 1=oberflächlich, 10=tiefgründig
    atmosphericDensity: number; // 1=sachlich, 10=atmosphärisch
    tensionLevel: number; // 1=entspannt, 10=spannend
    introspection: number; // 1=externe Aktion, 10=innerer Monolog
    accessibility: number; // 1=anspruchsvoll/elitär, 10=leicht lesbar
  };
  systemPrompt: string;
  sampleText?: string;
  genre: string;
  era: string;
  nationality?: string;
  notableWorks?: string[];
}

// Helper to generate system prompts
const generatePrompt = (name: string, traits: string[]): string => {
  return `Du schreibst im Stil von ${name}. ${traits.join('. ')}.`;
};

// ============== LITERARY CLASSICS (Pre-1900) ==============
const CLASSIC_AUTHORS: StyleProfile[] = [
  {
    id: 'shakespeare',
    name: 'William Shakespeare',
    author: 'William Shakespeare',
    description: 'Poetisch, dramatisch, Wortspiele, elisabethanisch',
    characteristics: {
      pacing: 6, dialogueDensity: 8, descriptionLevel: 6,
      sentenceComplexity: 9, vocabularyRichness: 10, emotionalDepth: 10,
      atmosphericDensity: 8, tensionLevel: 9, introspection: 7, accessibility: 3
    },
    systemPrompt: "Elisabethanisches Englisch. Iambischer Pentameter. Dramatische Monologe. Wortspiele und Metaphern.",
    genre: 'Drama/Poesie', era: '1590-1613', nationality: 'Englisch',
    notableWorks: ['Hamlet', 'Romeo und Julia', 'Macbeth'],
    sampleText: "Sein oder Nichtsein, das ist hier die Frage: Ob's edler im Gemüt, die Schlingen und die Schwerter der wütenden Fortuna zu erdulden, oder, Waffen gegen eine See voll Ärgenbisse erhebend, durch Widerstand ein Ende zu machen?"
  },
  {
    id: 'cervantes',
    name: 'Miguel de Cervantes',
    author: 'Miguel de Cervantes',
    description: 'Ironisch, abenteuerlich, humanistisch, metafiktional',
    characteristics: {
      pacing: 5, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 7, tensionLevel: 6, introspection: 6, accessibility: 5
    },
    systemPrompt: "Spanische Goldene Ära. Ironische Distanz. Abenteuerliche Erzählung. Humanistische Tiefe.",
    genre: 'Roman', era: '1605-1615', nationality: 'Spanisch',
    notableWorks: ['Don Quijote']
  },
  {
    id: 'dickens',
    name: 'Charles Dickens',
    author: 'Charles Dickens',
    description: 'Satirisch, gesellschaftskritisch, charakterstark, sentimental',
    characteristics: {
      pacing: 5, dialogueDensity: 7, descriptionLevel: 9,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 6, introspection: 5, accessibility: 7
    },
    systemPrompt: "Viktorianisches London. Satirische Gesellschaftskritik. Unvergessliche Charaktere. Sentimentale Momente.",
    genre: 'Gesellschaftsroman', era: '1836-1870', nationality: 'Englisch',
    notableWorks: ['Oliver Twist', 'David Copperfield', 'Great Expectations']
  },
  {
    id: 'austen',
    name: 'Jane Austen',
    author: 'Jane Austen',
    description: 'Ironisch, gesellschaftsbeobachtend, elegant, romantisch',
    characteristics: {
      pacing: 4, dialogueDensity: 8, descriptionLevel: 5,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 7,
      atmosphericDensity: 6, tensionLevel: 4, introspection: 8, accessibility: 8
    },
    systemPrompt: "Ironische Gesellschaftskommentare. Freier indirekter Diskurs. Elegante Dialoge. Romantische Spannung.",
    genre: 'Gesellschaftsroman', era: '1811-1817', nationality: 'Englisch',
    notableWorks: ['Stolz und Vorurteil', 'Emma', 'Sinn und Sinnlichkeit']
  },
  {
    id: 'tolstoy',
    name: 'Leo Tolstoi',
    author: 'Leo Tolstoi',
    description: 'Episch, philosophisch, psychologisch tief, moralisch',
    characteristics: {
      pacing: 2, dialogueDensity: 5, descriptionLevel: 10,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 10,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 10, accessibility: 4
    },
    systemPrompt: "Epische Weite. Philosophische Tiefe. Psychologische Detailgenauigkeit. Moralische Fragen.",
    genre: 'Epischer Roman', era: '1852-1910', nationality: 'Russisch',
    notableWorks: ['Krieg und Frieden', 'Anna Karenina']
  },
  {
    id: 'dostoevsky',
    name: 'Fyodor Dostoevsky',
    author: 'Fyodor Dostoevsky',
    description: 'Psychologisch intensiv, philosophisch, düster, existenziell',
    characteristics: {
      pacing: 3, dialogueDensity: 7, descriptionLevel: 7,
      sentenceComplexity: 9, vocabularyRichness: 9, emotionalDepth: 10,
      atmosphericDensity: 9, tensionLevel: 8, introspection: 10, accessibility: 3
    },
    systemPrompt: "Psychologische Tiefe. Philosophische Dialoge. Existenzielle Düsternis. Moralische Extreme.",
    genre: 'Philosophischer Roman', era: '1846-1881', nationality: 'Russisch',
    notableWorks: ['Verbrechen und Strafe', 'Der Idiot', 'Die Brüder Karamasow']
  },
  {
    id: 'flaubert',
    name: 'Gustave Flaubert',
    author: 'Gustave Flaubert',
    description: 'Präzise, realistisch, stilvoll, distanziert',
    characteristics: {
      pacing: 3, dialogueDensity: 5, descriptionLevel: 9,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 7,
      atmosphericDensity: 8, tensionLevel: 5, introspection: 6, accessibility: 5
    },
    systemPrompt: "Le mot juste. Präzise Beschreibungen. Realistische Distanz. Stilistische Perfektion.",
    genre: 'Realismus', era: '1856-1880', nationality: 'Französisch',
    notableWorks: ['Madame Bovary', 'Salammbô']
  },
  {
    id: 'balzac',
    name: 'Honoré de Balzac',
    author: 'Honoré de Balzac',
    description: 'Detailreich, gesellschaftskritisch, realistisch, umfangreich',
    characteristics: {
      pacing: 3, dialogueDensity: 6, descriptionLevel: 10,
      sentenceComplexity: 7, vocabularyRichness: 9, emotionalDepth: 7,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 6, accessibility: 5
    },
    systemPrompt: "La Comédie Humaine. Detaillierte Gesellschaftsportraits. Realistische Beobachtung.",
    genre: 'Realismus', era: '1829-1850', nationality: 'Französisch',
    notableWorks: ['Vater Goriot', 'Der Wildschütz']
  },
  {
    id: 'hugo',
    name: 'Victor Hugo',
    author: 'Victor Hugo',
    description: 'Episch, romantisch, gesellschaftskritisch, rhetorisch',
    characteristics: {
      pacing: 4, dialogueDensity: 5, descriptionLevel: 10,
      sentenceComplexity: 8, vocabularyRichness: 10, emotionalDepth: 9,
      atmosphericDensity: 10, tensionLevel: 7, introspection: 6, accessibility: 5
    },
    systemPrompt: "Romantische Rhetorik. Epische Breite. Gesellschaftskritik. Monumentale Beschreibungen.",
    genre: 'Romantik', era: '1829-1885', nationality: 'Französisch',
    notableWorks: ['Les Misérables', 'Der Glöckner von Notre-Dame']
  },
  {
    id: 'goethe',
    name: 'Johann Wolfgang von Goethe',
    author: 'Johann Wolfgang von Goethe',
    description: 'Klassisch, universal, philosophisch, bildungsbürgerlich',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 8,
      sentenceComplexity: 9, vocabularyRichness: 10, emotionalDepth: 9,
      atmosphericDensity: 8, tensionLevel: 5, introspection: 9, accessibility: 5
    },
    systemPrompt: "Weimarer Klassik. Bildungsroman. Universelle Themen. Philosophische Tiefe.",
    genre: 'Klassik', era: '1773-1832', nationality: 'Deutsch',
    notableWorks: ['Faust', 'Die Leiden des jungen Werther', 'Wilhelm Meister']
  },
  {
    id: 'kafka',
    name: 'Franz Kafka',
    author: 'Franz Kafka',
    description: 'Existenziell, beklemmend, sachlich, absurd',
    characteristics: {
      pacing: 4, dialogueDensity: 5, descriptionLevel: 6,
      sentenceComplexity: 8, vocabularyRichness: 7, emotionalDepth: 9,
      atmosphericDensity: 9, tensionLevel: 7, introspection: 9, accessibility: 4
    },
    systemPrompt: "Kafkaesk. Bürokratischer Albtraum. Existenzielle Angst. Sachliche Distanz zum Absurden.",
    genre: 'Moderne', era: '1912-1924', nationality: 'Tschechisch/Deutsch',
    notableWorks: ['Die Verwandlung', 'Der Prozess', 'Das Schloss']
  },
  {
    id: 'mann',
    name: 'Thomas Mann',
    author: 'Thomas Mann',
    description: 'Ironisch, musikalisch, symbolisch, bildungsbürgerlich',
    characteristics: {
      pacing: 3, dialogueDensity: 5, descriptionLevel: 9,
      sentenceComplexity: 10, vocabularyRichness: 10, emotionalDepth: 9,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 9, accessibility: 3
    },
    systemPrompt: "Musikalische Prosa. Ironische Distanz. Symbolische Tiefe. Dekadenz und Kultur.",
    genre: 'Moderne', era: '1901-1954', nationality: 'Deutsch',
    notableWorks: ['Der Zauberberg', 'Buddenbrooks', 'Tod in Venedig']
  },
];

// ============== MODERNIST / 20TH CENTURY ==============
const MODERNIST_AUTHORS: StyleProfile[] = [
  {
    id: 'joyce',
    name: 'James Joyce',
    author: 'James Joyce',
    description: 'Experimentell, stream of consciousness, sprachspielerisch',
    characteristics: {
      pacing: 2, dialogueDensity: 6, descriptionLevel: 8,
      sentenceComplexity: 10, vocabularyRichness: 10, emotionalDepth: 9,
      atmosphericDensity: 9, tensionLevel: 4, introspection: 10, accessibility: 1
    },
    systemPrompt: "Stream of consciousness. Sprachliche Experimente. Dublin. Intertextualität.",
    genre: 'Moderne', era: '1914-1939', nationality: 'Irisch',
    notableWorks: ['Ulysses', 'Dubliners', 'Finnegans Wake']
  },
  {
    id: 'woolf',
    name: 'Virginia Woolf',
    author: 'Virginia Woolf',
    description: 'Lyrisch, bewusstseinsstrom, impressionistisch, feministisch',
    characteristics: {
      pacing: 2, dialogueDensity: 5, descriptionLevel: 8,
      sentenceComplexity: 9, vocabularyRichness: 9, emotionalDepth: 9,
      atmosphericDensity: 10, tensionLevel: 4, introspection: 10, accessibility: 3
    },
    systemPrompt: "Stream of consciousness. Impressionistische Momente. Innere Zeit. Weibliche Perspektive.",
    genre: 'Moderne', era: '1915-1941', nationality: 'Englisch',
    notableWorks: ['Mrs Dalloway', 'Orlando', 'Zum Leuchtturm']
  },
  {
    id: 'faulkner',
    name: 'William Faulkner',
    author: 'William Faulkner',
    description: 'Südlicher Gothic, experimentell, multiperspektivisch, rhetorisch',
    characteristics: {
      pacing: 2, dialogueDensity: 6, descriptionLevel: 9,
      sentenceComplexity: 10, vocabularyRichness: 9, emotionalDepth: 9,
      atmosphericDensity: 10, tensionLevel: 6, introspection: 9, accessibility: 2
    },
    systemPrompt: "Südlicher Gothic. Lange Sätze. Multiperspektivität. Yoknapatawpha County.",
    genre: 'Moderne/Southern Gothic', era: '1929-1962', nationality: 'Amerikanisch',
    notableWorks: ['Der Lärm und der Zorn', 'Wie ich im Sterben lag', 'Als ich im Sterben lag']
  },
  {
    id: 'hemingway',
    name: 'Ernest Hemingway',
    author: 'Ernest Hemingway',
    description: 'Minimalistisch, sachlich, iceberg theory, stoisch',
    characteristics: {
      pacing: 6, dialogueDensity: 6, descriptionLevel: 4,
      sentenceComplexity: 3, vocabularyRichness: 5, emotionalDepth: 7,
      atmosphericDensity: 6, tensionLevel: 6, introspection: 5, accessibility: 8
    },
    systemPrompt: "Iceberg Theory. Kurze Sätze. Show don't tell. Stoische Männlichkeit. Einfacher Wortschatz.",
    genre: 'Moderne', era: '1926-1952', nationality: 'Amerikanisch',
    notableWorks: ['Der alte Mann und das Meer', 'In einem anderen Land', 'Fiesta']
  },
  {
    id: 'fitzgerald',
    name: 'F. Scott Fitzgerald',
    author: 'F. Scott Fitzgerald',
    description: 'Lyrisch, jazz age, tragisch, stilvoll',
    characteristics: {
      pacing: 5, dialogueDensity: 7, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 6, introspection: 7, accessibility: 7
    },
    systemPrompt: "Jazz Age. Lyrischer Stil. Amerikanischer Traum. Tragische Eleganz.",
    genre: 'Moderne', era: '1920-1940', nationality: 'Amerikanisch',
    notableWorks: ['Der große Gatsby', 'Zärtlich ist die Nacht']
  },
  {
    id: 'remarque',
    name: 'Erich Maria Remarque',
    author: 'Erich Maria Remarque',
    description: 'Reportagehaft, emotional, antimilitaristisch, klar',
    characteristics: {
      pacing: 6, dialogueDensity: 6, descriptionLevel: 6,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 9,
      atmosphericDensity: 7, tensionLevel: 8, introspection: 7, accessibility: 8
    },
    systemPrompt: "Reportagehafter Stil. Kriegsrealismus. Emotional ehrlich. Klare Sprache.",
    genre: 'Kriegsliteratur', era: '1928-1970', nationality: 'Deutsch',
    notableWorks: ['Im Westen nichts Neues', 'Der schwarze Obelisk']
  },
  {
    id: 'musil',
    name: 'Robert Musil',
    author: 'Robert Musil',
    description: 'Philosophisch, essayistisch, analytisch, ironisch',
    characteristics: {
      pacing: 2, dialogueDensity: 5, descriptionLevel: 8,
      sentenceComplexity: 10, vocabularyRichness: 10, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 4, introspection: 10, accessibility: 2
    },
    systemPrompt: "Essayistischer Roman. Präzise Analyse. Ironische Distanz. Wiener Moderne.",
    genre: 'Moderne', era: '1906-1942', nationality: 'Österreichisch',
    notableWorks: ['Der Mann ohne Eigenschaften']
  },
  {
    id: 'broch',
    name: 'Hermann Broch',
    author: 'Hermann Broch',
    description: 'Philosophisch, polyphon, epistemologisch, komplex',
    characteristics: {
      pacing: 2, dialogueDensity: 5, descriptionLevel: 8,
      sentenceComplexity: 10, vocabularyRichness: 10, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 9, accessibility: 2
    },
    systemPrompt: "Polyphoner Roman. Epistemologische Tiefe. Wertzerfall. Komplexe Strukturen.",
    genre: 'Moderne', era: '1930-1951', nationality: 'Österreichisch',
    notableWorks: ['Die Schlafwandler', 'Der Tod des Vergil']
  },
];

// ============== POSTMODERN / CONTEMPORARY LITERARY ==============
const POSTMODERN_AUTHORS: StyleProfile[] = [
  {
    id: 'marquez',
    name: 'Gabriel García Márquez',
    author: 'Gabriel García Márquez',
    description: 'Magischer Realismus, zyklisch, sinnlich, mythisch',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 9,
      sentenceComplexity: 7, vocabularyRichness: 9, emotionalDepth: 9,
      atmosphericDensity: 10, tensionLevel: 6, introspection: 7, accessibility: 6
    },
    systemPrompt: "Magischer Realismus. Sinnliche Beschreibungen. Zyklische Zeit. Lateinamerikanischer Mythos.",
    genre: 'Magischer Realismus', era: '1967-2014', nationality: 'Kolumbianisch',
    notableWorks: ['Hundert Jahre Einsamkeit', 'Liebe in Zeiten der Cholera']
  },
  {
    id: 'calvino',
    name: 'Italo Calvino',
    author: 'Italo Calvino',
    description: 'Spielerisch, strukturell experimentell, philosophisch leicht',
    characteristics: {
      pacing: 6, dialogueDensity: 5, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 6,
      atmosphericDensity: 7, tensionLevel: 5, introspection: 6, accessibility: 7
    },
    systemPrompt: "Strukturelle Experimente. Spielerische Erzählung. Italienische Leichtigkeit. Konzeptuelle Fantasie.",
    genre: 'Postmoderne', era: '1947-1984', nationality: 'Italienisch',
    notableWorks: ['Wenn ein Reisender in einer Winternacht', 'Die unsichtbaren Städte']
  },
  {
    id: 'borges',
    name: 'Jorge Luis Borges',
    author: 'Jorge Luis Borges',
    description: 'Labyrinthisch, intellektuell, kurz, philosophisch',
    characteristics: {
      pacing: 5, dialogueDensity: 4, descriptionLevel: 6,
      sentenceComplexity: 9, vocabularyRichness: 9, emotionalDepth: 6,
      atmosphericDensity: 8, tensionLevel: 5, introspection: 7, accessibility: 5
    },
    systemPrompt: "Labyrinthe und Spiegel. Intellektuelle Kurzprosa. Philosophische Fiktion. Unendlichkeiten.",
    genre: 'Kurzgeschichte', era: '1935-1983', nationality: 'Argentinisch',
    notableWorks: ['Fiktionen', 'Aleph']
  },
  {
    id: 'kundera',
    name: 'Milan Kundera',
    author: 'Milan Kundera',
    description: 'Philosophisch, essayistisch, erotisch, melancholisch',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 5, introspection: 9, accessibility: 6
    },
    systemPrompt: "Essayistische Reflexionen. Erotik und Politik. Leichtigkeit des Seins. Europäische Melancholie.",
    genre: 'Roman', era: '1967-2014', nationality: 'Tschechisch/Französisch',
    notableWorks: ['Die unerträgliche Leichtigkeit des Seins', 'Die Scherze']
  },
  {
    id: 'murakami',
    name: 'Haruki Murakami',
    author: 'Haruki Murakami',
    description: 'Surreal, melancholisch, popkulturell, minimalistisch',
    characteristics: {
      pacing: 5, dialogueDensity: 6, descriptionLevel: 6,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 9, accessibility: 7
    },
    systemPrompt: "Magischer Realismus. Einsame Protagonisten. Jazz und Kochen. Surreale Träume.",
    genre: 'Zeitgenössisch', era: '1979-2023', nationality: 'Japanisch',
    notableWorks: ['Norwegian Wood', 'Kafka am Strand', '1Q84']
  },
  {
    id: 'ishiguro',
    name: 'Kazuo Ishiguro',
    author: 'Kazuo Ishiguro',
    description: 'Zurückhaltend, emotional, unzuverlässig, subtil',
    characteristics: {
      pacing: 3, dialogueDensity: 7, descriptionLevel: 6,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 9,
      atmosphericDensity: 8, tensionLevel: 6, introspection: 9, accessibility: 7
    },
    systemPrompt: "Unzuverlässige Erzähler. Zurückhaltende Prosa. Unterdrückte Emotionen. Gedämpfte Stimme.",
    genre: 'Zeitgenössisch', era: '1982-2021', nationality: 'Japanisch/Britisch',
    notableWorks: ['Was vom Tage übrig blieb', 'Nie lass mich los', 'Klara und die Sonne']
  },
  {
    id: 'coetzee',
    name: 'J.M. Coetzee',
    author: 'J.M. Coetzee',
    description: 'Karg, philosophisch, politisch, distanziert',
    characteristics: {
      pacing: 3, dialogueDensity: 5, descriptionLevel: 5,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 7, tensionLevel: 6, introspection: 9, accessibility: 4
    },
    systemPrompt: "Karge Prosa. Südafrikanische Politik. Ethik und Gewalt. Distanzierte Erzählung.",
    genre: 'Postkoloniale Literatur', era: '1974-2019', nationality: 'Südafrikanisch',
    notableWorks: ['Schande', 'Im Herzen des Landes']
  },
  {
    id: 'atwood',
    name: 'Margaret Atwood',
    author: 'Margaret Atwood',
    description: 'Spekulativ, feministisch, satirisch, vielseitig',
    characteristics: {
      pacing: 5, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 7, introspection: 7, accessibility: 7
    },
    systemPrompt: "Spekulativer Feminismus. Dystopische Visionen. Kanadische Identität. Satirische Schärfe.",
    genre: 'Spekulativ', era: '1969-2019', nationality: 'Kanadisch',
    notableWorks: ['Der Report der Magd', 'Oryx und Crake', 'Der blinde Mörder']
  },
  {
    id: 'byatt',
    name: 'A.S. Byatt',
    author: 'A.S. Byatt',
    description: 'Intellektuell, literarisch, viktorianisch, dicht',
    characteristics: {
      pacing: 3, dialogueDensity: 5, descriptionLevel: 9,
      sentenceComplexity: 9, vocabularyRichness: 10, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 8, accessibility: 4
    },
    systemPrompt: "Intellektuelle Dichte. Viktorianische Forschung. Literarische Allusionen. Akademische Leidenschaft.",
    genre: 'Literarisch', era: '1964-2009', nationality: 'Englisch',
    notableWorks: ['Besessen', 'Der Sonnenturm']
  },
  {
    id: 'banville',
    name: 'John Banville',
    author: 'John Banville',
    description: 'Sinnesbetont, philosophisch, irisch, malerisch',
    characteristics: {
      pacing: 3, dialogueDensity: 5, descriptionLevel: 9,
      sentenceComplexity: 9, vocabularyRichness: 10, emotionalDepth: 8,
      atmosphericDensity: 10, tensionLevel: 5, introspection: 9, accessibility: 4
    },
    systemPrompt: "Sinnesbetonte Prosa. Irische Landschaften. Malerische Beschreibungen. Philosophische Reflexion.",
    genre: 'Literarisch', era: '1970-2023', nationality: 'Irisch',
    notableWorks: ['Das Meer', 'Das Ungetüm']
  },
];

// ============== THRILLER / CRIME ==============
const THRILLER_AUTHORS: StyleProfile[] = [
  {
    id: 'grisham',
    name: 'John Grisham',
    author: 'John Grisham',
    description: 'Präzise, schnell, juristisch, spannungsgeladen',
    characteristics: {
      pacing: 9, dialogueDensity: 7, descriptionLevel: 5,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 5,
      atmosphericDensity: 5, tensionLevel: 9, introspection: 4, accessibility: 9
    },
    systemPrompt: "Juristische Thriller. Präzise Details. Schnelle Handlung. Klare Gut-Böse-Dynamik.",
    genre: 'Legal Thriller', era: '1989-2024', nationality: 'Amerikanisch',
    notableWorks: ['Die Firma', 'Die Jury', 'Der Regenmacher']
  },
  {
    id: 'clancy',
    name: 'Tom Clancy',
    author: 'Tom Clancy',
    description: 'Technisch, detailreich, militaristisch, komplex',
    characteristics: {
      pacing: 7, dialogueDensity: 5, descriptionLevel: 8,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 5,
      atmosphericDensity: 6, tensionLevel: 8, introspection: 4, accessibility: 6
    },
    systemPrompt: "Technothriller. Militärische Präzision. Geopolitik. Detaillierte Ausrüstung.",
    genre: 'Technothriller', era: '1984-2013', nationality: 'Amerikanisch',
    notableWorks: ['Jagd auf Roter Oktober', 'Schatten des Todes']
  },
  {
    id: 'crichton',
    name: 'Michael Crichton',
    author: 'Michael Crichton',
    description: 'Wissenschaftlich, spannend, lehrreich, schnell',
    characteristics: {
      pacing: 8, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 5,
      atmosphericDensity: 7, tensionLevel: 9, introspection: 4, accessibility: 8
    },
    systemPrompt: "Wissenschafts-Thriller. Populärwissenschaftlich. Spannende Plots. Technologiekritik.",
    genre: 'Science-Thriller', era: '1969-2008', nationality: 'Amerikanisch',
    notableWorks: ['Dinosaurier', 'Kongo', 'Welt im Aufruhr']
  },
  {
    id: 'king',
    name: 'Stephen King',
    author: 'Stephen King',
    description: 'Charakterfokussiert, alltäglicher Horror, detailreich, emotional',
    characteristics: {
      pacing: 6, dialogueDensity: 7, descriptionLevel: 7,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 8, introspection: 7, accessibility: 8
    },
    systemPrompt: "Alltäglicher Horror. Tiefe Charakterisierung. Amerikanische Kleinstadt. Langsame Eskalation.",
    genre: 'Horror', era: '1974-2024', nationality: 'Amerikanisch',
    notableWorks: ['Es', 'Shining', 'Der dunkle Turm']
  },
  {
    id: 'koontz',
    name: 'Dean Koontz',
    author: 'Dean Koontz',
    description: 'Schnell, sentimental, mystisch, optimistisch',
    characteristics: {
      pacing: 8, dialogueDensity: 6, descriptionLevel: 6,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 6,
      atmosphericDensity: 7, tensionLevel: 8, introspection: 6, accessibility: 8
    },
    systemPrompt: "Suspense mit Herz. Gute gegen Böse. Mystische Elemente. Happy Endings.",
    genre: 'Suspense/Horror', era: '1968-2023', nationality: 'Amerikanisch',
    notableWorks: ['Wächter', 'Mitternacht', 'Intensity']
  },
  {
    id: 'patterson',
    name: 'James Patterson',
    author: 'James Patterson',
    description: 'Kurze Kapitel, schnell, serienartig, oberflächlich',
    characteristics: {
      pacing: 10, dialogueDensity: 6, descriptionLevel: 3,
      sentenceComplexity: 3, vocabularyRichness: 4, emotionalDepth: 4,
      atmosphericDensity: 4, tensionLevel: 8, introspection: 3, accessibility: 10
    },
    systemPrompt: "Sehr kurze Kapitel. Schnelle Schnitte. Serienstruktur. Minimalistische Beschreibung.",
    genre: 'Thriller', era: '1976-2024', nationality: 'Amerikanisch',
    notableWorks: ['Alex Cross-Serie', 'Frauenmord-Club']
  },
  {
    id: 'child',
    name: 'Lee Child',
    author: 'Lee Child',
    description: 'Minimalistisch, hart, direkt, action-orientiert',
    characteristics: {
      pacing: 9, dialogueDensity: 6, descriptionLevel: 4,
      sentenceComplexity: 4, vocabularyRichness: 5, emotionalDepth: 5,
      atmosphericDensity: 5, tensionLevel: 9, introspection: 4, accessibility: 9
    },
    systemPrompt: "Jack Reacher. Minimalistischer Stil. Harte Action. Erste-Person-Präsens.",
    genre: 'Action-Thriller', era: '1997-2023', nationality: 'Britisch',
    notableWorks: ['Die Abrechnung', 'One Shot']
  },
  {
    id: 'larsson',
    name: 'Stieg Larsson',
    author: 'Stieg Larsson',
    description: 'Detektivisch, detailreich, gesellschaftskritisch, skandinavisch',
    characteristics: {
      pacing: 6, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 6, vocabularyRichness: 6, emotionalDepth: 6,
      atmosphericDensity: 7, tensionLevel: 7, introspection: 5, accessibility: 7
    },
    systemPrompt: "Nordic Noir. Detailreiche Recherche. Gesellschaftskritik. Komplexe Plots.",
    genre: 'Krimi', era: '2005-2007', nationality: 'Schwedisch',
    notableWorks: ['Verblendung', 'Verdammnis', 'Vergebung']
  },
  {
    id: 'nesbo',
    name: 'Jo Nesbø',
    author: 'Jo Nesbø',
    description: 'Düster, komplex, Harry Hole, norwegisch',
    characteristics: {
      pacing: 7, dialogueDensity: 6, descriptionLevel: 6,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 7,
      atmosphericDensity: 8, tensionLevel: 8, introspection: 6, accessibility: 7
    },
    systemPrompt: "Nordic Noir. Dysfunktionaler Detektiv. Komplexe Morde. Oslo-Atmosphäre.",
    genre: 'Krimi', era: '1997-2023', nationality: 'Norwegisch',
    notableWorks: ['Schneemann', 'Kakerlakken', 'Polizei']
  },
  {
    id: 'mankell',
    name: 'Henning Mankell',
    author: 'Henning Mankell',
    description: 'Gesellschaftskritisch, melancholisch, Wallander, langsam',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 7,
      atmosphericDensity: 8, tensionLevel: 6, introspection: 7, accessibility: 7
    },
    systemPrompt: "Kurt Wallander. Schwedische Melancholie. Gesellschaftskritik. Langsame Ermittlung.",
    genre: 'Krimi', era: '1991-2015', nationality: 'Schwedisch',
    notableWorks: ['Die Tibetische Dogge', 'Hunde von Riga', 'Die fünfte Frau']
  },
  {
    id: 'harris',
    name: 'Thomas Harris',
    author: 'Thomas Harris',
    description: 'Düster, psychologisch, elegant, horror',
    characteristics: {
      pacing: 6, dialogueDensity: 5, descriptionLevel: 8,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 7,
      atmosphericDensity: 9, tensionLevel: 9, introspection: 6, accessibility: 6
    },
    systemPrompt: "Psychologischer Horror. Eleganter Stil. Hannibal Lecter. Düstere Atmosphäre.",
    genre: 'Psychothriller', era: '1975-2019', nationality: 'Amerikanisch',
    notableWorks: ['Schweigen der Lämmer', 'Roter Drache']
  },
  {
    id: 'lehane',
    name: 'Dennis Lehane',
    author: 'Dennis Lehane',
    description: 'Boston, hart, literarisch, charakterfokussiert',
    characteristics: {
      pacing: 6, dialogueDensity: 7, descriptionLevel: 7,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 7, introspection: 7, accessibility: 7
    },
    systemPrompt: "Boston Irish. Harte Realität. Literarischer Krimi. Kenzie und Gennaro.",
    genre: 'Krimi', era: '1994-2023', nationality: 'Amerikanisch',
    notableWorks: ['Mystic River', 'Gone Baby Gone', 'Shutter Island']
  },
];

// ============== FANTASY / SCI-FI ==============
const FANTASY_AUTHORS: StyleProfile[] = [
  {
    id: 'tolkien',
    name: 'J.R.R. Tolkien',
    author: 'J.R.R. Tolkien',
    description: 'Episch, mythologisch, sprachschöpferisch, archaisch',
    characteristics: {
      pacing: 3, dialogueDensity: 5, descriptionLevel: 10,
      sentenceComplexity: 8, vocabularyRichness: 10, emotionalDepth: 8,
      atmosphericDensity: 10, tensionLevel: 6, introspection: 6, accessibility: 5
    },
    systemPrompt: "Hochfantasy. Sprachschöpfung. Mythologische Tiefe. Epische Breite. Archaischer Stil.",
    genre: 'Fantasy', era: '1937-1973', nationality: 'Englisch',
    notableWorks: ['Herr der Ringe', 'Der Hobbit', 'Silmarillion']
  },
  {
    id: 'martin',
    name: 'George R.R. Martin',
    author: 'George R.R. Martin',
    description: 'Düster, komplex, politisch, grausam',
    characteristics: {
      pacing: 5, dialogueDensity: 7, descriptionLevel: 8,
      sentenceComplexity: 6, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 8, introspection: 7, accessibility: 6
    },
    systemPrompt: "Grimdark Fantasy. Multiple POVs. Politische Intrige. Grausame Realität.",
    genre: 'Fantasy', era: '1996-2024', nationality: 'Amerikanisch',
    notableWorks: ['Das Lied von Eis und Feuer', 'A Game of Thrones']
  },
  {
    id: 'sanderson',
    name: 'Brandon Sanderson',
    author: 'Brandon Sanderson',
    description: 'Systematisch, magie-logisch, schnell, produktiv',
    characteristics: {
      pacing: 7, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 6,
      atmosphericDensity: 7, tensionLevel: 7, introspection: 5, accessibility: 8
    },
    systemPrompt: "Hard Magic System. Klare Regeln. Schnelle Plots. Produktive Erzählung.",
    genre: 'Fantasy', era: '2005-2024', nationality: 'Amerikanisch',
    notableWorks: ['Mistborn', 'Die Sturmlicht-Chroniken', 'Elantris']
  },
  {
    id: 'rothfuss',
    name: 'Patrick Rothfuss',
    author: 'Patrick Rothfuss',
    description: 'Lyrisch, musikalisch, Rahmenerzählung, poetisch',
    characteristics: {
      pacing: 3, dialogueDensity: 7, descriptionLevel: 8,
      sentenceComplexity: 7, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 8, accessibility: 6
    },
    systemPrompt: "Name of the Wind. Rahmenerzählung. Musikalische Prosa. Poetische Beschreibungen.",
    genre: 'Fantasy', era: '2007-2021', nationality: 'Amerikanisch',
    notableWorks: ['Die Königsmörder-Chronik', 'Der Name des Windes']
  },
  {
    id: 'jordan',
    name: 'Robert Jordan',
    author: 'Robert Jordan',
    description: 'Episch, detailreich, langsam, komplex',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 9,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 7,
      atmosphericDensity: 9, tensionLevel: 6, introspection: 7, accessibility: 6
    },
    systemPrompt: "Wheel of Time. Epische Länge. Detaillierte Welt. Langsame Entwicklung.",
    genre: 'Fantasy', era: '1990-2013', nationality: 'Amerikanisch',
    notableWorks: ['Das Rad der Zeit']
  },
  {
    id: 'le guin',
    name: 'Ursula K. Le Guin',
    author: 'Ursula K. Le Guin',
    description: 'Anthropologisch, feministisch, gedankenreich, elegant',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 5, introspection: 8, accessibility: 7
    },
    systemPrompt: "Anthropologische SF. Feministische Themen. Taoistische Philosophie. Elegante Prosa.",
    genre: 'Science-Fiction/Fantasy', era: '1966-2018', nationality: 'Amerikanisch',
    notableWorks: ['Gedankenexperimente', 'Die linke Hand der Dunkelheit', 'Earthsea']
  },
  {
    id: 'asimov',
    name: 'Isaac Asimov',
    author: 'Isaac Asimov',
    description: 'Ideengetrieben, sachlich, dialoglastig, zukunftsweisend',
    characteristics: {
      pacing: 6, dialogueDensity: 7, descriptionLevel: 4,
      sentenceComplexity: 5, vocabularyRichness: 7, emotionalDepth: 4,
      atmosphericDensity: 5, tensionLevel: 5, introspection: 4, accessibility: 7
    },
    systemPrompt: "Ideen-SF. Sachliche Erzählung. Robotik-Gesetze. Foundation. Dialoge über Konzepte.",
    genre: 'Science-Fiction', era: '1950-1992', nationality: 'Amerikanisch',
    notableWorks: ['Foundation', 'I, Robot', 'Die Foundation-Trilogie']
  },
  {
    id: 'dick',
    name: 'Philip K. Dick',
    author: 'Philip K. Dick',
    description: 'Paranoid, philosophisch, drogenbeeinflusst, reality-bending',
    characteristics: {
      pacing: 6, dialogueDensity: 6, descriptionLevel: 5,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 7,
      atmosphericDensity: 8, tensionLevel: 7, introspection: 8, accessibility: 6
    },
    systemPrompt: "Paranoide SF. Was ist Realität? Drogen und Bewusstsein. Androiden träumen.",
    genre: 'Science-Fiction', era: '1955-1982', nationality: 'Amerikanisch',
    notableWorks: ['Blade Runner', 'Total Recall', 'Minority Report']
  },
  {
    id: 'herbert',
    name: 'Frank Herbert',
    author: 'Frank Herbert',
    description: 'Ökologisch, komplex, politisch, mystisch',
    characteristics: {
      pacing: 4, dialogueDensity: 5, descriptionLevel: 9,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 7,
      atmosphericDensity: 10, tensionLevel: 7, introspection: 7, accessibility: 4
    },
    systemPrompt: "Dune. Ökologische SF. Politische Komplexität. Wüstenplanet. Mystische Elemente.",
    genre: 'Science-Fiction', era: '1965-1986', nationality: 'Amerikanisch',
    notableWorks: ['Dune', 'Der Wüstenplanet']
  },
  {
    id: 'simmons',
    name: 'Dan Simmons',
    author: 'Dan Simmons',
    description: 'Literarisch, vielseitig, referenzreich, dicht',
    characteristics: {
      pacing: 5, dialogueDensity: 6, descriptionLevel: 9,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 7, introspection: 7, accessibility: 5
    },
    systemPrompt: "Literarische SF. Hyperion. Vielseitige Genres. Referenzen zur klassischen Literatur.",
    genre: 'Science-Fiction/Horror', era: '1989-2020', nationality: 'Amerikanisch',
    notableWorks: ['Hyperion', 'Die Terror', 'Carrion Comfort']
  },
];

// ============== ROMANCE / WOMEN'S FICTION ==============
const ROMANCE_AUTHORS: StyleProfile[] = [
  {
    id: 'roberts',
    name: 'Nora Roberts',
    author: 'Nora Roberts',
    description: 'Warm, charakterfokussiert, irisch, familienthemen',
    characteristics: {
      pacing: 6, dialogueDensity: 7, descriptionLevel: 6,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 7,
      atmosphericDensity: 7, tensionLevel: 5, introspection: 7, accessibility: 9
    },
    systemPrompt: "Zeitgenössische Romance. Starke Frauen. Irischer Hintergrund. Familiengeschichten.",
    genre: 'Romance', era: '1981-2024', nationality: 'Amerikanisch',
    notableWorks: ['Die Bride Quartet', 'Die Garden Trilogy']
  },
  {
    id: 'hoover',
    name: 'Colleen Hoover',
    author: 'Colleen Hoover',
    description: 'Emotional, tiktok-viral, dramatisch, zeitgenössisch',
    characteristics: {
      pacing: 7, dialogueDensity: 8, descriptionLevel: 5,
      sentenceComplexity: 4, vocabularyRichness: 5, emotionalDepth: 9,
      atmosphericDensity: 6, tensionLevel: 7, introspection: 8, accessibility: 9
    },
    systemPrompt: "New Adult. Emotional intensiv. Moderne Beziehungen. TikTok-Bestseller.",
    genre: 'Romance', era: '2011-2024', nationality: 'Amerikanisch',
    notableWorks: ['It Ends With Us', 'Ugly Love', 'Verity']
  },
  {
    id: 'mcguire',
    name: 'Alice Clayton',
    author: 'Alice Clayton',
    description: 'Humorvoll, sexy, leicht, Cocktail-Reihe',
    characteristics: {
      pacing: 7, dialogueDensity: 8, descriptionLevel: 5,
      sentenceComplexity: 4, vocabularyRichness: 5, emotionalDepth: 6,
      atmosphericDensity: 6, tensionLevel: 5, introspection: 5, accessibility: 9
    },
    systemPrompt: "Humorvolle Romance. Sexy ohne Hardcore. Freundschaftsbande. Leichte Lektüre.",
    genre: 'Romance', era: '2012-2019', nationality: 'Amerikanisch',
    notableWorks: ['Wallbanger', 'Rusty Nailed']
  },
  {
    id: 'gabaldon',
    name: 'Diana Gabaldon',
    author: 'Diana Gabaldon',
    description: 'Historisch, detailliert, zeitreise, sinnlich',
    characteristics: {
      pacing: 3, dialogueDensity: 6, descriptionLevel: 9,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 6, introspection: 7, accessibility: 6
    },
    systemPrompt: "Outlander. Historische Genauigkeit. Zeitreise. Sinnliche Romance. Schottland.",
    genre: 'Historical Romance', era: '1991-2024', nationality: 'Amerikanisch',
    notableWorks: ['Outlander', 'Ferne Ufer', 'Die geliehene Zeit']
  },
  {
    id: 'moyes',
    name: 'Jojo Moyes',
    author: 'Jojo Moyes',
    description: 'Britisch, emotional, gesellschaftskritisch, charakterfokussiert',
    characteristics: {
      pacing: 5, dialogueDensity: 7, descriptionLevel: 6,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 9,
      atmosphericDensity: 7, tensionLevel: 6, introspection: 8, accessibility: 8
    },
    systemPrompt: "Britische Romance. Emotional tiefgründig. Gesellschaftsthemen. Charakterstudien.",
    genre: 'Romance', era: '2002-2024', nationality: 'Britisch',
    notableWorks: ['Ein ganzes halbes Jahr', 'Nach dir', 'Mein Herz in zwei Welten']
  },
  {
    id: 'spark',
    name: 'Nicholas Sparks',
    author: 'Nicholas Sparks',
    description: 'Sentimental, südlich, tragisch, christlich',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 7,
      atmosphericDensity: 8, tensionLevel: 6, introspection: 6, accessibility: 8
    },
    systemPrompt: "Nord卡罗来纳. Sentimentale Romance. Tragische Elemente. Christliche Werte.",
    genre: 'Romance', era: '1996-2023', nationality: 'Amerikanisch',
    notableWorks: ['Das Leuchten der Stille', 'Wie ein einziger Tag', 'The Notebook']
  },
];

// ============== CONTEMPORARY / LITERARY FICTION ==============
const CONTEMPORARY_AUTHORS: StyleProfile[] = [
  {
    id: 'franzen',
    name: 'Jonathan Franzen',
    author: 'Jonathan Franzen',
    description: 'Familienepos, gesellschaftskritisch, detailreich, realistisch',
    characteristics: {
      pacing: 3, dialogueDensity: 7, descriptionLevel: 8,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 8, tensionLevel: 5, introspection: 8, accessibility: 5
    },
    systemPrompt: "Familienromane. Amerikanischer Realismus. Gesellschaftskritik. Detailreiche Charaktere.",
    genre: 'Literarisch', era: '1988-2021', nationality: 'Amerikanisch',
    notableWorks: ['Die Korrekturen', 'Freiheit', 'Unruhe']
  },
  {
    id: 'foer',
    name: 'Jonathan Safran Foer',
    author: 'Jonathan Safran Foer',
    description: 'Experimentell, jüdisch, visuell, emotional',
    characteristics: {
      pacing: 5, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 9,
      atmosphericDensity: 8, tensionLevel: 6, introspection: 8, accessibility: 6
    },
    systemPrompt: "Visuelle Experimente. Jüdische Themen. Extreme besondere Lernanstalt. Emotionale Intensität.",
    genre: 'Literarisch', era: '2002-2016', nationality: 'Amerikanisch',
    notableWorks: ['Alles ist erleuchtet', 'Extrem laut und unglaublich nah']
  },
  {
    id: 'eggers',
    name: 'Dave Eggers',
    author: 'Dave Eggers',
    description: 'Postmodern, meta, technikkritisch, innovativ',
    characteristics: {
      pacing: 6, dialogueDensity: 6, descriptionLevel: 6,
      sentenceComplexity: 6, vocabularyRichness: 7, emotionalDepth: 6,
      atmosphericDensity: 6, tensionLevel: 5, introspection: 6, accessibility: 7
    },
    systemPrompt: "Postmoderne Experimente. Technikkritik. Meta-Erzählung. McSweeney's Stil.",
    genre: 'Literarisch', era: '2000-2023', nationality: 'Amerikanisch',
    notableWorks: ['Ein Herzog werk', 'Der Circle', 'Die Parade']
  },
  {
    id: 'rooney',
    name: 'Sally Rooney',
    author: 'Sally Rooney',
    description: 'Millennial, dialoglastig, marxistisch, intime',
    characteristics: {
      pacing: 4, dialogueDensity: 9, descriptionLevel: 4,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 8,
      atmosphericDensity: 6, tensionLevel: 5, introspection: 9, accessibility: 7
    },
    systemPrompt: "Millennial-Beziehungen. Dichte Dialoge. Irische Intellektuelle. Anti-Kapitalismus.",
    genre: 'Literarisch', era: '2017-2024', nationality: 'Irisch',
    notableWorks: ['Unter Freunden', 'Normale Menschen', 'Schöne Welt, wo bist du']
  },
  {
    id: 'cusk',
    name: 'Rachel Cusk',
    author: 'Rachel Cusk',
    description: 'Outline-Trilogie, dialogisch, minimalistisch, feministisch',
    characteristics: {
      pacing: 3, dialogueDensity: 9, descriptionLevel: 4,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 7,
      atmosphericDensity: 6, tensionLevel: 4, introspection: 8, accessibility: 5
    },
    systemPrompt: "Outline-Form. Dialog-Heavy. Minimalistisch. Weibliche Erfahrung. Distanziert.",
    genre: 'Literarisch', era: '1992-2023', nationality: 'Britisch',
    notableWorks: ['Outline', 'Transit', 'Kudos']
  },
  {
    id: 'smith',
    name: 'Ali Smith',
    author: 'Ali Smith',
    description: 'Experimentell, politisch, sprachspielerisch, schottisch',
    characteristics: {
      pacing: 6, dialogueDensity: 7, descriptionLevel: 6,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 7,
      atmosphericDensity: 7, tensionLevel: 5, introspection: 7, accessibility: 6
    },
    systemPrompt: "Sprachliche Experimente. Brexit-Themen. Schottische Stimme. Zeitgenössisch.",
    genre: 'Literarisch', era: '1995-2024', nationality: 'Schottisch',
    notableWorks: ['Herbst', 'Winter', 'Wie man beides zugleich sein kann']
  },
  {
    id: 'mantel',
    name: 'Hilary Mantel',
    author: 'Hilary Mantel',
    description: 'Historisch, Cromwell, präzise, düster',
    characteristics: {
      pacing: 3, dialogueDensity: 7, descriptionLevel: 8,
      sentenceComplexity: 9, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 6, introspection: 8, accessibility: 4
    },
    systemPrompt: "Tudor-England. Thomas Cromwell. Präziser historischer Stil. Düstere Atmosphäre.",
    genre: 'Historischer Roman', era: '1985-2024', nationality: 'Britisch',
    notableWorks: ['Wölfe', 'Die Bücher des Blutes', 'Der Spiegel und das Licht']
  },
  {
    id: 'barry',
    name: 'Sebastian Barry',
    author: 'Sebastian Barry',
    description: 'Irisch, lyrisch, historisch, emotional',
    characteristics: {
      pacing: 3, dialogueDensity: 6, descriptionLevel: 8,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 10,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 9, accessibility: 5
    },
    systemPrompt: "Irische Geschichte. Lyrische Prosa. Familiengeschichten. Tiefe Emotionen.",
    genre: 'Historischer Roman', era: '1982-2023', nationality: 'Irisch',
    notableWorks: ['Die geheimen Schriften', 'Tage ohne Ende', 'Am Horizont ein Hirsch']
  },
  {
    id: 'catton',
    name: 'Eleanor Catton',
    author: 'Eleanor Catton',
    description: 'Postmodern, strukturell, neuseeländisch, literarisch',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 8,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 7,
      atmosphericDensity: 8, tensionLevel: 6, introspection: 7, accessibility: 5
    },
    systemPrompt: "Strukturelle Komplexität. Neuseeland. Viktorianische Erzählung. Postmoderne.",
    genre: 'Literarisch', era: '2008-2023', nationality: 'Neuseeländisch',
    notableWorks: ['Die Leuchten', 'Birnam Wood']
  },
  {
    id: 'davidson',
    name: 'Andrew Davidson',
    author: 'Andrew Davidson',
    description: 'Gargoyle, intensiv, detailreich, gotisch',
    characteristics: {
      pacing: 4, dialogueDensity: 5, descriptionLevel: 9,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 9,
      atmosphericDensity: 9, tensionLevel: 6, introspection: 8, accessibility: 4
    },
    systemPrompt: "Intensive Beschreibungen. Gothic-Elemente. Detailreiche Handwerkskunst. Verfall und Schönheit.",
    genre: 'Gothic', era: '2008', nationality: 'Kanadisch',
    notableWorks: ['Der Gargoyle']
  },
];

// ============== HORROR / DARK FICTION ==============
const HORROR_AUTHORS: StyleProfile[] = [
  {
    id: 'poe',
    name: 'Edgar Allan Poe',
    author: 'Edgar Allan Poe',
    description: 'Gotisch, makaber, psychologisch, melodramatisch',
    characteristics: {
      pacing: 4, dialogueDensity: 4, descriptionLevel: 8,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 10, tensionLevel: 8, introspection: 8, accessibility: 5
    },
    systemPrompt: "Amerikanischer Gothic. Makabere Schönheit. Psychologischer Horror. Melodramatische Sprache.",
    genre: 'Gothic/Horror', era: '1833-1849', nationality: 'Amerikanisch',
    notableWorks: ['Der Rabe', 'Der schwarze Kater', 'Der Fall Valdemar']
  },
  {
    id: 'lovecraft',
    name: 'H.P. Lovecraft',
    author: 'H.P. Lovecraft',
    description: 'Kosmischer Horror, archaisch, deskriptiv, rassistisch',
    characteristics: {
      pacing: 3, dialogueDensity: 3, descriptionLevel: 9,
      sentenceComplexity: 9, vocabularyRichness: 10, emotionalDepth: 6,
      atmosphericDensity: 10, tensionLevel: 7, introspection: 7, accessibility: 3
    },
    systemPrompt: "Kosmischer Horror. Unaussprechliches Grauen. Arkane Wissen. Düstere Beschreibungen.",
    genre: 'Horror', era: '1917-1937', nationality: 'Amerikanisch',
    notableWorks: ['Cthulhu Mythos', 'The Call of Cthulhu']
  },
  {
    id: 'barker',
    name: 'Clive Barker',
    author: 'Clive Barker',
    description: 'Body horror, phantastisch, queer, visionär',
    characteristics: {
      pacing: 6, dialogueDensity: 6, descriptionLevel: 8,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 10, tensionLevel: 8, introspection: 7, accessibility: 6
    },
    systemPrompt: "Body Horror. Phantastische Visionen. Hellraiser. Queere Themen. Grenzüberschreitung.",
    genre: 'Horror/Fantasy', era: '1984-2024', nationality: 'Britisch',
    notableWorks: ['Hellraiser', 'Imajica', 'Weaveworld']
  },
  {
    id: 'straub',
    name: 'Peter Straub',
    author: 'Peter Straub',
    description: 'Literarisch, ghost story, komplex, psychologisch',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 8,
      sentenceComplexity: 8, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 7, introspection: 8, accessibility: 5
    },
    systemPrompt: "Literarischer Horror. Geistergeschichten. Psychologische Tiefe. Komplexe Strukturen.",
    genre: 'Horror', era: '1972-2024', nationality: 'Amerikanisch',
    notableWorks: ['Ghost Story', 'Shadowland', 'The Talisman']
  },
  {
    id: 'danielewski',
    name: 'Mark Z. Danielewski',
    author: 'Mark Z. Danielewski',
    description: 'Experimental, typografisch, labyrinthisch, postmodern',
    characteristics: {
      pacing: 3, dialogueDensity: 5, descriptionLevel: 7,
      sentenceComplexity: 9, vocabularyRichness: 9, emotionalDepth: 7,
      atmosphericDensity: 9, tensionLevel: 7, introspection: 8, accessibility: 2
    },
    systemPrompt: "Typografische Experimente. Haus aus Blättern. Labyrinth-Strukturen. Postmoderner Horror.",
    genre: 'Experimental Horror', era: '2000-2024', nationality: 'Amerikanisch',
    notableWorks: ['Haus aus Blättern', 'Only Revolutions']
  },
  {
    id: 'campbell',
    name: 'Ramsey Campbell',
    author: 'Ramsey Campbell',
    description: 'Unheimlich, britisch, atmosphärisch, subtil',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 8, emotionalDepth: 7,
      atmosphericDensity: 10, tensionLevel: 7, introspection: 7, accessibility: 6
    },
    systemPrompt: "Englischer Horror. Unheimliche Atmosphäre. Subtile Angst. Städtische Düsternis.",
    genre: 'Horror', era: '1964-2023', nationality: 'Britisch',
    notableWorks: ['The Influence', 'The Darkest Part of the Woods']
  },
];

// ============== HISTORICAL FICTION ==============
const HISTORICAL_AUTHORS: StyleProfile[] = [
  {
    id: 'renault',
    name: 'Mary Renault',
    author: 'Mary Renault',
    description: 'Antike, Theseus, Alexander, homosexuell, historisch',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 8,
      sentenceComplexity: 7, vocabularyRichness: 9, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 6, introspection: 7, accessibility: 6
    },
    systemPrompt: "Antike Griechenland. Theseus und Alexander. Historische Authentizität. Homosexuelle Themen.",
    genre: 'Historischer Roman', era: '1956-1981', nationality: 'Britisch',
    notableWorks: ['Der König muss sterben', 'Der Persische Junge']
  },
  {
    id: 'graves',
    name: 'Robert Graves',
    author: 'Robert Graves',
    description: 'Ich Claudius, römisch, witzig, historisch',
    characteristics: {
      pacing: 5, dialogueDensity: 7, descriptionLevel: 7,
      sentenceComplexity: 7, vocabularyRichness: 9, emotionalDepth: 7,
      atmosphericDensity: 8, tensionLevel: 6, introspection: 8, accessibility: 7
    },
    systemPrompt: "Römisches Reich. Ich, Claudius. Historischer Witz. Erste-Person-Erzählung.",
    genre: 'Historischer Roman', era: '1934-1968', nationality: 'Britisch',
    notableWorks: ['Ich, Claudius', 'Claudius der Gott']
  },
  {
    id: 'renault',
    name: 'Bernard Cornwell',
    author: 'Bernard Cornwell',
    description: 'Militärhistorisch, Sharpe, schnell, action',
    characteristics: {
      pacing: 8, dialogueDensity: 6, descriptionLevel: 7,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 6,
      atmosphericDensity: 7, tensionLevel: 9, introspection: 4, accessibility: 8
    },
    systemPrompt: "Historische Militärfiktion. Sharpe-Serie. Schlachtszenen. Britische Geschichte.",
    genre: 'Historischer Roman', era: '1981-2024', nationality: 'Britisch',
    notableWorks: ['Die Scharf-Serie', 'The Last Kingdom']
  },
  {
    id: 'penman',
    name: 'Sharon Kay Penman',
    author: 'Sharon Kay Penman',
    description: 'Mittelalter, Wales, Richard Löwenherz, detailreich',
    characteristics: {
      pacing: 4, dialogueDensity: 6, descriptionLevel: 9,
      sentenceComplexity: 6, vocabularyRichness: 8, emotionalDepth: 8,
      atmosphericDensity: 9, tensionLevel: 6, introspection: 7, accessibility: 6
    },
    systemPrompt: "Mittelalter England und Wales. Richard Löwenherz. Historische Genauigkeit.",
    genre: 'Historischer Roman', era: '1982-2021', nationality: 'Amerikanisch',
    notableWorks: ['When Christ and His Saints Slept', 'The Sunne in Splendour']
  },
  {
    id: 'pillars',
    name: 'Ken Follett',
    author: 'Ken Follett',
    description: 'Mittelalter, Kathedralen, episch, spannend',
    characteristics: {
      pacing: 7, dialogueDensity: 7, descriptionLevel: 8,
      sentenceComplexity: 5, vocabularyRichness: 6, emotionalDepth: 6,
      atmosphericDensity: 8, tensionLevel: 8, introspection: 5, accessibility: 8
    },
    systemPrompt: "Historische Epik. Mittelalter. Kingsbridge. Spannende Plots. Architektur.",
    genre: 'Historischer Thriller', era: '1978-2024', nationality: 'Britisch',
    notableWorks: ['Die Säulen der Erde', 'Die Tore der Welt', 'Winter der Welt']
  },
];

// ============== POETRY / EXPERIMENTAL ==============
const POETRY_EXPERIMENTAL: StyleProfile[] = [
  {
    id: 'rumi',
    name: 'Rumi',
    author: 'Jalāl ad-Dīn Muhammad Rūmī',
    description: 'Mystisch, sufistisch, lyrisch, spirituell',
    characteristics: {
      pacing: 3, dialogueDensity: 3, descriptionLevel: 8,
      sentenceComplexity: 6, vocabularyRichness: 9, emotionalDepth: 10,
      atmosphericDensity: 10, tensionLevel: 3, introspection: 10, accessibility: 6
    },
    systemPrompt: "Sufi-Poesie. Mystische Vereinigung. Spirituelle Metaphern. Tanzende Derwische.",
    genre: 'Mystische Poesie', era: '1207-1273', nationality: 'Persisch',
    notableWorks: ['Mathnawi', 'Diwan']
  },
  {
    id: 'neruda',
    name: 'Pablo Neruda',
    author: 'Pablo Neruda',
    description: 'Sinnlich, politisch, chilenisch, episch',
    characteristics: {
      pacing: 4, dialogueDensity: 3, descriptionLevel: 9,
      sentenceComplexity: 6, vocabularyRichness: 9, emotionalDepth: 10,
      atmosphericDensity: 10, tensionLevel: 5, introspection: 8, accessibility: 7
    },
    systemPrompt: "Chilenische Poesie. Sinnliche Oden. Politisches Engagement. Elementare Oden.",
    genre: 'Poesie', era: '1924-1973', nationality: 'Chilenisch',
    notableWorks: ['20 Gedichte der Liebe', 'Canto General']
  },
  {
    id: 'rilke',
    name: 'Rainer Maria Rilke',
    author: 'Rainer Maria Rilke',
    description: 'Lyrisch, existenziell, deutsch, bildreich',
    characteristics: {
      pacing: 2, dialogueDensity: 2, descriptionLevel: 9,
      sentenceComplexity: 8, vocabularyRichness: 10, emotionalDepth: 10,
      atmosphericDensity: 10, tensionLevel: 4, introspection: 10, accessibility: 4
    },
    systemPrompt: "Deutsche Lyrik. Duineser Elegien. Existenzielle Tiefe. Bilderreichtum.",
    genre: 'Lyrik', era: '1894-1926', nationality: 'Deutsch',
    notableWorks: ['Duineser Elegien', 'Die Sonette an Orpheus', 'Die Aufzeichnungen des Malte Laurids Brigge']
  },
  {
    id: 'eliot',
    name: 'T.S. Eliot',
    author: 'T.S. Eliot',
    description: 'Modernistisch, fragmentiert, allusionsreich, trostlos',
    characteristics: {
      pacing: 3, dialogueDensity: 4, descriptionLevel: 8,
      sentenceComplexity: 9, vocabularyRichness: 10, emotionalDepth: 7,
      atmosphericDensity: 9, tensionLevel: 5, introspection: 8, accessibility: 3
    },
    systemPrompt: "Modernistische Poesie. Die waste land. Fragmentarisch. Allusionen. Trostlosigkeit.",
    genre: 'Moderne', era: '1915-1962', nationality: 'Britisch/Amerikanisch',
    notableWorks: ['The Waste Land', 'The Love Song of J. Alfred Prufrock']
  },
];

// ============== COMBINE ALL ==============
export const ALL_AUTHOR_STYLES: StyleProfile[] = [
  ...CLASSIC_AUTHORS,
  ...MODERNIST_AUTHORS,
  ...POSTMODERN_AUTHORS,
  ...THRILLER_AUTHORS,
  ...FANTASY_AUTHORS,
  ...ROMANCE_AUTHORS,
  ...CONTEMPORARY_AUTHORS,
  ...HORROR_AUTHORS,
  ...HISTORICAL_AUTHORS,
  ...POETRY_EXPERIMENTAL,
];

// For backwards compatibility
export const PREDEFINED_STYLES = ALL_AUTHOR_STYLES;

// Helper function to analyze text style
export function analyzeTextStyle(text: string): Partial<StyleProfile['characteristics']> {
  // Simple heuristics for style analysis
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const words = text.split(/\s+/).filter(w => w);
  const avgSentenceLength = words.length / sentences.length;
  
  // Count dialogue (quoted text)
  const dialogueMatches = text.match(/[""'']([^""'']+)[""'']/g);
  const dialogueRatio = dialogueMatches ? dialogueMatches.join(' ').split(/\s+/).length / words.length : 0;
  
  // Count descriptive words (adjectives/adverbs)
  const descriptiveWords = text.match(/\b\w+(lich|ig|isch|sam|bar|haft)\b/gi);
  const descriptionRatio = descriptiveWords ? descriptiveWords.length / words.length : 0;
  
  // Estimate complexity by word length
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  return {
    pacing: avgSentenceLength < 10 ? 8 : avgSentenceLength < 15 ? 6 : 4,
    dialogueDensity: Math.round(dialogueRatio * 20),
    descriptionLevel: Math.round(descriptionRatio * 100),
    sentenceComplexity: avgSentenceLength > 20 ? 8 : avgSentenceLength > 12 ? 5 : 3,
    vocabularyRichness: avgWordLength > 5 ? 8 : avgWordLength > 4.5 ? 6 : 4,
  };
}

// Find similar authors to a given profile
export function findSimilarAuthors(
  profile: StyleProfile['characteristics'], 
  count: number = 5
): { style: StyleProfile; similarity: number }[] {
  const similarities = ALL_AUTHOR_STYLES.map(style => {
    let totalDiff = 0;
    let keys = 0;
    
    (Object.keys(profile) as Array<keyof typeof profile>).forEach(key => {
      const personal = profile[key] || 0;
      const author = style.characteristics[key] || 0;
      totalDiff += Math.abs(personal - author);
      keys++;
    });
    
    const similarity = 100 - (totalDiff / keys) * 10;
    return { style, similarity: Math.max(0, similarity) };
  });
  
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, count);
}

// Get authors by genre
export function getAuthorsByGenre(genre: string): StyleProfile[] {
  return ALL_AUTHOR_STYLES.filter(a => 
    a.genre.toLowerCase().includes(genre.toLowerCase())
  );
}

// Get authors by era
export function getAuthorsByEra(era: string): StyleProfile[] {
  return ALL_AUTHOR_STYLES.filter(a => 
    a.era.toLowerCase().includes(era.toLowerCase())
  );
}

// Get authors by nationality
export function getAuthorsByNationality(nationality: string): StyleProfile[] {
  return ALL_AUTHOR_STYLES.filter(a => 
    a.nationality?.toLowerCase().includes(nationality.toLowerCase())
  );
}
