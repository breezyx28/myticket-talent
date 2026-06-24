import { getIntlLocale } from '@/lib/referenceLabels';

export function formatDateTime(iso: string, lng?: string | null): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(getIntlLocale(lng), {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(iso: string, lng?: string | null): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(getIntlLocale(lng), { dateStyle: 'medium' }).format(date);
}

export function formatRelativeTime(iso: string, lng?: string | null): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(getIntlLocale(lng), { numeric: 'auto' });
  const absSec = Math.abs(diffSec);
  if (absSec < 60) return rtf.format(diffSec, 'second');
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  const diffHour = Math.round(diffSec / 3600);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  const diffDay = Math.round(diffSec / 86400);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
  return formatDate(iso, lng);
}
