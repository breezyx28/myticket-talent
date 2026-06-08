import { baseApi } from '@/api/baseApi';
import type {
  AcknowledgementResponse,
  AuthSuccessResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  OAuthCallbackRequest,
  OAuthProvider,
  OAuthStartResponse,
  ResetPasswordRequest,
} from '@/api/types/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),
    oauthStart: build.mutation<OAuthStartResponse, { provider: OAuthProvider }>({
      query: ({ provider }) => ({
        url: `/auth/oauth/${encodeURIComponent(provider)}/start`,
        method: 'POST',
      }),
    }),
    oauthCallback: build.mutation<
      AuthSuccessResponse,
      { provider: OAuthProvider; body: OAuthCallbackRequest }
    >({
      query: ({ provider, body }) => ({
        url: `/auth/oauth/${encodeURIComponent(provider)}/callback`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    forgotPassword: build.mutation<AcknowledgementResponse, ForgotPasswordRequest>({
      query: (body) => ({ url: '/auth/password/forgot', method: 'POST', body }),
    }),
    resetPassword: build.mutation<AcknowledgementResponse, ResetPasswordRequest>({
      query: (body) => ({ url: '/auth/password/reset', method: 'POST', body }),
    }),
    logout: build.mutation<AcknowledgementResponse, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Me', 'Session'],
    }),
  }),
});

export const {
  useLoginMutation,
  useOauthStartMutation,
  useOauthCallbackMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
