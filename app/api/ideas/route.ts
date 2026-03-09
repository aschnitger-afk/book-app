import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all ideas for a book
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    const [ideas, connections] = await Promise.all([
      prisma.storyIdea.findMany({
        where: { bookId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ideaConnection.findMany({
        where: { bookId },
        include: {
          source: true,
          target: true
        }
      })
    ]);
    
    return NextResponse.json({ ideas, connections });
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

// Create new idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, title, content, type, positionX, positionY, color, tags } = body;
    
    if (!bookId || !title) {
      return NextResponse.json({ error: 'Book ID and title required' }, { status: 400 });
    }
    
    const idea = await prisma.storyIdea.create({
      data: {
        bookId,
        title,
        content: content || '',
        type: type || 'idea',
        positionX: positionX || Math.random() * 400,
        positionY: positionY || Math.random() * 300,
        color: color || null,
        tags: tags ? JSON.stringify(tags) : null
      }
    });
    
    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to create idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}

// Update idea
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Idea ID required' }, { status: 400 });
    }
    
    // Handle JSON fields
    const data: any = { ...updates };
    if (updates.tags && Array.isArray(updates.tags)) {
      data.tags = JSON.stringify(updates.tags);
    }
    if (updates.suggestedConnections && Array.isArray(updates.suggestedConnections)) {
      data.suggestedConnections = JSON.stringify(updates.suggestedConnections);
    }
    
    const idea = await prisma.storyIdea.update({
      where: { id },
      data
    });
    
    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to update idea:', error);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

// Delete idea
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Idea ID required' }, { status: 400 });
    }
    
    await prisma.storyIdea.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete idea:', error);
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
