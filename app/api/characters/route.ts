import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    const characters = await prisma.character.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(characters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, role, description, background, goals, conflicts, notes, bookId } = await request.json();
    
    const character = await prisma.character.create({
      data: {
        name: name || 'New Character',
        role,
        description,
        background,
        goals,
        conflicts,
        notes,
        bookId,
      }
    });
    
    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const character = await prisma.character.update({
      where: { id },
      data
    });
    
    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Character ID required' }, { status: 400 });
    }
    
    await prisma.character.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
