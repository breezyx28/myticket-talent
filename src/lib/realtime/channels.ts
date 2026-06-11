import type { MessagePayload, NotificationPayload, RealtimeEnvelope } from './types';
import { getEcho } from './echo';

export type RealtimeHandlers = {
  onNotification?: (payload: NotificationPayload) => void;
  onGovernmentId?: (payload: Record<string, unknown>) => void;
  onEngagementStatus?: (payload: Record<string, unknown>) => void;
  onMessageInbox?: (payload: MessagePayload) => void;
  onAdminVerification?: (payload: Record<string, unknown>) => void;
};

export function subscribeUserChannel(userId: number, handlers: RealtimeHandlers): void {
  const echo = getEcho();
  if (!echo) return;

  const channel = echo.private(`user.${userId}`);

  if (handlers.onNotification) {
    channel.listen('.notification.created', (envelope: RealtimeEnvelope<NotificationPayload>) => {
      handlers.onNotification?.(envelope.payload);
    });
  }
  if (handlers.onGovernmentId) {
    channel.listen('.government_id.status_changed', (envelope: RealtimeEnvelope) => {
      handlers.onGovernmentId?.(envelope.payload);
    });
  }
  if (handlers.onEngagementStatus) {
    channel.listen('.engagement.status_changed', (envelope: RealtimeEnvelope) => {
      handlers.onEngagementStatus?.(envelope.payload);
    });
  }
  if (handlers.onMessageInbox) {
    channel.listen('.message.sent', (envelope: RealtimeEnvelope<MessagePayload>) => {
      handlers.onMessageInbox?.(envelope.payload);
    });
  }
}

export function subscribeAdminVerifications(onUpdate: (payload: Record<string, unknown>) => void): void {
  const echo = getEcho();
  if (!echo) return;

  echo.private('admin.verifications').listen(
    '.government_id.status_changed',
    (envelope: RealtimeEnvelope) => onUpdate(envelope.payload),
  );
}

let activeConversationId: number | null = null;

export function subscribeConversation(
  conversationId: number,
  onMessage: (payload: MessagePayload) => void,
): void {
  leaveConversation();
  activeConversationId = conversationId;
  getEcho()
    ?.private(`conversation.${conversationId}`)
    .listen('.message.sent', (envelope: RealtimeEnvelope<MessagePayload>) => {
      onMessage(envelope.payload);
    });
}

export function leaveConversation(): void {
  if (activeConversationId !== null) {
    getEcho()?.leave(`conversation.${activeConversationId}`);
    activeConversationId = null;
  }
}
