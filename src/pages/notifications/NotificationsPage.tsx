import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} from '@/api/endpoints';
import type { Notification } from '@/api/types/notification';
import { formatRelativeTime } from '@/lib/formatDate';
import { navigateToNotificationHref } from '@/lib/notificationNavigation';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 20;

export function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useListNotificationsQuery({
    page,
    per_page: PAGE_SIZE,
    unread_only: filter === 'unread' ? true : undefined,
  });
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  const unreadOnPage = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  async function handleClick(notification: Notification) {
    if (!notification.is_read) {
      try {
        await markRead({ id: notification.id }).unwrap();
      } catch {
        /* continue */
      }
    }
    navigateToNotificationHref(notification.href, navigate);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('notifications.title')} />

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setFilter(tab);
              setPage(1);
            }}
            className={cn(
              'rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
              filter === tab
                ? 'bg-ink text-white'
                : 'bg-ink-5 text-ink-60 hover:bg-ink-10 hover:text-ink',
            )}
          >
            {t(tab === 'all' ? 'notifications.all' : 'notifications.unread')}
            {tab === 'unread' && unreadOnPage > 0 && filter === 'unread' ? (
              <span className="ms-1.5 tabular-nums text-coral">({unreadOnPage})</span>
            ) : null}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t('notifications.empty')} />
      ) : (
        <ul className="divide-y divide-ink-10 rounded-2xl border border-ink-10">
          {notifications.map((notification) => (
            <li key={String(notification.id)}>
              <button
                type="button"
                onClick={() => void handleClick(notification)}
                className={cn(
                  'flex w-full flex-col items-start gap-1 px-4 py-4 text-start transition-colors hover:bg-ink-5',
                  !notification.is_read && 'bg-coral/5',
                )}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <p className="text-[14px] font-semibold text-ink">{notification.title}</p>
                  {!notification.is_read ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-coral" aria-hidden />
                  ) : null}
                </div>
                {notification.body ? (
                  <p className="text-[13px] text-ink-60">{notification.body}</p>
                ) : null}
                {notification.created_at ? (
                  <p className="text-[11px] text-ink-40">
                    {formatRelativeTime(notification.created_at, i18n.language)}
                  </p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-ink-10 px-4 py-2 text-[13px] font-semibold text-ink disabled:opacity-40"
          >
            {t('common.previous')}
          </button>
          <span className="text-[13px] text-ink-60">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-ink-10 px-4 py-2 text-[13px] font-semibold text-ink disabled:opacity-40"
          >
            {t('common.next')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
