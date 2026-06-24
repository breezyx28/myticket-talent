import { baseApi } from '@/api/baseApi';
import { meApi } from '@/api/endpoints/me';
import { roleApplicationsApi } from '@/api/endpoints/roleApplications';
import {
  clearTokens,
  getSessionUserFromMeta,
  getToken,
  persistAuthCookies,
} from '@/api/authToken';
import type { LoginRequest } from '@/api/types/auth';
import {
  useGetMeQuery,
  useGetMyRoleApplicationsQuery,
  useLoginMutation,
  useLogoutMutation,
  useOauthCallbackMutation,
  useOauthStartMutation,
  useRegisterMutation,
} from '@/api/endpoints';
import { OAUTH_REDIRECT_KEY, OAUTH_STATE_KEY } from '@/lib/oauth';
import { authErrorMessage, isTwoFactorRequiredError } from '@/lib/authErrors';
import { normalizeUserMe, parseAuthResponse, pickUserRole, isTalentDashboardRole } from '@/lib/authMapper';
import { disconnectEcho } from '@/lib/realtime/echo';
import { resolvePostLoginRoute } from '@/lib/resolvePostLoginRoute';
import type { AppDispatch } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import i18n from '@/i18n';
import {
  TalentAuthContext,
  type AuthContextValue,
  type SignInResult,
} from '@/contexts/talentAuthContext';
import { useCallback, useMemo, type ReactNode } from 'react';

export type { SignInResult, AuthContextValue };

