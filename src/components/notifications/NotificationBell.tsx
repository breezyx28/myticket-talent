import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
} from '@/api/endpoints';
import type { Notification } from '@/api/types/notification';
import { formatRelativeTime } from '@/lib/formatDate';
import { navigateToNotificationHref } from '@/lib/notificationNavigation';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const BELL_QUERY = { page: 1, per_page: 15 };

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useListNotificationsQuery(BELL_QUERY);
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = data?.data ?? [];
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  async function handleSelect(notification: Notification) {
    if (!notification.is_read) {
      try {
        await markRead({ id: notification.id }).unwrap();
      } catch {
        /* navigation still proceeds */
      }
    }
    navigateToNotificationHref(notification.href, navigate);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t('notifications.bellAria')}
          className={cn(
            'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-10 bg-white',
            'transition-colors hover:bg-ink-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2',
          )}
        >
          <Bell size={18} strokeWidth={2} className="text-ink-60" />
          {unreadCount > 0 ? (
            <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[min(100vw-2rem,360px)] rounded-2xl border border-ink-10 bg-white p-1.5 shadow-elevated"
          sideOffset={8}
          align="end"
        >
          <div className="flex items-center justify-between border-b border-ink-10 px-3 py-2.5">
            <p className="text-[13px] font-bold text-ink">{t('notifications.title')}</p>
            <Link
              to="/notifications"
              className="text-[12px] font-semibold text-coral hover:underline"
            >
              {t('notifications.viewAll')}
            </Link>
          </div>

          {isLoading ? (
            <p className="px-3 py-6 text-center text-[13px] text-ink-40">{t('common.loading')}</p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-ink-60">{t('notifications.empty')}</p>
          ) : (
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenu.Item
                  key={String(notification.id)}
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-3 outline-none transition-colors hover:bg-ink-5 focus:bg-ink-5',
                    !notification.is_read && 'bg-coral/5',
                  )}
                  onSelect={() => void handleSelect(notification)}
                >
                  <p className="text-[13px] font-semibold text-ink">{notification.title}</p>
                  {notification.body ? (
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-ink-60">{notification.body}</p>
                  ) : null}
                  {notification.created_at ? (
                    <p className="mt-1 text-[11px] text-ink-40">
                      {formatRelativeTime(notification.created_at, i18n.language)}
                    </p>
                  ) : null}
                </DropdownMenu.Item>
              ))}
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
