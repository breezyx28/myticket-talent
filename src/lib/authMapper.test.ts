import type { AuthSuccessResponse, RegisterResponse } from '@/api/types/auth';
import type { UserMe } from '@/api/types/user';
import { describe, expect, it } from 'vitest';
import { normalizeUserMe, parseAuthResponse, pickUserRole, isTalentDashboardRole } from '@/lib/authMapper';
import { TwoFactorRequiredError } from '@/lib/authErrors';

describe('pickUserRole', () => {
  it('prefers explicit single role when valid', () => {
    expect(pickUserRole(['guest'], 'talent', 'guest')).toBe('talent');
  });

  it('falls back to roles array', () => {
    expect(pickUserRole(['vendor', 'organizer'], null, 'guest')).toBe('vendor');
  });

  it('returns fallback for unknown roles', () => {
    expect(pickUserRole(['unknown'], null, 'guest')).toBe('guest');
  });
});

describe('isTalentDashboardRole', () => {
  it('allows only talent', () => {
    expect(isTalentDashboardRole('talent')).toBe(true);
    expect(isTalentDashboardRole('guest')).toBe(false);
    expect(isTalentDashboardRole('vendor')).toBe(false);
    expect(isTalentDashboardRole('organizer')).toBe(false);
    expect(isTalentDashboardRole(null)).toBe(false);
  });
});

describe('parseAuthResponse', () => {
  it('parses successful auth payload', () => {
    const payload: AuthSuccessResponse = {
      token: 'abc',
      refresh_token: 'refresh',
      expires_at: '2026-01-01T00:00:00Z',
      user: {
        id: 1,
        email: 'a@b.com',
        full_name: 'Test User',
        role: 'guest',
        roles: ['guest'],
      },
    };
    const result = parseAuthResponse(payload);

    expect('token' in result && result.token).toBe('abc');
    expect('twoFactor' in result).toBe(false);
  });

  it('detects two-factor challenge', () => {
    const result = parseAuthResponse({
      two_factor_required: true,
      challenge_token: 'challenge-1',
    });

    expect('twoFactor' in result).toBe(true);
    if ('twoFactor' in result) {
      expect(result.twoFactor).toBeInstanceOf(TwoFactorRequiredError);
      expect(result.twoFactor.challengeToken).toBe('challenge-1');
    }
  });

  it('parses register response with talent role', () => {
    const payload: RegisterResponse = {
      message: 'Registered',
      user_id: 42,
      role: 'talent',
      token: 'reg-token',
      refresh_token: 'reg-refresh',
      expires_at: '2026-06-18T00:00:00Z',
      user: {
        id: 42,
        email: 'talent@example.com',
        full_name: 'New Talent',
        role: 'talent',
        roles: ['talent'],
      },
    };
    const result = parseAuthResponse(payload);
    expect('token' in result && result.token).toBe('reg-token');
    expect('user' in result && result.user?.role).toBe('talent');
  });
});

describe('normalizeUserMe', () => {
  it('normalizes role from roles array', () => {
    const me: UserMe = {
      id: 1,
      email: 'talent@example.com',
      full_name: 'Stage Name',
      role: null,
      roles: ['talent'],
    };
    const user = normalizeUserMe(me);

    expect(user.role).toBe('talent');
  });
});
