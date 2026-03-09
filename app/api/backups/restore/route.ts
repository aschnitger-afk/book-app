import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// POST /api/backups/restore - Restore from a backup file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId, targetBookId } = body;

    if (!backupId) {
      return NextResponse.json(
        { error: 'backupId is required' },
        { status: 400 }
      );
    }

    // Get backup record
    const backup = await prisma.backupRecord.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Verify file exists
    let fileContent: string;
    try {
      fileContent = await fs.readFile(backup.filePath, 'utf-8');
    } catch (e) {
      return NextResponse.json(
        { error: 'Backup file not found or unreadable' },
        { status: 404 }
      );
    }

    // Parse backup data
    let backupData: any;
    try {
      backupData = JSON.parse(fileContent);
    } catch (e) {
      return NextResponse.json(
        { error: 'Backup file is corrupted' },
        { status: 400 }
      );
    }

    // Verify checksum
    const crypto = await import('crypto');
    const computedChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');
    if (computedChecksum !== backup.checksum) {
      return NextResponse.json(
        { error: 'Backup file checksum mismatch - file may be corrupted' },
        { status: 400 }
      );
    }

    // Restore data
    const restoredIds: any = {
      books: [],
      chapters: [],
      characters: [],
    };

    for (const bookData of backupData.books || []) {
      // Create new book (don't reuse old IDs to avoid conflicts)
      const { id: oldId, chapters, characters, concept, worldSettings, plotPoints, styleProfile, researchNotes, ...bookFields } = bookData;
      
      const newBook = await prisma.book.create({
        data: {
          ...bookFields,
          title: targetBookId && backupData.books.length === 1 
            ? bookFields.title // Keep original title if restoring specific book
            : `${bookFields.title} (Restored)`,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      restoredIds.books.push({ oldId, newId: newBook.id });

      // Restore chapters
      const chapterIdMap = new Map<string, string>();
      for (const chapter of chapters || []) {
        const { id: oldChapterId, bookId, ...chapterFields } = chapter;
        const newChapter = await prisma.chapter.create({
          data: {
            ...chapterFields,
            bookId: newBook.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        chapterIdMap.set(oldChapterId, newChapter.id);
        restoredIds.chapters.push({ oldId: oldChapterId, newId: newChapter.id });
      }

      // Restore characters
      const characterIdMap = new Map<string, string>();
      for (const character of characters || []) {
        const { id: oldCharId, bookId, relationshipConnections, ...charFields } = character;
        const newCharacter = await prisma.character.create({
          data: {
            ...charFields,
            bookId: newBook.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        characterIdMap.set(oldCharId, newCharacter.id);
        restoredIds.characters.push({ oldId: oldCharId, newId: newCharacter.id });
      }

      // Restore concept if exists
      if (concept) {
        const { id, bookId, ...conceptFields } = concept;
        await prisma.concept.create({
          data: {
            ...conceptFields,
            bookId: newBook.id,
          },
        });
      }

      // Restore world settings if exists
      if (worldSettings) {
        const { id, bookId, locations, ...worldFields } = worldSettings;
        const newWorldSettings = await prisma.worldSettings.create({
          data: {
            ...worldFields,
            bookId: newBook.id,
          },
        });

        // Restore locations
        for (const location of locations || []) {
          const { id, worldSettingsId, ...locFields } = location;
          await prisma.location.create({
            data: {
              ...locFields,
              worldSettingsId: newWorldSettings.id,
            },
          });
        }
      }

      // Restore plot points
      for (const plotPoint of plotPoints || []) {
        const { id, bookId, ...ppFields } = plotPoint;
        await prisma.plotPoint.create({
          data: {
            ...ppFields,
            bookId: newBook.id,
          },
        });
      }

      // Restore style profile
      if (styleProfile) {
        const { id, bookId, ...spFields } = styleProfile;
        await prisma.styleProfile.create({
          data: {
            ...spFields,
            bookId: newBook.id,
          },
        });
      }

      // Restore research notes
      for (const note of researchNotes || []) {
        const { id, bookId, ...noteFields } = note;
        await prisma.researchNote.create({
          data: {
            ...noteFields,
            bookId: newBook.id,
          },
        });
      }
    }

    // Update backup record with restore info
    await prisma.backupRecord.update({
      where: { id: backupId },
      data: {
        restoredAt: new Date(),
        status: 'restored',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully restored ${restoredIds.books.length} book(s), ${restoredIds.chapters.length} chapter(s), ${restoredIds.characters.length} character(s)`,
      restoredIds,
    });
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
