import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    // Get both plot points and plot structure from book
    const [plotPoints, book] = await Promise.all([
      prisma.plotPoint.findMany({
        where: { bookId },
        orderBy: { order: 'asc' }
      }),
      prisma.book.findUnique({
        where: { id: bookId },
        select: { plotStructure: true }
      })
    ]);
    
    // Parse plot structure from book
    let plotStructure = null;
    let beats = [];
    
    if (book?.plotStructure) {
      try {
        const parsed = JSON.parse(book.plotStructure);
        plotStructure = parsed.plotStructure || null;
        beats = parsed.beats || [];
      } catch {
        // Invalid JSON, ignore
      }
    }
    
    return NextResponse.json({ plotPoints, plotStructure, beats });
  } catch (error) {
    console.error('Failed to fetch plot:', error);
    return NextResponse.json({ error: 'Failed to fetch plot data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle plot structure save
    if (body.plotStructure && body.bookId) {
      const { bookId, plotStructure, beats } = body;
      
      await prisma.book.update({
        where: { id: bookId },
        data: {
          plotStructure: JSON.stringify({ plotStructure, beats })
        }
      });
      
      return NextResponse.json({ success: true, plotStructure, beats });
    }
    
    // Handle traditional plot point creation
    const { title, act, description, notes, bookId } = body;
    
    const lastPoint = await prisma.plotPoint.findFirst({
      where: { bookId, act },
      orderBy: { order: 'desc' }
    });
    
    const plotPoint = await prisma.plotPoint.create({
      data: {
        title: title || 'New Plot Point',
        act,
        order: (lastPoint?.order || 0) + 1,
        description,
        notes,
        bookId,
      }
    });
    
    return NextResponse.json(plotPoint);
  } catch (error) {
    console.error('Failed to save plot:', error);
    return NextResponse.json({ error: 'Failed to save plot data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const plotPoint = await prisma.plotPoint.update({
      where: { id },
      data
    });
    
    return NextResponse.json(plotPoint);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plot point' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Plot point ID required' }, { status: 400 });
    }
    
    await prisma.plotPoint.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete plot point' }, { status: 500 });
  }
}
