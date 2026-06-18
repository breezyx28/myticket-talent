import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

const sourceFiles = import.meta.glob(
  ['../**/*.{ts,tsx}', '!../**/*.test.ts', '!../**/*.test.tsx', '!../i18n/locales/**'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

function collectTranslationKeysFromSource(): string[] {
  const keys = new Set<string>();
  const keyPattern = /(?:\bt|i18n\.t)\(\s*['"]([^'"]+)['"]/g;

  for (const content of Object.values(sourceFiles)) {
    for (const match of content.matchAll(keyPattern)) {
      const key = match[1];
      if (!key.includes('${') && !key.includes('{{')) {
        keys.add(key);
      }
    }
  }

  return [...keys].sort();
}

describe('locale parity', () => {
  it('en and ar have the same translation keys', () => {
    const enKeys = flattenKeys(en as Record<string, unknown>).sort();
    const arKeys = flattenKeys(ar as Record<string, unknown>).sort();
    expect(enKeys).toEqual(arKeys);
  });

  it('validation keys exist in both locales', () => {
    const enValidation = (en as { validation: Record<string, string> }).validation;
    const arValidation = (ar as { validation: Record<string, string> }).validation;
    expect(Object.keys(enValidation).sort()).toEqual(Object.keys(arValidation).sort());
    expect(Object.keys(enValidation).length).toBeGreaterThan(0);
  });

  it('static t() keys used in source exist in en locale', () => {
    const enKeys = new Set(flattenKeys(en as Record<string, unknown>));
    const usedKeys = collectTranslationKeysFromSource();
    const missing = usedKeys.filter((key) => !enKeys.has(key));

    expect(
      missing,
      missing.length > 0
        ? `Missing locale keys:\n${missing.map((k) => `  - ${k}`).join('\n')}`
        : undefined,
    ).toEqual([]);
  });
});
