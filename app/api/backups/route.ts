import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Ensure backup directory exists
async function getBackupDir() {
  const backupDir = path.join(os.homedir(), 'Documents', 'AuthorAI-Backups');
  await fs.mkdir(backupDir, { recursive: true });
  return backupDir;
}

// GET /api/backups?bookId=xxx - Get all backups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    const where = bookId ? { bookId } : {};

    const backups = await prisma.backupRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Failed to fetch backups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

// POST /api/backups - Create a new backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, backupType = 'manual', label } = body;

    // Get data to backup
    let books: any[] = [];
    let chapters: any[] = [];
    let characters: any[] = [];

    if (bookId) {
      // Backup specific book with all related data
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        include: {
          chapters: true,
          characters: true,
          concept: true,
          worldSettings: {
            include: { locations: true },
          },
          plotPoints: true,
          styleProfile: true,
          researchNotes: true,
          generatedImages: true,
          storyIdeas: true,
          ideaConnections: true,
          relationshipConnections: true,
        },
      });

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      books = [book];
      chapters = book.chapters;
      characters = book.characters;
    } else {
      // Backup all books
      books = await prisma.book.findMany({
        include: {
          chapters: true,
          characters: true,
          concept: true,
          worldSettings: {
            include: { locations: true },
          },
          plotPoints: true,
          styleProfile: true,
          researchNotes: true,
          generatedImages: true,
          storyIdeas: true,
          ideaConnections: true,
          relationshipConnections: true,
        },
      });

      chapters = books.flatMap((b: any) => b.chapters);
      characters = books.flatMap((b: any) => b.characters);
    }

    // Create backup data structure
    const backupData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      type: bookId ? 'single_book' : 'full_backup',
      label: label || null,
      books,
      metadata: {
        bookCount: books.length,
        chapterCount: chapters.length,
        characterCount: characters.length,
        wordCount: chapters.reduce((sum: number, c: any) => sum + (c.wordCount || 0), 0),
      },
    };

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const bookName = bookId ? books[0]?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'book' : 'all-books';
    const filename = `authorai-backup-${bookName}-${timestamp}.json`;

    // Save to backup directory
    const backupDir = await getBackupDir();
    const filePath = path.join(backupDir, filename);
    const content = JSON.stringify(backupData, null, 2);

    await fs.writeFile(filePath, content, 'utf-8');

    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    // Get file size
    const stats = await fs.stat(filePath);

    // Save backup record to database
    const backupRecord = await prisma.backupRecord.create({
      data: {
        bookId,
        filename,
        filePath,
        fileSize: stats.size,
        checksum,
        backupType,
        bookCount: books.length,
        chapterCount: chapters.length,
        characterCount: characters.length,
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      backup: backupRecord,
      path: filePath,
    });
  } catch (error) {
    console.error('Failed to create backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// DELETE /api/backups?id=xxx - Delete a backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const backup = await prisma.backupRecord.findUnique({
      where: { id },
    });

    if (!backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Delete file if it exists
    try {
      await fs.unlink(backup.filePath);
    } catch (e) {
      // File might not exist, that's okay
      console.warn('Could not delete backup file:', e);
    }

    // Delete record
    await prisma.backupRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
