import { baseApi } from '@/api/baseApi';
import type { Id, Paginated, PaginationQuery } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type {
  DeclineEngagementRequest,
  Engagement,
  EngagementMessage,
  PostEngagementMessageRequest,
} from '@/api/types/engagement';

export const engagementsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listEngagements: build.query<Paginated<Engagement>, PaginationQuery | void>({
      query: (params) => ({ url: '/me/engagements', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((e) => ({ type: 'Engagement' as const, id: e.id })),
              { type: 'Engagement' as const, id: 'LIST' },
            ]
          : [{ type: 'Engagement' as const, id: 'LIST' }],
    }),
    acceptEngagement: build.mutation<Engagement, { id: Id }>({
      query: ({ id }) => ({ url: `/me/engagements/${id}/accept`, method: 'POST' }),
      transformResponse: (raw: Engagement | { data: Engagement }) =>
        unwrapData(raw) ?? (raw as Engagement),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Engagement', id: arg.id },
        { type: 'Engagement', id: 'LIST' },
        'TalentAvailability',
      ],
    }),
    declineEngagement: build.mutation<Engagement, { id: Id; body?: DeclineEngagementRequest }>({
      query: ({ id, body }) => ({
        url: `/me/engagements/${id}/decline`,
        method: 'POST',
        body: body ?? undefined,
      }),
      transformResponse: (raw: Engagement | { data: Engagement }) =>
        unwrapData(raw) ?? (raw as Engagement),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Engagement', id: arg.id },
        { type: 'Engagement', id: 'LIST' },
      ],
    }),
    postEngagementMessage: build.mutation<
      EngagementMessage,
      { id: Id; body: PostEngagementMessageRequest }
    >({
      query: ({ id, body }) => ({
        url: `/me/engagements/${id}/messages`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: EngagementMessage | { data: EngagementMessage }) =>
        unwrapData(raw) ?? (raw as EngagementMessage),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Engagement', id: arg.id }],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const listArgs = { page: 1, per_page: 50 } as const;
        const patch = dispatch(
          engagementsApi.util.updateQueryData('listEngagements', listArgs, (draft) => {
            const engagement = draft.data?.find((item) => String(item.id) === String(id));
            if (!engagement) return;
            const optimistic: EngagementMessage = {
              id: `temp-${Date.now()}`,
              engagement_id: id,
              sender: 'talent',
              body: body.body,
              attachment_url: body.attachment_url ?? null,
              created_at: new Date().toISOString(),
            };
            engagement.messages = [...(engagement.messages ?? []), optimistic];
            engagement.last_message_at = optimistic.created_at;
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            engagementsApi.util.updateQueryData('listEngagements', listArgs, (draft) => {
              const engagement = draft.data?.find((item) => String(item.id) === String(id));
              if (!engagement) return;
              const messages = [...(engagement.messages ?? [])];
              const tempIndex = messages.findIndex((msg) => String(msg.id).startsWith('temp-'));
              if (tempIndex >= 0) messages[tempIndex] = data;
              else messages.push(data);
              engagement.messages = messages;
              engagement.last_message_at = data.created_at;
            }),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    completeEngagement: build.mutation<Engagement, { id: Id }>({
      query: ({ id }) => ({ url: `/me/engagements/${id}/complete`, method: 'POST' }),
      transformResponse: (raw: Engagement | { data: Engagement }) =>
        unwrapData(raw) ?? (raw as Engagement),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Engagement', id: arg.id },
        { type: 'Engagement', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListEngagementsQuery,
  useAcceptEngagementMutation,
  useDeclineEngagementMutation,
  usePostEngagementMessageMutation,
  useCompleteEngagementMutation,
} = engagementsApi;
