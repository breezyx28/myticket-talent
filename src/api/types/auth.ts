import type { Id, Iso8601 } from '@/api/types/common';
import type { UserMe } from '@/api/types/user';

export type OAuthProvider = 'google' | string;

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
  otp?: string;
}

export interface AuthSuccessResponse {
  token: string;
  refresh_token: string | null;
  expires_at?: Iso8601 | null;
  user: UserMe;
  [key: string]: unknown;
}

export interface TwoFactorChallengeResponse {
  challenge_token: string;
  two_factor_required: true;
  [key: string]: unknown;
}

export type LoginResponse = AuthSuccessResponse | TwoFactorChallengeResponse;

export interface OAuthStartResponse {
  redirect_url: string;
  state: string;
  [key: string]: unknown;
}

export interface OAuthCallbackRequest {
  code?: string;
  state?: string;
  [key: string]: unknown;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AcknowledgementResponse {
  ok?: boolean;
  message?: string;
  id?: Id;
  [key: string]: unknown;
}
