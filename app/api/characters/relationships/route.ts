import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all relationships for a book
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    const relationships = await prisma.relationshipConnection.findMany({
      where: { bookId },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            portraitUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(relationships);
  } catch (error) {
    console.error('Failed to fetch relationships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relationships' },
      { status: 500 }
    );
  }
}

// POST create new relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, targetId, type, strength, description, isConflict, bookId } = body;

    if (!sourceId || !targetId || !bookId) {
      return NextResponse.json(
        { error: 'Source, target, and book ID required' },
        { status: 400 }
      );
    }

    const relationship = await prisma.relationshipConnection.create({
      data: {
        sourceId,
        targetId,
        type: type || 'ally',
        strength: strength || 50,
        description,
        isConflict: isConflict || false,
        bookId,
      },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            portraitUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(relationship);
  } catch (error) {
    console.error('Failed to create relationship:', error);
    return NextResponse.json(
      { error: 'Failed to create relationship' },
      { status: 500 }
    );
  }
}

// DELETE relationship
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Relationship ID required' }, { status: 400 });
    }

    await prisma.relationshipConnection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete relationship:', error);
    return NextResponse.json(
      { error: 'Failed to delete relationship' },
      { status: 500 }
    );
  }
}
