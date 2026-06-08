import { describe, expect, it } from 'vitest';
import { getSafeRedirectPath } from '@/lib/navigation';

describe('getSafeRedirectPath', () => {
  it('accepts same-app relative paths', () => {
    expect(getSafeRedirectPath('/application')).toBe('/application');
    expect(getSafeRedirectPath('/engagements?focus=12')).toBe('/engagements?focus=12');
  });

  it('trims whitespace', () => {
    expect(getSafeRedirectPath('  /profile  ')).toBe('/profile');
  });

  it('rejects open redirects', () => {
    expect(getSafeRedirectPath('//evil.com')).toBeNull();
    expect(getSafeRedirectPath('https://evil.com')).toBeNull();
    expect(getSafeRedirectPath('')).toBeNull();
    expect(getSafeRedirectPath(null)).toBeNull();
  });
});
