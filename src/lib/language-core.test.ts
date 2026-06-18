import { describe, expect, it } from 'vitest';
import {
  getAcceptLanguageHeader,
  isRtlLanguage,
  normalizeAppLanguage,
} from './language-core';

describe('language-core', () => {
  it('normalizes locale tags to en or ar', () => {
    expect(normalizeAppLanguage('en-US')).toBe('en');
    expect(normalizeAppLanguage('ar-SA')).toBe('ar');
    expect(normalizeAppLanguage('fr')).toBe('en');
    expect(normalizeAppLanguage(undefined)).toBe('en');
  });

  it('detects RTL for Arabic', () => {
    expect(isRtlLanguage('ar')).toBe(true);
    expect(isRtlLanguage('ar-EG')).toBe(true);
    expect(isRtlLanguage('en')).toBe(false);
  });

  it('returns Accept-Language header value', () => {
    expect(getAcceptLanguageHeader('ar-SA')).toBe('ar');
    expect(getAcceptLanguageHeader('en')).toBe('en');
  });
});
