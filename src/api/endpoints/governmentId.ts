import { baseApi } from '@/api/baseApi';
import { unwrapData } from '@/api/types/common';
import type {
  GovernmentIdVerification,
  GovernmentIdVerificationStatus,
  SubmitGovernmentIdVerificationRequest,
} from '@/api/types/governmentId';

const GOV_ID_STATUSES: GovernmentIdVerificationStatus[] = ['pending', 'verified', 'rejected'];

function normalizeGovernmentIdVerification(raw: unknown): GovernmentIdVerification | null {
  const data = unwrapData(raw as GovernmentIdVerification | { data: GovernmentIdVerification } | null);
  if (!data || typeof data !== 'object') return null;
  const status = (data as GovernmentIdVerification).status;
  if (!GOV_ID_STATUSES.includes(status)) return null;
  if (typeof (data as GovernmentIdVerification).front_image_url !== 'string') return null;
  return data as GovernmentIdVerification;
}

export const governmentIdApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGovernmentIdVerification: build.query<GovernmentIdVerification | null, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({ url: '/me/government-id-verification' });
        if (result.error) {
          const status = result.error.status;
          if (status === 404 || (status === 'PARSING_ERROR' && result.error.originalStatus === 404)) {
            return { data: null };
          }
          return { error: result.error };
        }
        return { data: normalizeGovernmentIdVerification(result.data) };
      },
      providesTags: ['GovernmentIdVerification'],
    }),
    submitGovernmentIdVerification: build.mutation<
      GovernmentIdVerification,
      SubmitGovernmentIdVerificationRequest
    >({
      query: (body) => ({
        url: '/me/government-id-verification',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: GovernmentIdVerification | { data: GovernmentIdVerification }) =>
        unwrapData(raw) ?? (raw as GovernmentIdVerification),
      invalidatesTags: ['GovernmentIdVerification', 'RoleApplication', 'Me'],
    }),
  }),
});

export const {
  useGetGovernmentIdVerificationQuery,
  useSubmitGovernmentIdVerificationMutation,
} = governmentIdApi;
