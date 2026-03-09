import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/snapshots/restore - Restore a chapter from snapshot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { snapshotId, createBackup = true } = body;

    if (!snapshotId) {
      return NextResponse.json(
        { error: 'snapshotId is required' },
        { status: 400 }
      );
    }

    // Get the snapshot
    const snapshot = await prisma.chapterSnapshot.findUnique({
      where: { id: snapshotId },
    });

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Snapshot not found' },
        { status: 404 }
      );
    }

    // Get current chapter state for backup
    const currentChapter = await prisma.chapter.findUnique({
      where: { id: snapshot.chapterId },
    });

    if (!currentChapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Create a pre-restore snapshot if requested
    if (createBackup) {
      await prisma.chapterSnapshot.create({
        data: {
          chapterId: currentChapter.id,
          bookId: currentChapter.bookId,
          title: currentChapter.title,
          content: currentChapter.content,
          wordCount: currentChapter.wordCount,
          label: `Auto-Backup vor Wiederherstellung vom ${new Date(snapshot.createdAt).toLocaleString('de-DE')}`,
          snapshotType: 'pre_restore',
          changeSummary: 'Automatisch vor Wiederherstellung erstellt',
        },
      });
    }

    // Restore the chapter
    const restoredChapter = await prisma.chapter.update({
      where: { id: snapshot.chapterId },
      data: {
        title: snapshot.title,
        content: snapshot.content,
        wordCount: snapshot.wordCount,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      chapter: restoredChapter,
      restoredFrom: {
        id: snapshot.id,
        createdAt: snapshot.createdAt,
        label: snapshot.label,
      },
    });
  } catch (error) {
    console.error('Failed to restore snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to restore snapshot' },
      { status: 500 }
    );
  }
}
