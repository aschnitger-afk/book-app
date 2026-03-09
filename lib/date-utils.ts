/**
 * Format a date to relative time (e.g., "5 minutes ago", "2 hours ago")
 * German localization
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return 'Gerade eben';
  }

  if (diffInMins < 60) {
    return `Vor ${diffInMins} Minute${diffInMins > 1 ? 'n' : ''}`;
  }

  if (diffInHours < 24) {
    return `Vor ${diffInHours} Stunde${diffInHours > 1 ? 'n' : ''}`;
  }

  if (diffInDays < 7) {
    return `Vor ${diffInDays} Tag${diffInDays > 1 ? 'en' : ''}`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Vor ${weeks} Woche${weeks > 1 ? 'n' : ''}`;
  }

  // Fallback to date string
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return date.toLocaleDateString('de-DE', defaultOptions);
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
