import { NextRequest, NextResponse } from 'next/server';
import { createAutoSnapshot, createManualSnapshot } from '@/lib/backup-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/auto-backup - Trigger auto-backup for a chapter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, type = 'auto', label } = body;

    if (!chapterId) {
      return NextResponse.json(
        { error: 'chapterId is required' },
        { status: 400 }
      );
    }

    // Get chapter
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    let result: boolean | string | null;

    if (type === 'manual') {
      // Create manual snapshot
      result = await createManualSnapshot(chapter, label);
      return NextResponse.json({
        success: !!result,
        snapshotId: result,
        type: 'manual',
      });
    } else {
      // Create auto snapshot (if enough time passed)
      result = await createAutoSnapshot(chapter);
      return NextResponse.json({
        success: result,
        type: 'auto',
        message: result ? 'Auto-snapshot created' : 'Skipped (too soon or no changes)',
      });
    }
  } catch (error) {
    console.error('Failed to create backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// GET /api/auto-backup/stats?chapterId=xxx - Get snapshot stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
      return NextResponse.json(
        { error: 'chapterId is required' },
        { status: 400 }
      );
    }

    const { getSnapshotStats } = await import('@/lib/backup-service');
    const stats = await getSnapshotStats(chapterId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get backup stats:', error);
    return NextResponse.json(
      { error: 'Failed to get backup stats' },
      { status: 500 }
    );
  }
}
