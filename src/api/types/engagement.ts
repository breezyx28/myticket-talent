import type { Id, Iso8601 } from '@/api/types/common';
import type { EngagementStatus } from '@/types/domain';

export interface EngagementProfileSnapshot {
  display_name?: string;
  stage_name?: string;
  [key: string]: unknown;
}

export interface EngagementMessage {
  id: Id;
  engagement_id: Id;
  sender_user_id?: Id;
  sender: 'organizer' | 'talent' | 'vendor' | 'system' | string;
  body: string;
  attachment_url?: string | null;
  read_at?: Iso8601 | null;
  created_at: Iso8601;
  [key: string]: unknown;
}

export interface Engagement {
  id: Id;
  organizer_user_id: number;
  target_type: 'talent';
  target_id: number;
  target_user_id: number;
  related_event_id: number | null;
  topic: string;
  preview: string;
  status: EngagementStatus;
  organizer_profile_snapshot: EngagementProfileSnapshot;
  target_profile_snapshot: EngagementProfileSnapshot;
  accepted_at: Iso8601 | null;
  declined_at: Iso8601 | null;
  declined_reason: string | null;
  closed_at: Iso8601 | null;
  last_message_at: Iso8601;
  created_at: Iso8601;
  updated_at: Iso8601;
  messages?: EngagementMessage[];
  [key: string]: unknown;
}

export interface PostEngagementMessageRequest {
  body: string;
  attachment_url?: string;
}

export interface DeclineEngagementRequest {
  reason?: string;
}
