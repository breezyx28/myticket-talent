import type { RoleApplicationStatus } from '@/types/domain';

export function canEditTalentApplication(status: RoleApplicationStatus | null | undefined): boolean {
  return status === 'draft' || status === 'rejected';
}
