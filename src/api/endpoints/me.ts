import { baseApi } from '@/api/baseApi';
import { unwrapData } from '@/api/types/common';
import type { ResourceEnvelope } from '@/api/types/common';
import type {
  ProfileImageUploadResult,
  TalentAvailabilityResponse,
  TalentProfileMe,
  UpdateTalentAvailabilityRequest,
  UpdateTalentProfileRequest,
  UpdateUserPreferencesRequest,
  UserMe,
  UserPreferences,
  UserPreferencesResponse,
} from '@/api/types/user';
import { uploadProfileImage as postProfileImage } from '@/lib/upload';
import i18n from '@/i18n';

function unwrapUserMeResponse(response: unknown): UserMe {
  if (response && typeof response === 'object' && 'data' in response) {
    const wrapped = response as ResourceEnvelope<UserMe>;
    if (wrapped.data != null) return wrapped.data;
  }
  return response as UserMe;
}

export const meApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<UserMe, void>({
      query: () => ({ url: '/me' }),
      transformResponse: (response: unknown) => unwrapUserMeResponse(response),
      providesTags: ['Me'],
    }),
    getPreferences: build.query<UserPreferences, void>({
      query: () => ({ url: '/me/preferences' }),
      transformResponse: (raw: UserPreferences | UserPreferencesResponse) =>
        'data' in (raw as UserPreferencesResponse)
          ? (raw as UserPreferencesResponse).data
          : (raw as UserPreferences),
      providesTags: ['Preferences'],
    }),
    updatePreferences: build.mutation<UserPreferences, UpdateUserPreferencesRequest>({
      query: (body) => ({ url: '/me/preferences', method: 'PATCH', body }),
      transformResponse: (raw: UserPreferences | UserPreferencesResponse) =>
        'data' in (raw as UserPreferencesResponse)
          ? (raw as UserPreferencesResponse).data
          : (raw as UserPreferences),
      invalidatesTags: ['Preferences', 'Me'],
    }),
    getTalentAvailability: build.query<TalentAvailabilityResponse, void>({
      query: () => ({ url: '/me/talent-availability' }),
      providesTags: ['TalentAvailability'],
    }),
    setTalentAvailability: build.mutation<TalentAvailabilityResponse, UpdateTalentAvailabilityRequest>({
      query: (body) => ({ url: '/me/talent-availability', method: 'PUT', body }),
      invalidatesTags: ['TalentAvailability'],
    }),
    getTalentProfile: build.query<TalentProfileMe, void>({
      query: () => ({ url: '/me/talent-profile' }),
      transformResponse: (response: unknown) => unwrapData(response as TalentProfileMe | { data: TalentProfileMe })!,
      providesTags: ['TalentProfile'],
    }),
    updateTalentProfile: build.mutation<TalentProfileMe, UpdateTalentProfileRequest>({
      query: (body) => ({ url: '/me/talent-profile', method: 'PATCH', body }),
      transformResponse: (response: unknown) => unwrapData(response as TalentProfileMe | { data: TalentProfileMe })!,
      invalidatesTags: ['TalentProfile', 'Me'],
    }),
    uploadMeProfileImage: build.mutation<ProfileImageUploadResult, File>({
      queryFn: async (file) => {
        try {
          const data = await postProfileImage(file);
          return { data };
        } catch (err) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err instanceof Error ? err.message : i18n.t('errors.uploadFailed'),
            },
          };
        }
      },
      invalidatesTags: ['Me', 'TalentProfile', 'RoleApplication'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useGetTalentAvailabilityQuery,
  useSetTalentAvailabilityMutation,
  useGetTalentProfileQuery,
  useUpdateTalentProfileMutation,
  useUploadMeProfileImageMutation,
} = meApi;
