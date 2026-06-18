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
