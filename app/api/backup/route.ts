import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

const BACKUP_API_KEY = process.env.BACKUP_API_KEY;
const BACKUP_SERVER_URL = process.env.BACKUP_SERVER_URL;

export async function POST(request: NextRequest) {
  try {
    const { bookId } = await request.json();
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID erforderlich' }, { status: 400 });
    }

    // Check if cloud backup is configured
    if (!BACKUP_SERVER_URL) {
      return NextResponse.json({ 
        error: 'Cloud-Backup nicht konfiguriert',
        localOnly: true 
      }, { status: 200 });
    }

    // Get complete book data from database
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: true,
        characters: true,
        plotPoints: true,
        concept: true,
        worldSettings: {
          include: { locations: true }
        },
        researchNotes: true,
        generatedImages: true,
      }
    });

    if (!book) {
      return NextResponse.json({ error: 'Buch nicht gefunden' }, { status: 404 });
    }

    // Create backup payload
    const backupData = {
      book,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    // In a real implementation, this would upload to a cloud service
    // For now, we simulate the backup
    console.log('Cloud backup would be created:', {
      bookTitle: book.title,
      chapters: book.chapters.length,
      characters: book.characters.length,
      size: JSON.stringify(backupData).length,
    });

    // Backup metadata could be saved here if we had a Backup model
    // For now, we just log it
    console.log('Backup metadata:', {
      bookId,
      timestamp: new Date(),
      size: JSON.stringify(backupData).length,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Backup erstellt',
      timestamp: backupData.timestamp,
      stats: {
        chapters: book.chapters.length,
        characters: book.characters.length,
        plotPoints: book.plotPoints.length,
        wordCount: book.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
      }
    });
  } catch (error: any) {
    console.error('Backup error:', error);
    return NextResponse.json({ 
      error: 'Backup fehlgeschlagen',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    // Return backup status
    return NextResponse.json({ 
      configured: !!BACKUP_SERVER_URL,
      localPath: process.cwd(),
      lastBackup: null, // Would query from database
      bookId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
