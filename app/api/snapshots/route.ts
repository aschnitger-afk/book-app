import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// GET /api/snapshots?chapterId=xxx - Get all snapshots for a chapter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const bookId = searchParams.get('bookId');

    if (!chapterId && !bookId) {
      return NextResponse.json(
        { error: 'chapterId or bookId is required' },
        { status: 400 }
      );
    }

    const where = chapterId ? { chapterId } : { bookId: bookId! };

    const snapshots = await prisma.chapterSnapshot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 snapshots
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error('Failed to fetch snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    );
  }
}

// POST /api/snapshots - Create a new snapshot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, bookId, title, content, wordCount, label, snapshotType = 'manual' } = body;

    if (!chapterId || !bookId) {
      return NextResponse.json(
        { error: 'chapterId and bookId are required' },
        { status: 400 }
      );
    }

    // Get previous snapshot for this chapter to compute diff
    const previousSnapshot = await prisma.chapterSnapshot.findFirst({
      where: { chapterId },
      orderBy: { createdAt: 'desc' },
    });

    // Compute simple change summary
    let changeSummary = '';
    if (previousSnapshot) {
      const wordDiff = (wordCount || 0) - previousSnapshot.wordCount;
      if (wordDiff > 0) {
        changeSummary = `+${wordDiff} Wörter`;
      } else if (wordDiff < 0) {
        changeSummary = `${wordDiff} Wörter`;
      } else {
        changeSummary = 'Keine Wortänderung';
      }
    } else {
      changeSummary = 'Erste Version';
    }

    const snapshot = await prisma.chapterSnapshot.create({
      data: {
        chapterId,
        bookId,
        title: title || 'Untitled',
        content: content || '',
        wordCount: wordCount || 0,
        label,
        snapshotType,
        previousSnapshotId: previousSnapshot?.id || null,
        changeSummary,
      },
    });

    // Cleanup: Keep only last 30 auto-snapshots per chapter
    if (snapshotType === 'auto') {
      const autoSnapshots = await prisma.chapterSnapshot.findMany({
        where: { chapterId, snapshotType: 'auto' },
        orderBy: { createdAt: 'desc' },
        skip: 30,
        select: { id: true },
      });

      if (autoSnapshots.length > 0) {
        await prisma.chapterSnapshot.deleteMany({
          where: { id: { in: autoSnapshots.map(s => s.id) } },
        });
      }
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}

// DELETE /api/snapshots?id=xxx - Delete a snapshot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Snapshot ID is required' },
        { status: 400 }
      );
    }

    await prisma.chapterSnapshot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to delete snapshot' },
      { status: 500 }
    );
  }
}
