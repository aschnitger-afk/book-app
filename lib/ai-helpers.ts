// AI Helper functions for idea analysis and structure generation

export interface StoryIdea {
  id: string;
  title: string;
  content: string;
  type: string;
  tags?: string | null;
  bookId?: string;
}

export interface BookInfo {
  title?: string | null;
  genre?: string | null;
  description?: string | null;
}

export interface ConnectionSuggestion {
  sourceId: string;
  targetId: string;
  type: 'related' | 'leads_to' | 'conflicts_with' | 'supports';
  label?: string;
  strength: number;
  reasoning: string;
}

export interface IdeaUpdate {
  id: string;
  summary?: string;
  suggestedConnections?: string[];
  tags?: string[];
}

export interface StructureSuggestion {
  connections: ConnectionSuggestion[];
  ideaUpdates: IdeaUpdate[];
  plotStructure?: {
    suggestedOrder: string[];
    acts: {
      act1: string[];
      act2a: string[];
      act2b: string[];
      act3: string[];
    };
    reasoning: string;
  };
}

export async function generatePlotStructureFromIdeas(
  ideas: StoryIdea[],
  book?: BookInfo | null
): Promise<StructureSuggestion> {
  
  const prompt = `Als erfahrener Story-Struktur-Analyst, analysiere die folgenden Story-Ideen und finde Verbindungen sowie eine mögliche Struktur.

BUCH-INFO:
Titel: ${book?.title || 'Unbekannt'}
Genre: ${book?.genre || 'Unbekannt'}
Beschreibung: ${book?.description || 'Keine Beschreibung'}

IDEEN (${ideas.length}):
${ideas.map(i => `
[ID: ${i.id}]
Titel: ${i.title}
Typ: ${i.type}
Inhalt: ${i.content.substring(0, 200)}${i.content.length > 200 ? '...' : ''}
`).join('\n---\n')}

AUFGABE:
1. Identifiziere logische Verbindungen zwischen den Ideen (welche führen zu anderen, welche widersprechen sich, welche unterstützen sich)
2. Ordne die Ideen in eine Story-Struktur ein (Akt 1, Akt 2a, Akt 2b, Akt 3)
3. Gib jedem Idee relevante Tags

Gib deine Antwort als JSON zurück:
{
  "connections": [
    {
      "sourceId": "id der Ausgangs-Idee",
      "targetId": "id der Ziel-Idee", 
      "type": "leads_to|supports|conflicts_with|related",
      "label": "Kurze Beschreibung der Verbindung",
      "strength": 85,
      "reasoning": "Warum diese Ideen verbunden sind"
    }
  ],
  "ideaUpdates": [
    {
      "id": "Ideen-ID",
      "summary": "Kurze Zusammenfassung",
      "tags": ["tag1", "tag2"]
    }
  ],
  "plotStructure": {
    "suggestedOrder": ["id1", "id2", ...],
    "acts": {
      "act1": ["ids für Akt 1"],
      "act2a": ["ids für erste Hälfte Akt 2"],
      "act2b": ["ids für zweite Hälfte Akt 2"],
      "act3": ["ids für Akt 3"]
    },
    "reasoning": "Erklärung der Struktur-Entscheidungen"
  }
}`;

  try {
    const response = await fetch('http://localhost:3000/api/ai/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        type: 'brainstorm',
        persona: 'developmental_editor',
        bookId: ideas[0]?.bookId
      })
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    
    // Parse the AI response
    let result: StructureSuggestion;
    try {
      // Try to extract JSON from the response
      const jsonMatch = data.result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(data.result);
      }
    } catch (e) {
      // Fallback: create basic connections
      result = createBasicConnections(ideas);
    }
    
    return result;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return createBasicConnections(ideas);
  }
}

// Fallback function to create basic connections when AI fails
function createBasicConnections(ideas: StoryIdea[]): StructureSuggestion {
  const connections: ConnectionSuggestion[] = [];
  const ideaUpdates: IdeaUpdate[] = [];
  
  // Create connections based on type compatibility
  for (let i = 0; i < ideas.length; i++) {
    for (let j = i + 1; j < ideas.length; j++) {
      const idea1 = ideas[i];
      const idea2 = ideas[j];
      
      // Simple heuristic: similar types might be related
      if (idea1.type === idea2.type) {
        connections.push({
          sourceId: idea1.id,
          targetId: idea2.id,
          type: 'related',
          label: 'Ähnlicher Typ',
          strength: 50,
          reasoning: 'Beide Ideen sind vom gleichen Typ'
        });
      }
      
      // Scenes often lead to plot points
      if (idea1.type === 'scene' && idea2.type === 'plot_point') {
        connections.push({
          sourceId: idea1.id,
          targetId: idea2.id,
          type: 'leads_to',
          label: 'Führt zu',
          strength: 60,
          reasoning: 'Szene könnte zu diesem Plot-Punkt führen'
        });
      }
    }
    
    // Create basic update for each idea
    ideaUpdates.push({
      id: ideas[i].id,
      summary: ideas[i].content.substring(0, 100),
      tags: [ideas[i].type]
    });
  }
  
  return {
    connections,
    ideaUpdates,
    plotStructure: {
      suggestedOrder: ideas.map(i => i.id),
      acts: {
        act1: ideas.filter((_, idx) => idx < ideas.length * 0.25).map(i => i.id),
        act2a: ideas.filter((_, idx) => idx >= ideas.length * 0.25 && idx < ideas.length * 0.5).map(i => i.id),
        act2b: ideas.filter((_, idx) => idx >= ideas.length * 0.5 && idx < ideas.length * 0.75).map(i => i.id),
        act3: ideas.filter((_, idx) => idx >= ideas.length * 0.75).map(i => i.id)
      },
      reasoning: 'Automatisch generierte Struktur basierend auf der Reihenfolge der Ideen'
    }
  };
}
