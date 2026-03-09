/**
 * Client-side backup utilities
 * These can be safely imported in browser components
 */

// Configuration
export const CONFIG = {
  AUTO_SNAPSHOT_INTERVAL: 5 * 60 * 1000, // 5 minutes between auto-snapshots
  MAX_AUTO_SNAPSHOTS_PER_CHAPTER: 30,
  DAILY_BACKUP_HOUR: 3, // 3 AM
  MAX_DAILY_BACKUPS: 7, // Keep last 7 daily backups
};

/**
 * Format relative time for display
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return 'Gerade eben';
  if (diffInMins < 60) return `Vor ${diffInMins} Minute${diffInMins > 1 ? 'n' : ''}`;
  if (diffInHours < 24) return `Vor ${diffInHours} Stunde${diffInHours > 1 ? 'n' : ''}`;
  if (diffInDays < 7) return `Vor ${diffInDays} Tag${diffInDays > 1 ? 'en' : ''}`;
  
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
  });
}
