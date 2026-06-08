import type {
  AuthSuccessResponse,
  LoginResponse,
  TwoFactorChallengeResponse,
} from '@/api/types/auth';
import type { UserMe } from '@/api/types/user';
import type { UserRole } from '@/types/domain';
import { TwoFactorRequiredError } from '@/lib/authErrors';

const VALID_ROLES: readonly UserRole[] = ['guest', 'talent', 'vendor', 'organizer'];

export function pickUserRole(
  roles: string[] | undefined,
  singleRole: string | undefined | null,
  fallback: UserRole = 'guest',
): UserRole {
  if (typeof singleRole === 'string') {
    const r = singleRole.trim().toLowerCase();
    if (VALID_ROLES.includes(r as UserRole)) return r as UserRole;
  }
  if (Array.isArray(roles) && roles.length > 0) {
    const match = roles.find((role): role is UserRole => VALID_ROLES.includes(role as UserRole));
    if (match) return match;
  }
  return fallback;
}

function isTwoFactorChallenge(
  data: Record<string, unknown>,
): data is TwoFactorChallengeResponse {
  return (
    'two_factor_required' in data &&
    data.two_factor_required === true &&
    typeof data.challenge_token === 'string' &&
    data.challenge_token.length > 0
  );
}

function isAuthSuccess(data: Record<string, unknown>): data is AuthSuccessResponse {
  return typeof data.token === 'string' && data.token.length > 0;
}

export function parseAuthResponse(
  response: LoginResponse | AuthSuccessResponse | undefined | null,
):
  | { token: string; refresh_token: string | null; user: UserMe | null; expires_at: string | null }
  | { twoFactor: TwoFactorRequiredError } {
  const data = (response ?? {}) as Record<string, unknown>;

  if (isTwoFactorChallenge(data)) {
    return { twoFactor: new TwoFactorRequiredError(data.challenge_token) };
  }

  if (isAuthSuccess(data)) {
    const expiresRaw = data.expires_at;
    const expires_at =
      typeof expiresRaw === 'string' && expiresRaw.length > 0 ? expiresRaw : null;
    return {
      token: data.token,
      refresh_token:
        typeof data.refresh_token === 'string' && data.refresh_token.length > 0
          ? data.refresh_token
          : null,
      user: (data.user as UserMe | undefined) ?? null,
      expires_at,
    };
  }

  return {
    twoFactor: new TwoFactorRequiredError(
      '__pending__',
      'Sign-in is incomplete; verification required.',
    ),
  };
}

export function normalizeUserMe(me: UserMe): UserMe {
  return {
    ...me,
    role: pickUserRole(me.roles, me.role ?? null, 'guest'),
  };
}
