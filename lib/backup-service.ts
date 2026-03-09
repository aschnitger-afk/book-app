import { PrismaClient, Chapter } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  AUTO_SNAPSHOT_INTERVAL: 5 * 60 * 1000, // 5 minutes between auto-snapshots
  MAX_AUTO_SNAPSHOTS_PER_CHAPTER: 30,
  DAILY_BACKUP_HOUR: 3, // 3 AM
  MAX_DAILY_BACKUPS: 7, // Keep last 7 daily backups
  DB_BACKUP_DIR: path.join(os.homedir(), 'Documents', 'AuthorAI-Backups', 'database'),
};

// Track last snapshot time per chapter
const lastSnapshotTime = new Map<string, number>();

/**
 * Create an auto-snapshot for a chapter (if enough time has passed)
 */
export async function createAutoSnapshot(chapter: Chapter): Promise<boolean> {
  const now = Date.now();
  const lastTime = lastSnapshotTime.get(chapter.id) || 0;
  
  // Don't create snapshot if too soon
  if (now - lastTime < CONFIG.AUTO_SNAPSHOT_INTERVAL) {
    return false;
  }

  try {
    // Get previous snapshot
    const previousSnapshot = await prisma.chapterSnapshot.findFirst({
      where: { chapterId: chapter.id },
      orderBy: { createdAt: 'desc' },
    });

    // Skip if content hasn't changed
    if (previousSnapshot && previousSnapshot.content === chapter.content) {
      return false;
    }

    // Compute change summary
    let changeSummary = '';
    if (previousSnapshot) {
      const wordDiff = chapter.wordCount - previousSnapshot.wordCount;
      if (wordDiff > 0) changeSummary = `+${wordDiff} Wörter`;
      else if (wordDiff < 0) changeSummary = `${wordDiff} Wörter`;
      else changeSummary = 'Kleine Änderungen';
    } else {
      changeSummary = 'Erste Version';
    }

    // Create snapshot
    await prisma.chapterSnapshot.create({
      data: {
        chapterId: chapter.id,
        bookId: chapter.bookId,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.wordCount,
        snapshotType: 'auto',
        previousSnapshotId: previousSnapshot?.id || null,
        changeSummary,
      },
    });

    // Update tracking
    lastSnapshotTime.set(chapter.id, now);

    // Cleanup old auto-snapshots
    await cleanupOldSnapshots(chapter.id);

    return true;
  } catch (error) {
    console.error('Failed to create auto-snapshot:', error);
    return false;
  }
}

/**
 * Create a manual snapshot with a label
 */
export async function createManualSnapshot(
  chapter: Chapter,
  label?: string
): Promise<string | null> {
  try {
    const snapshot = await prisma.chapterSnapshot.create({
      data: {
        chapterId: chapter.id,
        bookId: chapter.bookId,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.wordCount,
        snapshotType: 'manual',
        label: label || `Gesichert am ${new Date().toLocaleString('de-DE')}`,
        changeSummary: 'Manuell erstellt',
      },
    });
    return snapshot.id;
  } catch (error) {
    console.error('Failed to create manual snapshot:', error);
    return null;
  }
}

/**
 * Cleanup old auto-snapshots for a chapter
 */
async function cleanupOldSnapshots(chapterId: string): Promise<void> {
  const oldSnapshots = await prisma.chapterSnapshot.findMany({
    where: { chapterId, snapshotType: 'auto' },
    orderBy: { createdAt: 'desc' },
    skip: CONFIG.MAX_AUTO_SNAPSHOTS_PER_CHAPTER,
    select: { id: true },
  });

  if (oldSnapshots.length > 0) {
    await prisma.chapterSnapshot.deleteMany({
      where: { id: { in: oldSnapshots.map(s => s.id) } },
    });
  }
}

/**
 * Create a daily database backup
 */
export async function createDailyBackup(): Promise<string | null> {
  try {
    // Ensure backup directory exists
    await fs.mkdir(CONFIG.DB_BACKUP_DIR, { recursive: true });

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const timestamp = new Date().toISOString().split('T')[0];
    const backupFilename = `dev.db.backup-${timestamp}`;
    const backupPath = path.join(CONFIG.DB_BACKUP_DIR, backupFilename);

    // Copy database file
    await fs.copyFile(dbPath, backupPath);

    // Calculate checksum
    const content = await fs.readFile(backupPath);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    const stats = await fs.stat(backupPath);

    // Save record
    await prisma.backupRecord.create({
      data: {
        filename: backupFilename,
        filePath: backupPath,
        fileSize: stats.size,
        checksum,
        backupType: 'auto_daily',
        bookCount: 0, // Will be updated
        chapterCount: 0,
        characterCount: 0,
        status: 'completed',
      },
    });

    // Cleanup old daily backups
    await cleanupOldBackups();

    return backupPath;
  } catch (error) {
    console.error('Failed to create daily backup:', error);
    return null;
  }
}

/**
 * Cleanup old daily backups
 */
async function cleanupOldBackups(): Promise<void> {
  const oldBackups = await prisma.backupRecord.findMany({
    where: { backupType: 'auto_daily' },
    orderBy: { createdAt: 'desc' },
    skip: CONFIG.MAX_DAILY_BACKUPS,
  });

  for (const backup of oldBackups) {
    try {
      await fs.unlink(backup.filePath);
    } catch (e) {
      // File might not exist
    }
    await prisma.backupRecord.delete({ where: { id: backup.id } });
  }
}

/**
 * Check if daily backup is needed and create it
 */
export async function checkAndCreateDailyBackup(): Promise<boolean> {
  const now = new Date();
  
  // Check if it's time for daily backup (3 AM)
  if (now.getHours() !== CONFIG.DAILY_BACKUP_HOUR) {
    return false;
  }

  // Check if we already created one today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingBackup = await prisma.backupRecord.findFirst({
    where: {
      backupType: 'auto_daily',
      createdAt: { gte: today },
    },
  });

  if (existingBackup) {
    return false; // Already created today
  }

  const result = await createDailyBackup();
  return result !== null;
}

/**
 * Get snapshot statistics for a chapter
 */
export async function getSnapshotStats(chapterId: string): Promise<{
  totalSnapshots: number;
  lastSnapshotAt: Date | null;
  autoSnapshots: number;
  manualSnapshots: number;
}> {
  const snapshots = await prisma.chapterSnapshot.groupBy({
    by: ['snapshotType'],
    where: { chapterId },
    _count: { id: true },
  });

  const lastSnapshot = await prisma.chapterSnapshot.findFirst({
    where: { chapterId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  const autoCount = snapshots.find(s => s.snapshotType === 'auto')?._count.id || 0;
  const manualCount = snapshots.find(s => s.snapshotType === 'manual')?._count.id || 0;

  return {
    totalSnapshots: autoCount + manualCount,
    lastSnapshotAt: lastSnapshot?.createdAt || null,
    autoSnapshots: autoCount,
    manualSnapshots: manualCount,
  };
}

/**
 * Initialize the backup service
 */
export function initBackupService(): void {
  // Check for daily backup every hour
  setInterval(() => {
    checkAndCreateDailyBackup().catch(console.error);
  }, 60 * 60 * 1000); // Every hour

  console.log('[BackupService] Initialized - Daily backups at 3 AM, auto-snapshots every 5 min');
}

// Export config for UI
export { CONFIG };
