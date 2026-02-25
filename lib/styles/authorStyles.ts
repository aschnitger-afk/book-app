export interface StyleProfile {
  id: string;
  name: string;
  author: string;
  description: string;
  characteristics: {
    pacing: number; // 1=langsam, 10=schnell
    dialogueDensity: number; // 1=wenig Dialog, 10=viel Dialog
    descriptionLevel: number; // 1=minimal, 10=sehr detailliert
    sentenceComplexity: number; // 1=einfach, 10=komplex
    vocabularyRichness: number; // 1=einfach, 10=anspruchsvoll
    emotionalDepth: number; // 1=oberflächlich, 10=tiefgründig
    atmosphericDensity: number; // 1=sachlich, 10=atmosphärisch
    tensionLevel: number; // 1=entspannt, 10=spannend
    introspection: number; // 1=externe Aktion, 10=innerer Monolog
    accessibility: number; // 1=anspruchsvoll, 10=leicht lesbar
  };
  systemPrompt: string;
  sampleText?: string;
  genre: string;
  era: string;
}

export const PREDEFINED_STYLES: StyleProfile[] = [
  {
    id: 'grisham',
    name: 'John Grisham',
    author: 'John Grisham',
    description: 'Präzise, schnell, juristisch, spannungsgeladen',
    characteristics: {
      pacing: 8,
      dialogueDensity: 7,
      descriptionLevel: 5,
      sentenceComplexity: 5,
      vocabularyRichness: 6,
      emotionalDepth: 6,
      atmosphericDensity: 5,
      tensionLevel: 9,
      introspection: 4,
      accessibility: 9,
    },
    systemPrompt: `Du schreibst im Stil von John Grisham: Präzise, schnell und spannungsgeladen. 
- Nutze kurze, direkte Sätze
- Fokussiere auf Dialoge und Handlung
- Beschreibe juristische/technische Details akkurat
- Baue Spannung durch Cliffhanger auf
- Vermeide überflüssige Beschreibungen
- Zeige Charaktere durch ihre Handlungen, nicht durch innere Monologe`,
    genre: 'Thriller / Rechtsdrama',
    era: 'Zeitgenössisch',
  },
  {
    id: 'wilson',
    name: 'F. Paul Wilson',
    author: 'F. Paul Wilson',
    description: 'Horror-Medizinisch, detailreich, atmosphärisch',
    characteristics: {
      pacing: 7,
      dialogueDensity: 6,
      descriptionLevel: 8,
      sentenceComplexity: 7,
      vocabularyRichness: 7,
      emotionalDepth: 7,
      atmosphericDensity: 9,
      tensionLevel: 9,
      introspection: 6,
      accessibility: 7,
    },
    systemPrompt: `Du schreibst im Stil von F. Paul Wilson: Horrorthriller mit medizinischem Fokus.
- Beschreibe körperliche Details und Verletzungen präzise
- Baue eine unheimliche Atmosphäre auf
- Mische Alltägliches mit dem Übernatürlichen
- Nutze medizinische Fachterminologie korrekt
- Zeige die Verletzlichkeit des menschlichen Körpers
- Schaffe Kontrast zwischen Normalität und Horror`,
    genre: 'Horror / Medizin-Thriller',
    era: 'Zeitgenössisch',
  },
  {
    id: 'mann',
    name: 'Thomas Mann',
    author: 'Thomas Mann',
    description: 'Philosophisch, komplex, symbolisch, anspruchsvoll',
    characteristics: {
      pacing: 3,
      dialogueDensity: 4,
      descriptionLevel: 10,
      sentenceComplexity: 10,
      vocabularyRichness: 10,
      emotionalDepth: 10,
      atmosphericDensity: 9,
      tensionLevel: 5,
      introspection: 10,
      accessibility: 3,
    },
    systemPrompt: `Du schreibst im Stil von Thomas Mann: Philosophisch, komplex und literarisch anspruchsvoll.
- Verwende lange, verschachtelte Sätze
- Nutze reiche, präzise Wortwahl
- Integriere philosophische und kulturelle Referenzen
- Beschreibe innere Zustände und Gedanken detailliert
- Arbeite mit Symbolik und Allegorie
- Zeige den Konflikt zwischen Kunst und Leben
- Schaffe atmosphärische Tiefe durch Musik/Literatur-Referenzen`,
    genre: 'Literarischer Roman',
    era: 'Frühes 20. Jahrhundert',
  },
  {
    id: 'hemingway',
    name: 'Ernest Hemingway',
    author: 'Ernest Hemingway',
    description: 'Minimalistisch, direkt, eisberg-theorie, emotional durch Aktion',
    characteristics: {
      pacing: 7,
      dialogueDensity: 8,
      descriptionLevel: 3,
      sentenceComplexity: 3,
      vocabularyRichness: 4,
      emotionalDepth: 8,
      atmosphericDensity: 6,
      tensionLevel: 7,
      introspection: 2,
      accessibility: 9,
    },
    systemPrompt: `Du schreibst im Stil von Ernest Hemingway: Minimalistisch und direkt.
- Nutze kurze, einfache Sätze
- Zeige Emotionen durch Aktionen, nicht Worte
- Vermeide Adjektive und Adverbien wo möglich
- Nutze den "Eisberg"-Ansatz: Zeige nur die Spitze
- Dialoge sollten wie echte Gespräche klingen
- Beschreibe Natur und Umgebung präzise aber sparsam`,
    genre: 'Modernistisch',
    era: '20. Jahrhundert',
  },
  {
    id: 'martin',
    name: 'George R.R. Martin',
    author: 'George R.R. Martin',
    description: 'Episch, detailreich, moralisch komplex, viele Perspektiven',
    characteristics: {
      pacing: 6,
      dialogueDensity: 7,
      descriptionLevel: 9,
      sentenceComplexity: 7,
      vocabularyRichness: 8,
      emotionalDepth: 9,
      atmosphericDensity: 9,
      tensionLevel: 8,
      introspection: 7,
      accessibility: 6,
    },
    systemPrompt: `Du schreibst im Stil von George R.R. Martin: Episches Fantasy mit moralischer Komplexität.
- Wechsle zwischen verschiedenen Perspektiven
- Zeige Grautöne statt Schwarz-Weiß
- Beschreibe Settings detailreich (Essen, Kleidung, Architektur)
- Führe politische Intrigen und Allianzen ein
- Nutze unerwartete Wendungen und Tode
- Balanciere Action mit Charakterentwicklung`,
    genre: 'Epic Fantasy',
    era: 'Mittelalter-Fantasy',
  },
  {
    id: 'tolkien',
    name: 'J.R.R. Tolkien',
    author: 'J.R.R. Tolkien',
    description: 'Mythologisch, poetisch, sprachschöpferisch, episch',
    characteristics: {
      pacing: 4,
      dialogueDensity: 5,
      descriptionLevel: 10,
      sentenceComplexity: 8,
      vocabularyRichness: 10,
      emotionalDepth: 8,
      atmosphericDensity: 10,
      tensionLevel: 6,
      introspection: 6,
      accessibility: 4,
    },
    systemPrompt: `Du schreibst im Stil von J.R.R. Tolkien: Mythologisch und episch.
- Schaffe eine tiefe Geschichte und Mythologie
- Nutze poetische, rhythmische Sprache
- Beschreibe Landschaften und Natur liebevoll
- Erfinde eigene Sprachen und Namen
- Zeige das Gute kämpft gegen das Böse
- Nutze Lieder und Gedichte in der Erzählung
- Schreibe langsame, atmosphärische Aufbauten`,
    genre: 'High Fantasy',
    era: 'Mythologisches Mittelalter',
  },
  {
    id: 'austen',
    name: 'Jane Austen',
    author: 'Jane Austen',
    description: 'Witzig, ironisch, gesellschaftskritisch, elegant',
    characteristics: {
      pacing: 5,
      dialogueDensity: 9,
      descriptionLevel: 6,
      sentenceComplexity: 7,
      vocabularyRichness: 7,
      emotionalDepth: 8,
      atmosphericDensity: 7,
      tensionLevel: 5,
      introspection: 8,
      accessibility: 8,
    },
    systemPrompt: `Du schreibst im Stil von Jane Austen: Witzig und gesellschaftskritisch.
- Nutze ironischen, spöttischen Unterton
- Fokussiere auf Gesellschaft und Etikette
- Zeige Charakter durch Konversation
- Kritisiere Klassenunterschiede elegant
- Beschreibe Kleidung und Manieren präzise
- Zeige Romantik durch Zurückhaltung`,
    genre: 'Gesellschaftsroman',
    era: 'Regency (ca. 1800)',
  },
  {
    id: 'murakami',
    name: 'Haruki Murakami',
    author: 'Haruki Murakami',
    description: 'Surreal, melancholisch, musikalisch, alltäglich-magisch',
    characteristics: {
      pacing: 5,
      dialogueDensity: 6,
      descriptionLevel: 7,
      sentenceComplexity: 6,
      vocabularyRichness: 7,
      emotionalDepth: 9,
      atmosphericDensity: 9,
      tensionLevel: 5,
      introspection: 9,
      accessibility: 7,
    },
    systemPrompt: `Du schreibst im Stil von Haruki Murakami: Surreal und melancholisch.
- Mische Alltägliches mit dem Surrealen
- Nutze Musik als wiederkehrendes Motiv
- Beschreibe alltägliche Rituale (Kochen, Sport)
- Zeige Einsamkeit und Sehnsucht
- Nutze Träume und Symbole
- Löse nicht alle Mysterien auf`,
    genre: 'Magischer Realismus',
    era: 'Zeitgenössisch',
  },
];

