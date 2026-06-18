import i18n, { type AppLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import {
  applyDocumentDirection,
  getAcceptLanguageHeader as getHeader,
  normalizeAppLanguage,
} from '@/lib/language-core';

export { applyDocumentDirection, isRtlLanguage, normalizeAppLanguage } from '@/lib/language-core';

export function getAppLanguage(): AppLanguage {
  return normalizeAppLanguage(i18n.language);
}

export function getAcceptLanguageHeader(): AppLanguage {
  return getHeader(i18n.language);
}

export async function applyAppLanguage(lng: AppLanguage): Promise<void> {
  if (!SUPPORTED_LANGUAGES.includes(lng)) return;
  if (normalizeAppLanguage(i18n.language) === lng) {
    applyDocumentDirection(lng);
    return;
  }
  await i18n.changeLanguage(lng);
}
