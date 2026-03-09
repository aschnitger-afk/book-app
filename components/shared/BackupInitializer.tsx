'use client';

import { useEffect } from 'react';

/**
 * Client component that initializes the backup service
 * This runs only in the browser and only triggers daily backup checks
 */
export function BackupInitializer() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check for daily backup every hour
    const checkDailyBackup = async () => {
      try {
        // Call the API to check and create daily backup if needed
        await fetch('/api/auto-backup/check-daily', { method: 'POST' });
      } catch (error) {
        // Silent fail - backup is not critical for app function
        console.log('Daily backup check skipped');
      }
    };

    // Check immediately and then every hour
    checkDailyBackup();
    const interval = setInterval(checkDailyBackup, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}
