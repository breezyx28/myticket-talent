import type { SaudiCityRef, SaudiRegionRef } from '@/api/types/reference';
import { normalizeAppLanguage } from '@/lib/language-core';

export function getSaudiRegionLabel(
  region: Pick<SaudiRegionRef, 'name' | 'name_ar'>,
  lng?: string | null,
): string {
  const language = normalizeAppLanguage(lng);
  if (language === 'ar' && region.name_ar?.trim()) return region.name_ar.trim();
  return region.name;
}

export function getSaudiCityLabel(
  city: Pick<SaudiCityRef, 'name' | 'name_ar'>,
  lng?: string | null,
): string {
  const language = normalizeAppLanguage(lng);
  if (language === 'ar' && city.name_ar?.trim()) return city.name_ar.trim();
  return city.name;
}

export function getIntlLocale(lng?: string | null): string {
  return normalizeAppLanguage(lng) === 'ar' ? 'ar-SA' : 'en-US';
}
