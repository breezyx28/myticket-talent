import { baseApi } from '@/api/baseApi';
import type { Id, Paginated } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type {
  Conversation,
  ConversationMessage,
  ListConversationMessagesQuery,
  ListConversationsQuery,
  MarkConversationReadRequest,
  PostConversationMessageRequest,
  UnreadCountResponse,
} from '@/api/types/conversation';

const DEFAULT_LIST_QUERY: ListConversationsQuery = { page: 1, per_page: 50 };

function conversationMessagesTag(id: Id) {
  return { type: 'Conversation' as const, id: `${id}-messages` };
}

export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversationsUnreadCount: build.query<UnreadCountResponse, void>({
      query: () => ({ url: '/me/conversations/unread-count' }),
      providesTags: [{ type: 'Conversation', id: 'UNREAD' }],
    }),
    listConversations: build.query<Paginated<Conversation>, ListConversationsQuery | void>({
      query: (params) => ({ url: '/me/conversations', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({ type: 'Conversation' as const, id: c.id })),
              { type: 'Conversation' as const, id: 'LIST' },
            ]
          : [{ type: 'Conversation' as const, id: 'LIST' }],
    }),
    getConversation: build.query<Conversation, { id: Id }>({
      query: ({ id }) => ({ url: `/me/conversations/${id}` }),
      transformResponse: (raw: Conversation | { data: Conversation }) =>
        unwrapData(raw) ?? (raw as Conversation),
      providesTags: (_res, _err, arg) => [{ type: 'Conversation', id: arg.id }],
    }),
    listConversationMessages: build.query<ConversationMessage[], ListConversationMessagesQuery>({
      query: ({ id, limit, before_id }) => ({
        url: `/me/conversations/${id}/messages`,
        params: {
          ...(limit != null ? { limit } : {}),
          ...(before_id != null ? { before_id } : {}),
        },
      }),
      transformResponse: (raw: ConversationMessage[] | { data: ConversationMessage[] }) => {
        const data = unwrapData(raw);
        if (Array.isArray(data)) return data;
        if (Array.isArray(raw)) return raw;
        return [];
      },
      providesTags: (_res, _err, arg) => [conversationMessagesTag(arg.id)],
    }),
    postConversationMessage: build.mutation<
      ConversationMessage,
      { id: Id; body: PostConversationMessageRequest; listQuery?: ListConversationsQuery }
    >({
      query: ({ id, body }) => ({
        url: `/me/conversations/${id}/messages`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: ConversationMessage | { data: ConversationMessage }) =>
        unwrapData(raw) ?? (raw as ConversationMessage),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Conversation', id: arg.id },
        { type: 'Conversation', id: 'LIST' },
        { type: 'Conversation', id: 'UNREAD' },
        conversationMessagesTag(arg.id),
      ],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          conversationsApi.util.updateQueryData('listConversationMessages', { id }, (draft) => {
            const optimistic: ConversationMessage = {
              id: `temp-${Date.now()}`,
              conversation_id: id,
              sender_user_id: 0,
              sender_role: 'talent',
              body: body.body,
              attachment_url: body.attachment_url ?? null,
              read_at: null,
              created_at: new Date().toISOString(),
            };
            draft.push(optimistic);
          }),
        );
        const listPatch = dispatch(
          conversationsApi.util.updateQueryData(
            'listConversations',
            DEFAULT_LIST_QUERY,
            (draft) => {
              const conversation = draft.data?.find((item) => String(item.id) === String(id));
              if (!conversation) return;
              conversation.last_message_at = new Date().toISOString();
            },
          ),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            conversationsApi.util.updateQueryData('listConversationMessages', { id }, (draft) => {
              const tempIndex = draft.findIndex((msg) => String(msg.id).startsWith('temp-'));
              if (tempIndex >= 0) draft[tempIndex] = data;
              else if (!draft.some((msg) => String(msg.id) === String(data.id))) draft.push(data);
            }),
          );
        } catch {
          patch.undo();
          listPatch.undo();
        }
      },
    }),
    markConversationRead: build.mutation<{ message: string }, { id: Id; body?: MarkConversationReadRequest }>({
      query: ({ id, body }) => ({
        url: `/me/conversations/${id}/read`,
        method: 'POST',
        body: body ?? {},
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Conversation', id: arg.id },
        { type: 'Conversation', id: 'LIST' },
        { type: 'Conversation', id: 'UNREAD' },
      ],
    }),
  }),
});

export const {
  useGetConversationsUnreadCountQuery,
  useListConversationsQuery,
  useGetConversationQuery,
  useListConversationMessagesQuery,
  usePostConversationMessageMutation,
  useMarkConversationReadMutation,
} = conversationsApi;

/** Append a realtime message if not already present. */
export function appendConversationMessageIfNew(
  dispatch: (action: unknown) => void,
  conversationId: Id,
  message: ConversationMessage,
): void {
  dispatch(
    conversationsApi.util.updateQueryData('listConversationMessages', { id: conversationId }, (draft) => {
      if (draft.some((msg) => String(msg.id) === String(message.id))) return;
      draft.push(message);
    }),
  );
}
