import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Create connection between ideas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, sourceId, targetId, type, label, strength, isAiSuggested, aiReasoning } = body;
    
    if (!bookId || !sourceId || !targetId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const connection = await prisma.ideaConnection.create({
      data: {
        bookId,
        sourceId,
        targetId,
        type: type || 'related',
        label: label || null,
        strength: strength || 50,
        isAiSuggested: isAiSuggested || false,
        aiReasoning: aiReasoning || null
      }
    });
    
    return NextResponse.json(connection);
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 });
    }
    console.error('Failed to create connection:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}

// Update connection
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }
    
    const connection = await prisma.ideaConnection.update({
      where: { id },
      data: updates
    });
    
    return NextResponse.json(connection);
  } catch (error) {
    console.error('Failed to update connection:', error);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}

// Delete connection
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }
    
    await prisma.ideaConnection.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete connection:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}
