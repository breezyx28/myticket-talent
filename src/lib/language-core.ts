import type { AppLanguage } from '@/i18n';

export function normalizeAppLanguage(lng: string | undefined | null): AppLanguage {
  if (!lng) return 'en';
  const base = lng.split('-')[0]?.toLowerCase();
  if (base === 'ar') return 'ar';
  return 'en';
}

export function isRtlLanguage(lng?: string | null): boolean {
  return normalizeAppLanguage(lng) === 'ar';
}

export function getAcceptLanguageHeader(lng?: string | null): AppLanguage {
  return normalizeAppLanguage(lng);
}

export function applyDocumentDirection(lng: string) {
  const normalized = normalizeAppLanguage(lng);
  document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = normalized;
}
