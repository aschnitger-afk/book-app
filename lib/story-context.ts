/**
 * Story Context Builder
 * 
 * Diese Funktionen sammeln alle Story-Elemente (Welt, Charaktere, Konzept, Plot)
 * und erstellen einen strukturierten Kontext für die KI.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StoryContext {
  // Book metadata
  title: string;
  genre: string;
  description: string;
  projectType: string;
  
  // Concept
  premise?: string;
  themes?: string[];
  tone?: string;
  targetAudience?: string;
  logline?: string;
  centralConflict?: string;
  
  // World
  worldSettings?: {
    timePeriod?: string;
    location?: string;
    worldType?: string;
    geography?: string;
    culture?: string;
    politics?: string;
    technology?: string;
    history?: string;
    rules?: string;
    locations?: Array<{
      name: string;
      description?: string;
      atmosphere?: string;
      significance?: string;
    }>;
  };
  
  // Characters
  characters?: Array<{
    name: string;
    role?: string;
    age?: string;
    appearance?: string;
    background?: string;
    personality?: string;
    goals?: string;
    motivations?: string;
    conflicts?: string;
    flaws?: string;
    strengths?: string;
    arc?: string;
    storyGoal?: string;
    secret?: string;
    tags?: string[];
  }>;
  
  // Plot
  plotStructure?: string;
  plotPoints?: Array<{
    title: string;
    act: string;
    description?: string;
    plotPointType?: string;
    emotionalBeat?: string;
  }>;
  
  // Current writing
  currentChapter?: {
    title: string;
    plotPointId?: string;
    povCharacter?: string;
    setting?: string;
    timeline?: string;
  };
  
  // Research notes relevant to current context
  relevantNotes?: Array<{
    title: string;
    content?: string;
    category?: string;
  }>;
  
  // Style
  styleProfile?: {
    voice?: string;
    tense?: string;
    pov?: string;
  };
}

/**
 * Build complete story context for a book
 */
export async function buildStoryContext(bookId: string, chapterId?: string): Promise<StoryContext> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      concept: true,
      worldSettings: {
        include: {
          locations: true,
        },
      },
      characters: true,
      plotPoints: {
        orderBy: { order: 'asc' },
      },
      styleProfile: true,
      researchNotes: {
        where: { priority: { gte: 5 } },
        orderBy: { priority: 'desc' },
        take: 10,
      },
      chapters: chapterId ? {
        where: { id: chapterId },
        take: 1,
      } : undefined,
    },
  });

  if (!book) {
    throw new Error('Book not found');
  }

  const context: StoryContext = {
    title: book.title,
    genre: book.genre || '',
    description: book.description || '',
    projectType: book.projectType,
  };

  // Add concept
  if (book.concept) {
    context.premise = book.concept.premise || undefined;
    context.themes = book.concept.themes?.split(',').map(t => t.trim()).filter(Boolean);
    context.tone = book.concept.tone || undefined;
    context.targetAudience = book.concept.targetAudience || undefined;
    context.logline = book.concept.logline || undefined;
    context.centralConflict = book.concept.centralConflict || undefined;
  }

  // Add world settings
  if (book.worldSettings) {
    context.worldSettings = {
      timePeriod: book.worldSettings.timePeriod || undefined,
      location: book.worldSettings.location || undefined,
      worldType: book.worldSettings.worldType || undefined,
      geography: book.worldSettings.geography || undefined,
      culture: book.worldSettings.culture || undefined,
      politics: book.worldSettings.politics || undefined,
      technology: book.worldSettings.technology || undefined,
      history: book.worldSettings.history || undefined,
      rules: book.worldSettings.rules || undefined,
      locations: book.worldSettings.locations.map(l => ({
        name: l.name,
        description: l.description || undefined,
        atmosphere: l.atmosphere || undefined,
        significance: l.significance || undefined,
      })),
    };
  }

  // Add characters
  if (book.characters.length > 0) {
    context.characters = book.characters.map(c => ({
      name: c.name,
      role: c.role || undefined,
      age: c.age || undefined,
      appearance: c.appearance || undefined,
      background: c.background || undefined,
      personality: c.personality || undefined,
      goals: c.goals || undefined,
      motivations: c.motivations || undefined,
      conflicts: c.conflicts || undefined,
      flaws: c.flaws || undefined,
      strengths: c.strengths || undefined,
      arc: c.arc || undefined,
      storyGoal: c.storyGoal || undefined,
      secret: c.secret || undefined,
      tags: c.tags?.split(',').map(t => t.trim()).filter(Boolean),
    }));
  }

  // Add plot
  if (book.plotPoints.length > 0) {
    context.plotStructure = book.plotStructure || undefined;
    context.plotPoints = book.plotPoints.map(pp => ({
      title: pp.title,
      act: pp.act,
      description: pp.description || undefined,
      plotPointType: pp.plotPointType || undefined,
      emotionalBeat: pp.emotionalBeat || undefined,
    }));
  }

  // Add current chapter
  if (book.chapters && book.chapters.length > 0) {
    const chapter = book.chapters[0];
    context.currentChapter = {
      title: chapter.title,
      plotPointId: chapter.plotPointId || undefined,
      povCharacter: chapter.povCharacter || undefined,
      setting: chapter.setting || undefined,
      timeline: chapter.timeline || undefined,
    };
  }

  // Add research notes
  if (book.researchNotes.length > 0) {
    context.relevantNotes = book.researchNotes.map(n => ({
      title: n.title,
      content: n.content || undefined,
      category: n.category || undefined,
    }));
  }

  // Add style profile
  if (book.styleProfile) {
    context.styleProfile = {
      voice: book.styleProfile.voice || undefined,
      tense: book.styleProfile.tense || undefined,
      pov: book.styleProfile.pov || undefined,
    };
  }

  return context;
}

