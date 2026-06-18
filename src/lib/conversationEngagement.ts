import type { Conversation } from '@/api/types/conversation';
import type { Engagement } from '@/api/types/engagement';
import type { EngagementStatus } from '@/types/domain';

export function getOrganizerParticipant(conversation: Conversation) {
  return conversation.participants?.find((p) => p.role === 'organizer');
}

export function getOrganizerDisplayName(conversation: Conversation, fallback: string): string {
  const organizer = getOrganizerParticipant(conversation);
  return organizer?.user?.full_name ?? fallback;
}

export function getEngagementForConversation(
  conversation: Conversation,
  engagements: Engagement[],
): Engagement | null {
  if (conversation.context_type !== 'engagement' || conversation.context_id == null) return null;
  return (
    engagements.find((e) => String(e.id) === String(conversation.context_id)) ?? null
  );
}

export function getEngagementStatusForConversation(
  conversation: Conversation,
  engagements: Engagement[],
): EngagementStatus | null {
  const engagement = getEngagementForConversation(conversation, engagements);
  return engagement?.status ?? null;
}

export function filterConversationsByEngagementStatus(
  conversations: Conversation[],
  engagements: Engagement[],
  statusFilter: 'all' | EngagementStatus,
): Conversation[] {
  if (statusFilter === 'all') return conversations;
  return conversations.filter((c) => {
    const status = getEngagementStatusForConversation(c, engagements);
    return status === statusFilter;
  });
}

export function buildEngagementIdToConversationIdMap(
  conversations: Conversation[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of conversations) {
    if (c.context_type === 'engagement' && c.context_id != null) {
      map.set(String(c.context_id), String(c.id));
    }
  }
  return map;
}
