import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, description, sampleText, bookId } = await request.json();
    
    // Delete existing style profile if any
    await prisma.styleProfile.deleteMany({
      where: { bookId }
    });
    
    const styleProfile = await prisma.styleProfile.create({
      data: {
        name,
        description,
        sampleText,
        bookId,
      }
    });
    
    return NextResponse.json(styleProfile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save style profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const styleProfile = await prisma.styleProfile.update({
      where: { id },
      data
    });
    
    return NextResponse.json(styleProfile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update style profile' }, { status: 500 });
  }
}
