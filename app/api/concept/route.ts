import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    const concept = await prisma.concept.findUnique({
      where: { bookId }
    });
    
    return NextResponse.json(concept);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch concept' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookId, ...conceptData } = await request.json();
    
    const concept = await prisma.concept.upsert({
      where: { bookId },
      create: {
        bookId,
        ...conceptData
      },
      update: conceptData
    });
    
    return NextResponse.json(concept);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save concept' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { bookId, ...conceptData } = await request.json();
    
    const concept = await prisma.concept.update({
      where: { bookId },
      data: conceptData
    });
    
    return NextResponse.json(concept);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update concept' }, { status: 500 });
  }
}
