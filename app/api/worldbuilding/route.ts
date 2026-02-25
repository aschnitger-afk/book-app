import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    const worldSettings = await prisma.worldSettings.findUnique({
      where: { bookId },
      include: { locations: true }
    });
    
    return NextResponse.json(worldSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch world settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookId, locations, ...worldData } = await request.json();
    
    const worldSettings = await prisma.worldSettings.upsert({
      where: { bookId },
      create: {
        bookId,
        ...worldData
      },
      update: worldData
    });
    
    return NextResponse.json(worldSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save world settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { bookId, ...worldData } = await request.json();
    
    const worldSettings = await prisma.worldSettings.update({
      where: { bookId },
      data: worldData
    });
    
    return NextResponse.json(worldSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update world settings' }, { status: 500 });
  }
}
