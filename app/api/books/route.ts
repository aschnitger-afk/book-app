import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, genre } = await request.json();
    
    // Create book with initial concept
    const book = await prisma.book.create({
      data: {
        title: title || 'Untitled Book',
        description,
        genre,
        status: 'concept',
        currentPhase: 'concept',
      }
    });
    
    // Create empty concept
    await prisma.concept.create({
      data: {
        bookId: book.id,
      }
    });
    
    // Create empty world settings
    await prisma.worldSettings.create({
      data: {
        bookId: book.id,
      }
    });
    
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
