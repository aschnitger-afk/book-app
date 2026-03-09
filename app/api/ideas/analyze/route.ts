import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePlotStructureFromIdeas } from '@/lib/ai-helpers';

// AI analysis of ideas - find connections and suggest structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId } = body;
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    // Get all ideas for this book
    const ideas = await prisma.storyIdea.findMany({
      where: { bookId }
    });
    
    if (ideas.length < 2) {
      return NextResponse.json({ 
        error: 'Need at least 2 ideas to analyze connections' 
      }, { status: 400 });
    }
    
    // Get book info for context
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { title: true, genre: true, description: true }
    });
    
    // Call AI to analyze ideas
    const analysis = await generatePlotStructureFromIdeas(ideas, book);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Failed to analyze ideas:', error);
    return NextResponse.json({ error: 'Failed to analyze ideas' }, { status: 500 });
  }
}

// Apply AI suggestions - create connections and update ideas
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, suggestions } = body;
    
    if (!bookId || !suggestions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const results = {
      connectionsCreated: 0,
      ideasUpdated: 0
    };
    
    // Create suggested connections
    if (suggestions.connections && Array.isArray(suggestions.connections)) {
      for (const conn of suggestions.connections) {
        try {
          await prisma.ideaConnection.create({
            data: {
              bookId,
              sourceId: conn.sourceId,
              targetId: conn.targetId,
              type: conn.type || 'related',
              label: conn.label || null,
              strength: conn.strength || 70,
              isAiSuggested: true,
              aiReasoning: conn.reasoning || null
            }
          });
          results.connectionsCreated++;
        } catch (e: any) {
          // Ignore duplicate connection errors
          if (e.code !== 'P2002') {
            console.error('Error creating connection:', e);
          }
        }
      }
    }
    
    // Update ideas with AI metadata
    if (suggestions.ideaUpdates && Array.isArray(suggestions.ideaUpdates)) {
      for (const update of suggestions.ideaUpdates) {
        try {
          await prisma.storyIdea.update({
            where: { id: update.id },
            data: {
              aiSummary: update.summary || null,
              suggestedConnections: update.suggestedConnections 
                ? JSON.stringify(update.suggestedConnections) 
                : null,
              tags: update.tags ? JSON.stringify(update.tags) : null
            }
          });
          results.ideasUpdated++;
        } catch (e) {
          console.error('Error updating idea:', e);
        }
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to apply suggestions:', error);
    return NextResponse.json({ error: 'Failed to apply suggestions' }, { status: 500 });
  }
}