async function resolveRedirectAfterLogin(dispatch: AppDispatch) {
  const meResult = await dispatch(meApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
  const appsResult = await dispatch(
    roleApplicationsApi.endpoints.getMyRoleApplications.initiate(undefined, { forceRefetch: true }),
  );
  const profileResult = await dispatch(
    meApi.endpoints.getTalentProfile.initiate(undefined, { forceRefetch: true }),
  );

  const meData =
    meResult.data ??
    (meResult.error ? null : undefined);
  const appsData = appsResult.data;
  const hasTalentProfile = Boolean(profileResult.data) && !profileResult.error;

  const role = meData ? pickUserRole(meData.roles, meData.role ?? null, 'guest') : null;
  const talentApp = appsData?.talent ?? null;

  return resolvePostLoginRoute({
    role,
    hasTalentApplication: Boolean(talentApp),
    applicationStatus: talentApp?.status ?? null,
    hasTalentProfile,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const hasToken = Boolean(getToken());

  const { data: me, isLoading: meLoading, isFetching: meFetching } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });
  const { data: applications, isLoading: appsLoading } = useGetMyRoleApplicationsQuery(undefined, {
    skip: !hasToken,
  });

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [oauthStartMutation] = useOauthStartMutation();
  const [oauthCallbackMutation] = useOauthCallbackMutation();

  const user = useMemo(() => {
    if (me) return normalizeUserMe(me);
    if (!hasToken) return null;
    return getSessionUserFromMeta();
  }, [me, hasToken]);

  const talentApplication = applications?.talent ?? null;

  const performLogin = useCallback(
    async (body: LoginRequest): Promise<SignInResult> => {
      try {
        const response = await loginMutation(body).unwrap();
        const parsed = parseAuthResponse(response);

        if ('twoFactor' in parsed) {
          if (parsed.twoFactor.challengeToken && parsed.twoFactor.challengeToken !== '__pending__') {
            return {
              ok: false,
              reason: 'two_factor_required',
              challengeToken: parsed.twoFactor.challengeToken,
            };
          }
          return { ok: false, reason: 'invalid', message: parsed.twoFactor.message };
        }

        const role = parsed.user ? pickUserRole(parsed.user.roles, parsed.user.role ?? null, 'guest') : null;
        if (!isTalentDashboardRole(role)) {
          return { ok: false, reason: 'access_denied', message: i18n.t('auth.talentOnly') };
        }

        persistAuthCookies({
          accessToken: parsed.token,
          refreshToken: parsed.refresh_token,
          expiresAt: parsed.expires_at,
          userSnapshot: parsed.user,
        });

        const redirectTo = await resolveRedirectAfterLogin(dispatch);
        return { ok: true, redirectTo };
      } catch (err) {
        if (isTwoFactorRequiredError(err)) {
          return {
            ok: false,
            reason: 'two_factor_required',
            challengeToken: err.challengeToken,
          };
        }
        return { ok: false, reason: 'invalid', message: authErrorMessage(err) };
      }
    },
    [dispatch, loginMutation],
  );

  const signIn = useCallback(
    async (email: string, password: string) => performLogin({ email: email.trim(), password }),
    [performLogin],
  );

  const completeAuthSession = useCallback(
    async (parsed: ReturnType<typeof parseAuthResponse>) => {
      if ('twoFactor' in parsed) {
        if (parsed.twoFactor.challengeToken && parsed.twoFactor.challengeToken !== '__pending__') {
          return {
            ok: false as const,
            reason: 'two_factor_required' as const,
            challengeToken: parsed.twoFactor.challengeToken,
          };
        }
        return {
          ok: false as const,
          reason: 'invalid' as const,
          message: parsed.twoFactor.message,
        };
      }

      const role = parsed.user ? pickUserRole(parsed.user.roles, parsed.user.role ?? null, 'guest') : null;
      if (!isTalentDashboardRole(role)) {
        return { ok: false as const, reason: 'access_denied' as const, message: i18n.t('auth.talentOnly') };
      }

      persistAuthCookies({
        accessToken: parsed.token,
        refreshToken: parsed.refresh_token,
        expiresAt: parsed.expires_at,
        userSnapshot: parsed.user,
      });

      const redirectTo = await resolveRedirectAfterLogin(dispatch);
      return { ok: true as const, redirectTo };
    },
    [dispatch],
  );

  const signUp = useCallback(
    async (values: { email: string; password: string; full_name: string }): Promise<SignInResult> => {
      try {
        const response = await registerMutation({
          email: values.email.trim(),
          password: values.password,
          full_name: values.full_name.trim(),
          role: 'talent',
        }).unwrap();
        const parsed = parseAuthResponse(response);
        return completeAuthSession(parsed);
      } catch (err) {
        return { ok: false, reason: 'invalid', message: authErrorMessage(err) };
      }
    },
    [completeAuthSession, registerMutation],
  );

  const signInWithOtp = useCallback(
    async (params: { email?: string; phone?: string; password: string; otp: string }) =>
      performLogin({
        email: params.email?.trim(),
        phone: params.phone?.trim(),
        password: params.password,
        otp: params.otp.trim(),
      }),
    [performLogin],
  );

  const signInWithOAuth = useCallback(
    async (provider: 'google' = 'google') => {
      const result = await oauthStartMutation({ provider }).unwrap();
      const url = result.redirect_url;
      if (!url) throw new Error(i18n.t('auth.providerRedirectMissing'));
      if (result.state) sessionStorage.setItem(OAUTH_STATE_KEY, result.state);
      else sessionStorage.removeItem(OAUTH_STATE_KEY);
      const here = `${window.location.pathname}${window.location.search}`;
      sessionStorage.setItem(OAUTH_REDIRECT_KEY, here);
      window.location.assign(url);
    },
    [oauthStartMutation],
  );

  const completeOAuthCallback = useCallback(
    async (provider: string, code: string, state: string | null): Promise<string> => {
      const expected = sessionStorage.getItem(OAUTH_STATE_KEY);
      if (expected && state && expected !== state) {
        throw new Error(i18n.t('auth.oauthStateMismatch'));
      }
      sessionStorage.removeItem(OAUTH_STATE_KEY);

      const response = await oauthCallbackMutation({
        provider,
        body: { code, state: state ?? undefined },
      }).unwrap();
      const parsed = parseAuthResponse(response);

      if ('twoFactor' in parsed) {
        throw new Error(parsed.twoFactor.message ?? i18n.t('auth.twoFactorRequired'));
      }

      const role = parsed.user ? pickUserRole(parsed.user.roles, parsed.user.role ?? null, 'guest') : null;
      if (!isTalentDashboardRole(role)) {
        throw new Error(i18n.t('auth.talentOnly'));
      }

      persistAuthCookies({
        accessToken: parsed.token,
        refreshToken: parsed.refresh_token,
        expiresAt: parsed.expires_at,
        userSnapshot: parsed.user,
      });

      return resolveRedirectAfterLogin(dispatch);
    },
    [dispatch, oauthCallbackMutation],
  );

  const signOut = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      /* still clear client session */
    }
    disconnectEcho();
    clearTokens();
    dispatch(baseApi.util.resetApiState());
  }, [dispatch, logoutMutation]);

  const isLoading = hasToken && (meLoading || appsLoading || meFetching);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      talentApplication,
      isLoading,
      signIn,
      signUp,
      signInWithOtp,
      signInWithOAuth,
      completeOAuthCallback,
      signOut,
    }),
    [
      user,
      talentApplication,
      isLoading,
      signIn,
      signUp,
      signInWithOtp,
      signInWithOAuth,
      completeOAuthCallback,
      signOut,
    ],
  );

  return <TalentAuthContext.Provider value={value}>{children}</TalentAuthContext.Provider>;
}
