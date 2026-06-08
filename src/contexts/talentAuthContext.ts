import type { RoleApplicationSummary } from '@/api/types/roleApplication';
import type { UserMe } from '@/api/types/user';
import { createContext } from 'react';

export type SignInResult =
  | { ok: true; redirectTo: string }
  | {
      ok: false;
      reason: 'invalid' | 'two_factor_required' | 'access_denied';
      challengeToken?: string;
      message?: string;
    };

export interface AuthContextValue {
  user: UserMe | null;
  talentApplication: RoleApplicationSummary | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signInWithOtp: (params: {
    email?: string;
    phone?: string;
    password: string;
    otp: string;
  }) => Promise<SignInResult>;
  signInWithOAuth: (provider?: 'google') => Promise<void>;
  completeOAuthCallback: (
    provider: string,
    code: string,
    state: string | null,
  ) => Promise<string>;
  signOut: () => Promise<void>;
}

export const TalentAuthContext = createContext<AuthContextValue | null>(null);
