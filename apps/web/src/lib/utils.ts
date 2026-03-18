import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format cents to currency string.
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string | null | undefined, format = 'MMM D, YYYY'): string {
  if (!date) return '--';
  return dayjs(date).format(format);
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '--';
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

/**
 * Relative time from now.
 */
export function timeFromNow(date: Date | string): string {
  return dayjs(date).fromNow();
}

/**
 * Get time remaining as a formatted string.
 */
export function formatCountdown(targetDate: Date | string): string {
  const target = dayjs(targetDate);
  const now = dayjs();
  const diff = target.diff(now, 'second');

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Get the initials from a name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Truncate a string to max length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Format furlongs to a readable distance.
 */
export function formatDistance(furlongs: number): string {
  if (furlongs % 8 === 0) {
    return `${furlongs / 8} mi`;
  }
  return `${furlongs}f`;
}

/**
 * Calculate age from foal date.
 */
export function calculateAge(foalDate: Date | string | null): number | null {
  if (!foalDate) return null;
  return dayjs().diff(dayjs(foalDate), 'year');
}

/**
 * Generate a pagination range.
 */
export function getPaginationRange(currentPage: number, totalPages: number): (number | '...')[] {
  const delta = 2;
  const range: (number | '...')[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }

  return range;
}
