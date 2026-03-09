import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Integrate ideas into plot structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, ideas } = body;
    
    if (!bookId || !ideas || !Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json({ error: 'Book ID and ideas required' }, { status: 400 });
    }
    
    // Get book info
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { title: true, genre: true, description: true }
    });
    
    // Call AI to structure the ideas into plot beats
    const structuredBeats = await structureIdeasIntoPlot(ideas, book);
    
    // Create plot points from the structured beats
    const beatsCreated = [];
    for (let i = 0; i < structuredBeats.length; i++) {
      const beat = structuredBeats[i];
      
      const plotPoint = await prisma.plotPoint.create({
        data: {
          bookId,
          title: beat.title,
          description: beat.description,
          act: beat.act,
          order: i + 1,
          plotPointType: beat.type || 'plot_point',
          notes: beat.notes || '',
        }
      });
      
      beatsCreated.push(plotPoint);
      
      // Mark ideas as converted
      if (beat.sourceIdeaIds) {
        await prisma.storyIdea.updateMany({
          where: { id: { in: beat.sourceIdeaIds } },
          data: { status: 'converted' }
        });
      }
    }
    
    // Update book with plot structure
    await prisma.book.update({
      where: { id: bookId },
      data: {
        plotStructure: JSON.stringify({
          plotStructure: 'ai_generated_from_ideas',
          beats: beatsCreated,
          source: 'idea_board'
        })
      }
    });
    
    return NextResponse.json({
      success: true,
      beatsCreated: beatsCreated.length,
      ideasUsed: ideas.length,
      plotPoints: beatsCreated
    });
    
  } catch (error) {
    console.error('Failed to integrate ideas:', error);
    return NextResponse.json({ error: 'Failed to integrate ideas' }, { status: 500 });
  }
}

interface StructuredBeat {
  title: string;
  description: string;
  act: 'act1' | 'act2a' | 'act2b' | 'act3';
  type?: string;
  notes?: string;
  sourceIdeaIds?: string[];
}

async function structureIdeasIntoPlot(ideas: any[], book: any): Promise<StructuredBeat[]> {
  const prompt = `Als erfahrener Story-Architekt, strukturiere die folgenden Ideen in eine kohärente Story-Struktur.

BUCH-INFO:
Titel: ${book?.title || 'Unbekannt'}
Genre: ${book?.genre || 'Unbekannt'}
Beschreibung: ${book?.description || 'Keine Beschreibung'}

IDEEN (${ideas.length}):
${ideas.map(i => `
[ID: ${i.id}]
Titel: ${i.title}
Typ: ${i.type}
Inhalt: ${i.content?.substring(0, 300) || ''}
`).join('\n---\n')}

AUFGABE:
1. Ordne die Ideen in eine klassische Drei-Akt-Struktur ein
2. Fasse ähnliche Ideen zu einem Plot-Punkt zusammen
3. Identifiziere Lücken und schlage Übergänge vor
4. Erstelle 8-12 Story-Beats

Gib die Antwort als JSON-Array zurück:
[
  {
    "title": "Name des Plot-Punkts",
    "description": "Detaillierte Beschreibung",
    "act": "act1|act2a|act2b|act3",
    "type": "inciting_incident|rising_action|midpoint|climax|resolution",
    "notes": "Zusätzliche Notizen",
    "sourceIdeaIds": ["id1", "id2"]
  }
]`;

  try {
    const response = await fetch('http://localhost:3000/api/ai/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        type: 'brainstorm',
        persona: 'plot_specialist',
      })
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    
    // Parse the AI response
    let beats: StructuredBeat[] = [];
    try {
      const jsonMatch = data.result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        beats = JSON.parse(jsonMatch[0]);
      } else {
        beats = JSON.parse(data.result);
      }
    } catch (e) {
      // Fallback: create simple linear structure
      beats = createFallbackStructure(ideas);
    }
    
    return beats;
  } catch (error) {
    console.error('AI structuring failed:', error);
    return createFallbackStructure(ideas);
  }
}

function createFallbackStructure(ideas: any[]): StructuredBeat[] {
  const totalIdeas = ideas.length;
  const beats: StructuredBeat[] = [];
  
  ideas.forEach((idea, index) => {
    let act: 'act1' | 'act2a' | 'act2b' | 'act3';
    
    if (index < totalIdeas * 0.25) act = 'act1';
    else if (index < totalIdeas * 0.5) act = 'act2a';
    else if (index < totalIdeas * 0.75) act = 'act2b';
    else act = 'act3';
    
    beats.push({
      title: idea.title,
      description: idea.content || '',
      act,
      type: idea.type === 'scene' ? 'scene' : 'plot_point',
      sourceIdeaIds: [idea.id]
    });
  });
  
  return beats;
}
