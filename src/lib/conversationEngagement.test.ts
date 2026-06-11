import { describe, expect, it } from 'vitest';
import {
  buildEngagementIdToConversationIdMap,
  filterConversationsByEngagementStatus,
  getEngagementForConversation,
} from './conversationEngagement';
import type { Conversation } from '@/api/types/conversation';
import type { Engagement } from '@/api/types/engagement';

const baseConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 7,
  type: 'marketplace',
  subject: 'Wedding singer',
  status: 'open',
  context_type: 'engagement',
  context_id: 15,
  metadata: { brief: 'Need a singer' },
  last_message_at: '2026-06-13T14:30:00+00:00',
  created_at: '2026-06-13T12:00:00+00:00',
  updated_at: '2026-06-13T14:30:00+00:00',
  participants: [],
  ...overrides,
});

const baseEngagement = (overrides: Partial<Engagement> = {}): Engagement => ({
  id: 15,
  organizer_user_id: 3,
  target_type: 'talent',
  target_id: 12,
  target_user_id: 42,
  related_event_id: null,
  topic: 'Wedding singer',
  preview: 'Need a singer',
  status: 'pending',
  organizer_profile_snapshot: { display_name: 'Jane' },
  target_profile_snapshot: {},
  accepted_at: null,
  declined_at: null,
  declined_reason: null,
  closed_at: null,
  last_message_at: '2026-06-13T14:30:00+00:00',
  created_at: '2026-06-13T12:00:00+00:00',
  updated_at: '2026-06-13T14:30:00+00:00',
  ...overrides,
});

describe('conversationEngagement', () => {
  it('joins conversation to engagement via context_id', () => {
    const conversation = baseConversation();
    const engagements = [baseEngagement(), baseEngagement({ id: 99, status: 'accepted' })];
    expect(getEngagementForConversation(conversation, engagements)?.status).toBe('pending');
  });

  it('filters conversations by engagement status', () => {
    const conversations = [
      baseConversation({ id: 1, context_id: 15 }),
      baseConversation({ id: 2, context_id: 16 }),
    ];
    const engagements = [
      baseEngagement({ id: 15, status: 'pending' }),
      baseEngagement({ id: 16, status: 'accepted' }),
    ];
    const filtered = filterConversationsByEngagementStatus(conversations, engagements, 'accepted');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(2);
  });

  it('builds engagement id to conversation id map', () => {
    const conversations = [
      baseConversation({ id: 7, context_id: 15 }),
      baseConversation({ id: 8, context_id: 20 }),
    ];
    const map = buildEngagementIdToConversationIdMap(conversations);
    expect(map.get('15')).toBe('7');
    expect(map.get('20')).toBe('8');
  });
});
