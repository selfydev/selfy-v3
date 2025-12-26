import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a date consistently to avoid hydration mismatches
 * Uses ISO format which is locale-independent
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy'); // e.g., "27 Dec 2025"
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm'); // e.g., "27 Dec 2025, 14:30"
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm'); // e.g., "14:30"
}

export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE, MMMM d, yyyy'); // e.g., "Friday, December 27, 2025"
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy'); // e.g., "Dec 27, 2025"
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true }); // e.g., "2 hours ago"
}

