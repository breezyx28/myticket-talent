import { baseApi } from '@/api/baseApi';
import type { Id } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type {
  ListNotificationsQuery,
  Notification,
  NotificationsPaged,
} from '@/api/types/notification';

function notificationTags(result?: NotificationsPaged | Notification[]) {
  const items = Array.isArray(result) ? result : result?.data;
  return items
    ? [
        ...items.map((n) => ({ type: 'Notification' as const, id: n.id })),
        { type: 'Notification' as const, id: 'LIST' },
      ]
    : [{ type: 'Notification' as const, id: 'LIST' }];
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listNotifications: build.query<NotificationsPaged, ListNotificationsQuery | void>({
      query: (params) => ({ url: '/me/notifications', params: params ?? undefined }),
      transformResponse: (raw: NotificationsPaged | { data: Notification[] }) => {
        if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as NotificationsPaged).data)) {
          return raw as NotificationsPaged;
        }
        const list = unwrapData(raw);
        if (Array.isArray(list)) {
          return {
            current_page: 1,
            data: list,
            first_page_url: null,
            from: list.length > 0 ? 1 : null,
            last_page: 1,
            last_page_url: null,
            links: [],
            next_page_url: null,
            path: '/me/notifications',
            per_page: list.length,
            prev_page_url: null,
            to: list.length > 0 ? list.length : null,
            total: list.length,
          };
        }
        return raw as NotificationsPaged;
      },
      providesTags: (result) => notificationTags(result),
    }),
    markNotificationRead: build.mutation<Notification, { id: Id }>({
      query: ({ id }) => ({
        url: `/me/notifications/${id}/read`,
        method: 'PATCH',
      }),
      transformResponse: (raw: Notification | { data: Notification }) =>
        unwrapData(raw) ?? (raw as Notification),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Notification', id: arg.id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),
  }),
});

export const { useListNotificationsQuery, useMarkNotificationReadMutation } = notificationsApi;
