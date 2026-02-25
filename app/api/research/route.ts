import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const category = searchParams.get('category');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }
    
    const where: any = { bookId };
    if (category) {
      where.category = category;
    }
    
    const notes = await prisma.researchNote.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch research notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const note = await prisma.researchNote.create({
      data
    });
    
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create research note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const note = await prisma.researchNote.update({
      where: { id },
      data
    });
    
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update research note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }
    
    await prisma.researchNote.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete research note' }, { status: 500 });
  }
}

// File upload endpoint
export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bookId = formData.get('bookId') as string;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    
    if (!file || !bookId) {
      return NextResponse.json({ error: 'File and bookId are required' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${uuidv4()}_${file.name}`;
    const publicDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(publicDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type === 'application/pdf' ? 'pdf' : 'document';
    
    const note = await prisma.researchNote.create({
      data: {
        bookId,
        title: title || file.name,
        category: category || 'general',
        fileUrl: `/uploads/${fileName}`,
        fileType,
        fileName: file.name,
      }
    });
    
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