/**
 * Create a condensed version of context for API calls
 */
export function createPromptContext(context: StoryContext, currentText: string, userRequest: string): string {
  const parts: string[] = [];

  // Header
  parts.push(`BUCH: "${context.title}" (${context.genre})`);
  
  if (context.logline) {
    parts.push(`LOGLINE: ${context.logline}`);
  }
  
  if (context.tone) {
    parts.push(`TON: ${context.tone}`);
  }

  // World (condensed)
  if (context.worldSettings) {
    parts.push('\n--- WELT ---');
    const ws = context.worldSettings;
    if (ws.worldType) parts.push(`Typ: ${ws.worldType}`);
    if (ws.timePeriod) parts.push(`Zeit: ${ws.timePeriod}`);
    if (ws.location) parts.push(`Ort: ${ws.location}`);
    if (ws.rules) parts.push(`Regeln: ${ws.rules.substring(0, 200)}${ws.rules.length > 200 ? '...' : ''}`);
    if (ws.technology) parts.push(`Tech/Magie: ${ws.technology.substring(0, 200)}${ws.technology.length > 200 ? '...' : ''}`);
  }

  // Characters (only key info)
  if (context.characters && context.characters.length > 0) {
    parts.push('\n--- CHARAKTERE ---');
    context.characters.forEach(c => {
      const charInfo = [`${c.name}${c.role ? ` (${c.role})` : ''}`];
      if (c.storyGoal) charInfo.push(`Ziel: ${c.storyGoal}`);
      if (c.motivations) charInfo.push(`Motivation: ${c.motivations.substring(0, 100)}${c.motivations.length > 100 ? '...' : ''}`);
      if (c.flaws) charInfo.push(`Schwäche: ${c.flaws}`);
      parts.push(charInfo.join(' | '));
    });
  }

  // Current plot point
  if (context.currentChapter?.plotPointId && context.plotPoints) {
    const plotPoint = context.plotPoints.find(pp => pp.title === context.currentChapter?.plotPointId || pp.title.includes(context.currentChapter?.title || ''));
    if (plotPoint) {
      parts.push('\n--- AKTUELLER STORY-BEAT ---');
      parts.push(`${plotPoint.title} (${plotPoint.act})`);
      if (plotPoint.description) parts.push(plotPoint.description);
      if (plotPoint.emotionalBeat) parts.push(`Emotionaler Beat: ${plotPoint.emotionalBeat}`);
    }
  }

  // Current text
  if (currentText) {
    parts.push('\n--- BISHERIGER TEXT (letzte 1500 Zeichen) ---');
    parts.push(currentText.slice(-1500));
  }

  // User request
  parts.push('\n--- ANFRAGE DES AUTORS ---');
  parts.push(userRequest);

  return parts.join('\n');
}

/**
 * Get context for a specific location
 */
export function getLocationContext(context: StoryContext, locationName: string): string | null {
  if (!context.worldSettings?.locations) return null;
  
  const location = context.worldSettings.locations.find(
    l => l.name.toLowerCase() === locationName.toLowerCase()
  );
  
  if (!location) return null;
  
  return `${location.name}: ${location.description}${location.atmosphere ? ` Atmosphäre: ${location.atmosphere}` : ''}`;
}

/**
 * Get context for a specific character
 */
export function getCharacterContext(context: StoryContext, characterName: string): string | null {
  if (!context.characters) return null;
  
  const char = context.characters.find(
    c => c.name.toLowerCase() === characterName.toLowerCase()
  );
  
  if (!char) return null;
  
  const parts = [`${char.name}${char.role ? ` (${char.role})` : ''}`];
  if (char.appearance) parts.push(`Aussehen: ${char.appearance}`);
  if (char.personality) parts.push(`Persönlichkeit: ${char.personality}`);
  if (char.goals) parts.push(`Ziele: ${char.goals}`);
  if (char.motivations) parts.push(`Motivation: ${char.motivations}`);
  if (char.flaws) parts.push(`Schwächen: ${char.flaws}`);
  
  return parts.join(' | ');
}
