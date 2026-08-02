/**
 * Formats an ISO date string as a short readable date, e.g. "Aug 15, 2026".
 */
export function formatDate(isoString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

/**
 * Formats an ISO date string's time portion, e.g. "7:00 PM".
 */
export function formatTime(isoString) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoString));
}
