import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import i18n from '@/i18n';

export class TwoFactorRequiredError extends Error {
  readonly challengeToken: string;

  constructor(challengeToken: string, message?: string) {
    super(message ?? i18n.t('auth.twoFactorRequired'));
    this.name = 'TwoFactorRequiredError';
    this.challengeToken = challengeToken;
  }
}

export function isTwoFactorRequiredError(value: unknown): value is TwoFactorRequiredError {
  return value instanceof TwoFactorRequiredError;
}

export class AuthApiError extends Error {
  readonly status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR' | 'unknown';
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    status: AuthApiError['status'] = 'unknown',
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface FetchErrorWithData {
  status: number;
  data?: { message?: unknown; errors?: Record<string, string[]> } | string | undefined;
}

function isFetchBaseQueryError(value: unknown): value is FetchBaseQueryError {
  return Boolean(value) && typeof value === 'object' && 'status' in (value as Record<string, unknown>);
}

function isSerializedError(value: unknown): value is SerializedError {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'message' in (value as Record<string, unknown>) &&
    !('status' in (value as Record<string, unknown>))
  );
}

export function toAuthApiError(value: unknown, fallback?: string): AuthApiError {
  const defaultFallback = fallback ?? i18n.t('errors.generic');
  if (value instanceof AuthApiError) return value;

  if (isFetchBaseQueryError(value)) {
    const err = value as FetchErrorWithData;
    if (typeof err.status === 'number') {
      const data = typeof err.data === 'object' && err.data ? err.data : undefined;
      const rawMessage: unknown = data?.message;
      let normalizedMessage: string | undefined;
      if (typeof rawMessage === 'string') normalizedMessage = rawMessage;
      else if (Array.isArray(rawMessage)) {
        normalizedMessage = rawMessage
          .filter((m: unknown): m is string => typeof m === 'string')
          .join(' ');
      } else if (rawMessage != null) normalizedMessage = String(rawMessage);
      const message =
        normalizedMessage ??
        (err.status === 401
          ? i18n.t('errors.invalidCredentials')
          : err.status === 422
            ? i18n.t('errors.validation')
            : err.status === 429
              ? i18n.t('errors.tooManyAttempts')
              : defaultFallback);
      return new AuthApiError(message, err.status, data?.errors ?? {});
    }
    if (err.status === 'FETCH_ERROR') {
      return new AuthApiError(i18n.t('errors.network'), err.status);
    }
    if (err.status === 'PARSING_ERROR') {
      return new AuthApiError(i18n.t('errors.unexpectedResponse'), err.status);
    }
    if (err.status === 'TIMEOUT_ERROR') {
      return new AuthApiError(i18n.t('errors.serverTimeout'), err.status);
    }
    return new AuthApiError(defaultFallback, err.status);
  }

  if (isSerializedError(value)) {
    return new AuthApiError(value.message ?? defaultFallback);
  }

  if (value instanceof Error) return new AuthApiError(value.message || defaultFallback);
  return new AuthApiError(defaultFallback);
}

export function authErrorMessage(value: unknown, fallback?: string): string {
  return toAuthApiError(value, fallback).message;
}
