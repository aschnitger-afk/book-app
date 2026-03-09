import { NextRequest, NextResponse } from 'next/server';
import { checkAndCreateDailyBackup } from '@/lib/backup-service';

// POST /api/auto-backup/check-daily - Check and create daily backup if needed
export async function POST(request: NextRequest) {
  try {
    const created = await checkAndCreateDailyBackup();
    
    return NextResponse.json({
      success: true,
      backupCreated: created,
      message: created ? 'Daily backup created' : 'No backup needed at this time',
    });
  } catch (error) {
    console.error('Daily backup check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check daily backup' },
      { status: 500 }
    );
  }
}
