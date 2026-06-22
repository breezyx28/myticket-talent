import { describe, expect, it } from 'vitest';
import { getSaudiCityLabel, getSaudiRegionLabel } from './referenceLabels';

describe('referenceLabels', () => {
  const region = { name_en: 'Riyadh Region', name_ar: 'منطقة الرياض' };
  const city = { name_en: 'Riyadh', name_ar: 'الرياض' };

  it('prefers Arabic labels when language is ar', () => {
    expect(getSaudiRegionLabel(region, 'ar')).toBe('منطقة الرياض');
    expect(getSaudiCityLabel(city, 'ar')).toBe('الرياض');
  });

  it('uses name_en for English', () => {
    expect(getSaudiRegionLabel(region, 'en')).toBe('Riyadh Region');
    expect(getSaudiCityLabel(city, 'en')).toBe('Riyadh');
  });

  it('falls back to legacy name when name_en is missing', () => {
    expect(getSaudiRegionLabel({ name: 'Tabuk', name_ar: 'تبوك' }, 'en')).toBe('Tabuk');
    expect(getSaudiCityLabel({ name: 'Tabuk City', name_ar: 'تبوك' }, 'en')).toBe('Tabuk City');
  });

  it('falls back to English when Arabic name is missing', () => {
    expect(getSaudiRegionLabel({ name_en: 'Tabuk', name_ar: '' }, 'ar')).toBe('Tabuk');
  });
});
