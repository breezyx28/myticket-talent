import type { SaudiRegionRef } from '@/api/types/reference';
import { normalizeAppLanguage } from '@/lib/language-core';

type LocalizedName = Pick<SaudiRegionRef, 'name' | 'name_en' | 'name_ar'>;

function englishLabel(entity: LocalizedName): string {
  return entity.name_en?.trim() || entity.name?.trim() || '';
}

export function getSaudiRegionLabel(region: LocalizedName, lng?: string | null): string {
  const language = normalizeAppLanguage(lng);
  if (language === 'ar' && region.name_ar?.trim()) return region.name_ar.trim();
  return englishLabel(region);
}

export function getSaudiCityLabel(city: LocalizedName, lng?: string | null): string {
  const language = normalizeAppLanguage(lng);
  if (language === 'ar' && city.name_ar?.trim()) return city.name_ar.trim();
  return englishLabel(city);
}

export function getIntlLocale(lng?: string | null): string {
  return normalizeAppLanguage(lng) === 'ar' ? 'ar-SA' : 'en-US';
}
