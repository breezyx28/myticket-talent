import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  isExternalNotificationHref,
  navigateToNotificationHref,
  resolveNotificationPath,
} from '@/lib/notificationNavigation';

describe('resolveNotificationPath', () => {
  const origin = 'https://talent.example.com';

  beforeEach(() => {
    vi.stubGlobal('window', {
      ...window,
      location: { ...window.location, origin },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns same-origin relative paths', () => {
    expect(resolveNotificationPath('/engagements?focus=12')).toBe('/engagements?focus=12');
    expect(resolveNotificationPath('/application/status')).toBe('/application/status');
  });

  it('maps main-site engagement links to in-app paths', () => {
    expect(resolveNotificationPath('https://myticket.kat-jr.com/engagements?focus=5')).toBe(
      '/engagements?focus=5',
    );
  });

  it('returns null for unrelated external URLs', () => {
    expect(resolveNotificationPath('https://example.com/page')).toBeNull();
  });
});

describe('isExternalNotificationHref', () => {
  it('detects external https links', () => {
    expect(isExternalNotificationHref('https://example.com/x')).toBe(true);
    expect(isExternalNotificationHref('/engagements')).toBe(false);
  });
});

describe('navigateToNotificationHref', () => {
  const origin = 'https://talent.example.com';

  beforeEach(() => {
    vi.stubGlobal('window', {
      ...window,
      location: { ...window.location, origin },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('navigates in-app for internal paths', () => {
    const navigate = vi.fn();
    navigateToNotificationHref('/notifications', navigate);
    expect(navigate).toHaveBeenCalledWith('/notifications');
  });

  it('assigns window location for external URLs', () => {
    const assign = vi.fn();
    vi.stubGlobal('window', {
      ...window,
      location: { ...window.location, origin, assign },
    });
    const navigate = vi.fn();
    navigateToNotificationHref('https://example.com/deep', navigate);
    expect(navigate).not.toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith('https://example.com/deep');
  });
});
