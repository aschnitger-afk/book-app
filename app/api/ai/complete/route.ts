import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatCompletion, DEFAULT_PERSONAS } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, context, persona = 'creative_muse', bookId } = await request.json();
    
    console.log('AI Request:', { type, persona, promptLength: prompt?.length, bookId });
    
    if (!prompt?.trim()) {
      return NextResponse.json({ 
        error: 'No prompt provided',
        details: 'Der Text darf nicht leer sein'
      }, { status: 400 });
    }
    
    // Get persona configuration
    const personaConfig = DEFAULT_PERSONAS.find(p => p.key === persona) || DEFAULT_PERSONAS[0];
    
    let systemPrompt = personaConfig.systemPrompt;
    
    // Fetch research notes if bookId is provided
    let researchNotes: string[] = [];
    if (bookId) {
      try {
        const notes = await prisma.researchNote.findMany({
          where: { bookId },
          orderBy: { priority: 'desc' },
          take: 10, // Limit to top 10 most important notes
        });
        researchNotes = notes.map(n => `[${n.category?.toUpperCase() || 'NOTIZ'}] ${n.title}: ${n.content}`).filter(n => n.length > 10);
      } catch (e) {
        console.log('Could not fetch research notes:', e);
      }
    }
    
    // Add specific instructions based on action type
    switch (type) {
      case 'continue':
        systemPrompt += '\n\nFühre den folgenden Text fort. Behalte den gleichen Stil, Ton und Erzählstil bei. Schreibe etwa 100-200 Wörter.';
        break;
      case 'rewrite':
        systemPrompt += '\n\nSchreibe den folgenden Text um, um Klarheit, Fluss und Wirkung zu verbessern, während du den ursprünglichen Sinn und Stil beibehältst.';
        break;
      case 'expand':
        systemPrompt += '\n\nErweitere den folgenden Text mit mehr Details, Beschreibungen und Tiefe. Füge sinnliche Details und emotionale Tiefe hinzu. Schreibe etwa 150-250 Wörter.';
        break;
      case 'assess':
        systemPrompt += '\n\nBewerte das folgende Schreiben. Gib konstruktives Feedback zu: Stärken, Verbesserungsbereichen, Pacing, Dialog, Beschreibung und Gesamteindruck. Sei spezifisch und umsetzbar.';
        break;
      case 'style':
        systemPrompt += '\n\nAnalysiere das folgende Schreibbeispiel und erstelle ein detailliertes Stilprofil. Beschreibe: Satzstruktur-Muster, Wortwahl, Ton, Pacing, wiederkehrende literarische Mittel und charakteristische Merkmale.';
        break;
      case 'brainstorm':
        systemPrompt += '\n\nBrainstorme kreative Ideen basierend auf dem Kontext. Sei einfallsreich und schlage unerwartete Richtungen vor.';
        break;
      case 'feedback':
        systemPrompt += '\n\nGib detailliertes, konstruktives Feedback. Identifiziere, was gut funktioniert und was verbessert werden muss. Sei spezifisch und gib umsetzbare Vorschläge.';
        break;
      case 'polish':
        systemPrompt += '\n\nPoliere und verbessere den Text. Korrigiere Grammatik, Rechtschreibung und Satzbau. Verbessere den Fluss und die Klarheit, aber behalte den ursprünglichen Stil und Inhalt bei.';
        break;
    }
    
    // Add context information (order matters for priority)
    
    // 1. Research Notes (most important for factual accuracy)
    if (researchNotes.length > 0) {
      systemPrompt += `\n\n=== WICHTIGE HINTERGRUNDINFORMATIONEN (SPICKZETTEL) ===\n${researchNotes.join('\n---\n')}\n=== ENDE SPICKZETTEL ===\n\nNutze diese Informationen, um faktisch korrekt und konsistent zu bleiben.`;
    }
    
    // 2. Style Profile
    if (context?.styleProfile) {
      systemPrompt += `\n\nZu imitierender Schreibstil: ${context.styleProfile}`;
    }
    
    // 3. Characters
    if (context?.characters?.length > 0) {
      systemPrompt += `\n\nCharaktere: ${context.characters.map((c: any) => `${c.name}${c.role ? ` (${c.role})` : ''}: ${c.description || 'Keine Beschreibung'}`).join('; ')}`;
    }
    
    // 4. Plot
    if (context?.plot) {
      systemPrompt += `\n\nPlot-Kontext: ${context.plot}`;
    }
    
    // 5. Genre
    if (context?.genre) {
      systemPrompt += `\n\nGenre: ${context.genre}`;
    }
    
    // 6. Concept
    if (context?.concept) {
      systemPrompt += `\n\nBuchkonzept: ${context.concept}`;
    }
    
    console.log('System prompt length:', systemPrompt.length);
    console.log('Research notes included:', researchNotes.length);
    
    console.log('Sending to AI...');
    
    const result = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]);
    
    console.log('AI Response:', result?.substring(0, 100) + '...');
    
    if (!result) {
      return NextResponse.json({ 
        error: 'Empty response from AI',
        details: 'Die KI hat keine Antwort generiert'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      result,
      persona: personaConfig.name,
      contextUsed: {
        researchNotes: researchNotes.length,
        hasStyleProfile: !!context?.styleProfile,
        hasCharacters: !!context?.characters?.length,
      }
    });
  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json({ 
      error: 'AI completion failed',
      details: error?.message || 'Unbekannter Fehler'
    }, { status: 500 });
  }
}
