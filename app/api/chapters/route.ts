import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { title, bookId } = await request.json();
    
    const lastChapter = await prisma.chapter.findFirst({
      where: { bookId },
      orderBy: { order: 'desc' }
    });
    
    const chapter = await prisma.chapter.create({
      data: {
        title: title || `Chapter ${(lastChapter?.order || 0) + 1}`,
        bookId,
        order: (lastChapter?.order || 0) + 1,
        content: '',
      }
    });
    
    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