export function analyzeTextStyle(text: string): Partial<StyleProfile['characteristics']> {
  // Simple heuristics for text analysis
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return {};
  }
  
  // Average sentence length
  const avgSentenceLength = words.length / sentences.length;
  const sentenceComplexity = Math.min(10, Math.max(1, avgSentenceLength / 3));
  
  // Dialogue density (rough estimate based on quotation marks)
  const dialogueMatches = text.match(/["']/g);
  const dialogueDensity = Math.min(10, Math.max(1, (dialogueMatches?.length || 0) / 10));
  
  // Vocabulary richness (unique words / total words)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const vocabularyRichness = Math.min(10, Math.max(1, (uniqueWords.size / words.length) * 20));
  
  // Description level (based on adjectives/adverbs - rough heuristic)
  const descriptiveWords = words.filter(w => 
    w.endsWith('ly') || 
    w.endsWith('ful') || 
    w.endsWith('ous') ||
    w.endsWith('ive')
  ).length;
  const descriptionLevel = Math.min(10, Math.max(1, (descriptiveWords / words.length) * 50));
  
  return {
    sentenceComplexity: Math.round(sentenceComplexity),
    dialogueDensity: Math.round(dialogueDensity),
    vocabularyRichness: Math.round(vocabularyRichness),
    descriptionLevel: Math.round(descriptionLevel),
  };
}
