import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { clearTokens, getToken } from '@/api/authToken';
import { ENV } from '@/config/env';

function joinUrl(base: string, prefix: string): string {
  const left = base.endsWith('/') ? base.slice(0, -1) : base;
  const right = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return `${left}${right}`;
}

export const API_BASE_URL = joinUrl(ENV.apiBase, ENV.apiPrefix);

export const apiTagTypes = [
  'Me',
  'Session',
  'RoleApplication',
  'TalentProfile',
  'TalentAvailability',
  'Engagement',
  'Rating',
  'SaudiRegion',
  'Preferences',
  'GovernmentIdVerification',
  'TalentCategory',
  'Conversation',
] as const;

export type ApiTagType = (typeof apiTagTypes)[number];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
});

let redirectingToLogin = false;

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/oauth');
}

export const baseQueryWithSessionGuard: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    if (!isAuthEndpoint(url) && getToken()) {
      clearTokens();
      api.dispatch(baseApi.util.resetApiState());
      const onLogin = window.location.pathname.startsWith('/login');
      if (!redirectingToLogin && !onLogin) {
        redirectingToLogin = true;
        window.location.assign('/login');
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithSessionGuard,
  tagTypes: apiTagTypes,
  endpoints: () => ({}),
});
