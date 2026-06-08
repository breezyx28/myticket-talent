import { baseApi } from '@/api/baseApi';
import type { AcknowledgementResponse } from '@/api/types/auth';
import type { Id } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type {
  CreateTalentApplicationRequest,
  MyRoleApplications,
  RoleApplicationDetail,
  RoleApplicationDetailEnvelope,
  RoleApplicationKind,
  RoleApplicationSummary,
  TalentApplicationMediaUpload,
  UpdateTalentApplicationRequest,
} from '@/api/types/roleApplication';

const TALENT = 'role-applications/talent';

function normalizeMyRoleApplications(raw: unknown): MyRoleApplications {
  if (raw && typeof raw === 'object' && 'talent' in (raw as object)) {
    return raw as MyRoleApplications;
  }

  const list = unwrapData(
    raw as RoleApplicationSummary[] | { data: RoleApplicationSummary[] } | null,
  );
  if (!Array.isArray(list)) return { talent: null };

  const talent = list.find(
    (item) =>
      item.application_type === 'talent' ||
      item.kind === 'talent' ||
      (item as { application_type?: string }).application_type === 'talent',
  );

  return { talent: talent ?? null };
}

export const roleApplicationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyRoleApplications: build.query<MyRoleApplications, void>({
      query: () => ({ url: '/role-applications/me' }),
      transformResponse: (raw: unknown) => normalizeMyRoleApplications(raw),
      providesTags: ['RoleApplication'],
    }),
    getRoleApplication: build.query<
      RoleApplicationDetail,
      { role: RoleApplicationKind; id: Id }
    >({
      query: ({ role, id }) => ({ url: `/role-applications/${role}/${id}` }),
      transformResponse: (raw: RoleApplicationDetail | RoleApplicationDetailEnvelope) =>
        unwrapData(raw) ?? (raw as RoleApplicationDetail),
      providesTags: (_res, _err, arg) => [
        { type: 'RoleApplication', id: `${arg.role}:${arg.id}` },
        'RoleApplication',
      ],
    }),
    createTalentApplication: build.mutation<
      RoleApplicationSummary,
      CreateTalentApplicationRequest
    >({
      query: (body) => ({ url: `/${TALENT}`, method: 'POST', body }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication'],
    }),
    updateTalentApplication: build.mutation<
      RoleApplicationSummary,
      { id: Id; body: UpdateTalentApplicationRequest }
    >({
      query: ({ id, body }) => ({ url: `/${TALENT}/${id}`, method: 'PATCH', body }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication'],
    }),
    submitTalentApplication: build.mutation<RoleApplicationSummary, { id: Id }>({
      query: ({ id }) => ({ url: `/${TALENT}/${id}/submit`, method: 'POST' }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication', 'Me'],
    }),
    resubmitTalentApplication: build.mutation<RoleApplicationSummary, { id: Id }>({
      query: ({ id }) => ({ url: `/${TALENT}/${id}/resubmit`, method: 'POST' }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication'],
    }),
    withdrawTalentApplication: build.mutation<AcknowledgementResponse, { id: Id }>({
      query: ({ id }) => ({ url: `/${TALENT}/${id}/withdraw`, method: 'POST' }),
      invalidatesTags: ['RoleApplication'],
    }),
    addTalentMedia: build.mutation<
      AcknowledgementResponse,
      { id: Id; body: TalentApplicationMediaUpload }
    >({
      query: ({ id, body }) => ({ url: `/${TALENT}/${id}/media`, method: 'POST', body }),
      invalidatesTags: ['RoleApplication'],
    }),
    deleteTalentMedia: build.mutation<AcknowledgementResponse, { id: Id; mediaId: Id }>({
      query: ({ id, mediaId }) => ({
        url: `/${TALENT}/${id}/media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoleApplication'],
    }),
  }),
});

export const {
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useLazyGetRoleApplicationQuery,
  useCreateTalentApplicationMutation,
  useUpdateTalentApplicationMutation,
  useSubmitTalentApplicationMutation,
  useResubmitTalentApplicationMutation,
  useWithdrawTalentApplicationMutation,
  useAddTalentMediaMutation,
  useDeleteTalentMediaMutation,
} = roleApplicationsApi;
