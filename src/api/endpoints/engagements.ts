import { baseApi } from '@/api/baseApi';
import type { Id, ListEngagementsQuery, Paginated } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type {
  DeclineEngagementRequest,
  Engagement,
  EngagementMessage,
  PostEngagementMessageRequest,
} from '@/api/types/engagement';

const DEFAULT_LIST_QUERY: ListEngagementsQuery = { page: 1, per_page: 50 };

function engagementMessagesTag(id: Id) {
  return { type: 'Engagement' as const, id: `${id}-messages` };
}

export const engagementsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listEngagements: build.query<Paginated<Engagement>, ListEngagementsQuery | void>({
      query: (params) => ({ url: '/me/engagements', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((e) => ({ type: 'Engagement' as const, id: e.id })),
              { type: 'Engagement' as const, id: 'LIST' },
            ]
          : [{ type: 'Engagement' as const, id: 'LIST' }],
    }),
    listEngagementMessages: build.query<EngagementMessage[], { id: Id }>({
      query: ({ id }) => ({ url: `/me/engagements/${id}/messages` }),
      transformResponse: (raw: EngagementMessage[] | { data: EngagementMessage[] }) => {
        const data = unwrapData(raw);
        if (Array.isArray(data)) return data;
        if (Array.isArray(raw)) return raw;
        return [];
      },
      providesTags: (_res, _err, arg) => [engagementMessagesTag(arg.id)],
    }),
    acceptEngagement: build.mutation<Engagement, { id: Id; listQuery?: ListEngagementsQuery }>({
      query: ({ id }) => ({ url: `/me/engagements/${id}/accept`, method: 'POST' }),
      transformResponse: (raw: Engagement | { data: Engagement }) =>
        unwrapData(raw) ?? (raw as Engagement),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Engagement', id: arg.id },
        { type: 'Engagement', id: 'LIST' },
        { type: 'Conversation', id: 'LIST' },
        engagementMessagesTag(arg.id),
        'TalentAvailability',
        'TalentProfile',
      ],
    }),
    declineEngagement: build.mutation<
      Engagement,
      { id: Id; body?: DeclineEngagementRequest; listQuery?: ListEngagementsQuery }
    >({
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
        { type: 'Conversation', id: 'LIST' },
        engagementMessagesTag(arg.id),
      ],
    }),
    postEngagementMessage: build.mutation<
      EngagementMessage,
      { id: Id; body: PostEngagementMessageRequest; listQuery?: ListEngagementsQuery }
    >({
      query: ({ id, body }) => ({
        url: `/me/engagements/${id}/messages`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: EngagementMessage | { data: EngagementMessage }) =>
        unwrapData(raw) ?? (raw as EngagementMessage),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Engagement', id: arg.id },
        { type: 'Engagement', id: 'LIST' },
        engagementMessagesTag(arg.id),
      ],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          engagementsApi.util.updateQueryData('listEngagementMessages', { id }, (draft) => {
            const optimistic: EngagementMessage = {
              id: `temp-${Date.now()}`,
              engagement_id: id,
              sender: 'talent',
              body: body.body,
              attachment_url: body.attachment_url ?? null,
              created_at: new Date().toISOString(),
            };
            draft.push(optimistic);
          }),
        );
        const listPatch = dispatch(
          engagementsApi.util.updateQueryData(
            'listEngagements',
            DEFAULT_LIST_QUERY,
            (draft) => {
              const engagement = draft.data?.find((item) => String(item.id) === String(id));
              if (!engagement) return;
              engagement.last_message_at = new Date().toISOString();
            },
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            engagementsApi.util.updateQueryData('listEngagementMessages', { id }, (draft) => {
              const tempIndex = draft.findIndex((msg) => String(msg.id).startsWith('temp-'));
              if (tempIndex >= 0) draft[tempIndex] = data;
              else draft.push(data);
            }),
          );
        } catch {
          patch.undo();
          listPatch.undo();
        }
      },
    }),
    completeEngagement: build.mutation<Engagement, { id: Id; listQuery?: ListEngagementsQuery }>({
      query: ({ id }) => ({ url: `/me/engagements/${id}/complete`, method: 'POST' }),
      transformResponse: (raw: Engagement | { data: Engagement }) =>
        unwrapData(raw) ?? (raw as Engagement),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Engagement', id: arg.id },
        { type: 'Engagement', id: 'LIST' },
        { type: 'Conversation', id: 'LIST' },
        engagementMessagesTag(arg.id),
        'TalentAvailability',
        'TalentProfile',
      ],
    }),
  }),
});

export const {
  useListEngagementsQuery,
  useListEngagementMessagesQuery,
  useAcceptEngagementMutation,
  useDeclineEngagementMutation,
  usePostEngagementMessageMutation,
  useCompleteEngagementMutation,
} = engagementsApi;
