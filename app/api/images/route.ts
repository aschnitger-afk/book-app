import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const imageType = searchParams.get('type');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    const where: any = { bookId };
    if (imageType) {
      where.imageType = imageType;
    }
    
    const images = await prisma.generatedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }
    
    await prisma.generatedImage.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
