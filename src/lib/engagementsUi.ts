import type { EngagementStatus } from '@/types/domain';

export const ENGAGEMENT_STATUS_FILTERS: Array<{ value: 'all' | EngagementStatus; labelKey: string }> = [
  { value: 'all', labelKey: 'engagements.filterAll' },
  { value: 'pending', labelKey: 'engagements.status_pending' },
  { value: 'accepted', labelKey: 'engagements.status_accepted' },
  { value: 'closed', labelKey: 'engagements.status_closed' },
  { value: 'declined', labelKey: 'engagements.status_declined' },
  { value: 'cancelled', labelKey: 'engagements.status_cancelled' },
];
