import { baseApi } from '@/api/baseApi';
import { getToken } from '@/api/authToken';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useDispatch } from 'react-redux';
import { useMemo } from 'react';

export function RealtimeBridge() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const token = getToken();
  const userId = user?.id != null ? Number(user.id) : null;

  const handlers = useMemo(
    () => ({
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
    [dispatch],
  );

  useRealtime({
    token,
    userId: Number.isFinite(userId) ? userId : null,
    isAdmin: false,
    handlers,
  });

  return null;
}
