import { describe, expect, it } from 'vitest';
import { getSaudiCityLabel, getSaudiRegionLabel } from './referenceLabels';

describe('referenceLabels', () => {
  const region = { name: 'Riyadh Region', name_ar: 'منطقة الرياض' };
  const city = { name: 'Riyadh', name_ar: 'الرياض' };

  it('prefers Arabic labels when language is ar', () => {
    expect(getSaudiRegionLabel(region, 'ar')).toBe('منطقة الرياض');
    expect(getSaudiCityLabel(city, 'ar')).toBe('الرياض');
  });

  it('falls back to English labels for en', () => {
    expect(getSaudiRegionLabel(region, 'en')).toBe('Riyadh Region');
    expect(getSaudiCityLabel(city, 'en')).toBe('Riyadh');
  });

  it('falls back to English when Arabic name is missing', () => {
    expect(getSaudiRegionLabel({ name: 'Tabuk', name_ar: '' }, 'ar')).toBe('Tabuk');
  });
});
