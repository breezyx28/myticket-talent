import type { Id, Iso8601, Paginated, PaginationQuery } from '@/api/types/common';

export interface Notification {
  id: Id;
  user_id?: Id;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  is_read: boolean;
  created_at: Iso8601 | null;
  [key: string]: unknown;
}

export interface ListNotificationsQuery extends PaginationQuery {
  since?: Iso8601;
  unread_only?: boolean;
}

export type NotificationsPaged = Paginated<Notification>;
