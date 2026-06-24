import { baseApi } from '@/api/baseApi';
import { notificationsApi } from '@/api/endpoints/notifications';
import { getToken } from '@/api/authToken';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import type { NotificationPayload } from '@/lib/realtime/types';
import { navigateToNotificationHref } from '@/lib/notificationNavigation';
import type { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

let lastNotificationSyncAt: string | null = null;

export function RealtimeBridge() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const token = getToken();
  const userId = user?.id != null ? Number(user.id) : null;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const onNotification = useCallback(
    (payload: NotificationPayload) => {
      dispatch(
        baseApi.util.invalidateTags([
          { type: 'Notification', id: 'LIST' },
          { type: 'Notification', id: payload.id },
        ]),
      );

      const since = lastNotificationSyncAt;
      lastNotificationSyncAt = new Date().toISOString();
      if (since) {
        void dispatch(
          notificationsApi.endpoints.listNotifications.initiate(
            { since },
            { forceRefetch: true },
          ),
        );
      }

      if (payload.title) {
        toast(payload.title, {
          description: payload.body ?? undefined,
          action: payload.href
            ? {
                label: '→',
                onClick: () => navigateToNotificationHref(payload.href, navigateRef.current),
              }
            : undefined,
        });
      }
    },
    [dispatch],
  );

  const handlers = useMemo(
    () => ({
      onNotification,
      onMessageInbox: () => {
        dispatch(
          baseApi.util.invalidateTags([
            { type: 'Conversation', id: 'LIST' },
            { type: 'Conversation', id: 'UNREAD' },
          ]),
        );
      },
      onEngagementStatus: () => {
        dispatch(
          baseApi.util.invalidateTags([
            { type: 'Conversation', id: 'LIST' },
            { type: 'Engagement', id: 'LIST' },
          ]),
        );
      },
      onGovernmentId: () => {
        dispatch(baseApi.util.invalidateTags(['GovernmentIdVerification']));
      },
    }),
    [dispatch, onNotification],
  );

  useRealtime({
    token,
    userId: Number.isFinite(userId) ? userId : null,
    isAdmin: false,
    handlers,
  });

  return null;
}
