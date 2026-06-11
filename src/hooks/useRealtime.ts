import { useEffect, useRef } from 'react';
import { connectEcho, disconnectEcho } from '@/lib/realtime/echo';
import {
  subscribeAdminVerifications,
  subscribeUserChannel,
  type RealtimeHandlers,
} from '@/lib/realtime/channels';

type Options = {
  token: string | null;
  userId: number | null;
  isAdmin?: boolean;
  handlers: RealtimeHandlers;
};

export function useRealtime({ token, userId, isAdmin = false, handlers }: Options): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!token || !userId) {
      disconnectEcho();
      return;
    }

    connectEcho(token);
    subscribeUserChannel(userId, {
      onNotification: (p) => handlersRef.current.onNotification?.(p),
      onGovernmentId: (p) => handlersRef.current.onGovernmentId?.(p),
      onEngagementStatus: (p) => handlersRef.current.onEngagementStatus?.(p),
      onMessageInbox: (p) => handlersRef.current.onMessageInbox?.(p),
    });

    if (isAdmin) {
      subscribeAdminVerifications((p) => handlersRef.current.onAdminVerification?.(p));
    }

    return () => disconnectEcho();
  }, [token, userId, isAdmin]);
}
