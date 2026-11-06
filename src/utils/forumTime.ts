/** Relative labels at static build time (updates each `npm run build`). */
export function formatForumRelativeFromDate(then: Date, now: Date = new Date()): string {
  const diffSec = Math.round((now.getTime() - then.getTime()) / 1000);
  if (diffSec < 60) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(diffSec) >= seconds || unit === 'minute') {
      const value = -Math.round(diffSec / seconds);
      return rtf.format(value, unit);
    }
  }
  return rtf.format(0, 'second');
}

export function formatForumRelative(isoDate: string, now: Date = new Date()): string {
  return formatForumRelativeFromDate(new Date(`${isoDate}T12:00:00`), now);
}

/** Stagger reply timestamps between thread publish and build “now”. */
export function formatForumCommentRelative(
  isoDate: string,
  index: number,
  total: number,
  now: Date = new Date(),
): string {
  const start = new Date(`${isoDate}T10:00:00`).getTime();
  const end = Math.max(start + 60 * 60 * 1000, now.getTime() - 45 * 60 * 1000);
  const slot = total <= 0 ? end : start + ((end - start) * (index + 1)) / (total + 1);
  return formatForumRelativeFromDate(new Date(slot), now);
}
