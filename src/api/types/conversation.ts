import type { Id, Iso8601 } from '@/api/types/common';

export type ConversationType = 'marketplace';
export type ConversationStatus = 'open' | 'closed';
export type ConversationContextType = 'engagement';
export type ParticipantRole = 'organizer' | 'talent' | 'vendor';

export interface ConversationParticipantUser {
  id: Id;
  full_name: string;
  email?: string;
  [key: string]: unknown;
}

export interface ConversationParticipant {
  id: Id;
  user_id: Id;
  role: ParticipantRole;
  last_read_at: Iso8601 | null;
  notifications_muted: boolean;
  user?: ConversationParticipantUser;
  [key: string]: unknown;
}

export interface ConversationMetadata {
  target_type?: 'talent' | 'vendor';
  target_id?: number;
  brief?: string;
  event_id?: number;
  [key: string]: unknown;
}

export interface Conversation {
  id: Id;
  type: ConversationType;
  subject: string;
  status: ConversationStatus;
  context_type: ConversationContextType | string | null;
  context_id: Id | null;
  metadata: ConversationMetadata;
  last_message_at: Iso8601 | null;
  created_at: Iso8601;
  updated_at: Iso8601;
  participants: ConversationParticipant[];
  unread?: boolean;
  [key: string]: unknown;
}

export interface ConversationMessage {
  id: Id;
  conversation_id: Id;
  sender_user_id: Id;
  sender_role: ParticipantRole | string;
  body: string;
  attachment_url: string | null;
  read_at: Iso8601 | null;
  created_at: Iso8601;
  [key: string]: unknown;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface ListConversationsQuery {
  page?: number;
  per_page?: number;
  type?: ConversationType;
  unread_only?: boolean | 0 | 1;
}

export interface ListConversationMessagesQuery {
  id: Id;
  limit?: number;
  before_id?: Id;
}

export interface PostConversationMessageRequest {
  body: string;
  attachment_url?: string;
}

export interface MarkConversationReadRequest {
  up_to_message_id?: Id;
}
