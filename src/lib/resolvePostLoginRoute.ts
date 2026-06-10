import type { RoleApplicationStatus } from '@/types/domain';

export function resolvePostLoginRoute(input: {
  role: string | null;
  hasTalentApplication: boolean;
  applicationStatus: RoleApplicationStatus | null;
  hasTalentProfile: boolean;
}): string {
  const { role, hasTalentApplication, applicationStatus, hasTalentProfile } = input;

  if (role === 'organizer' || role === 'vendor') return '/access-denied';
  if (hasTalentProfile) return '/';
  if (role === 'talent' || applicationStatus === 'approved') return '/application/status';
  if (!hasTalentApplication) return '/application';
  if (applicationStatus === 'submitted') return '/application/status';
  if (applicationStatus === 'draft' || applicationStatus === 'rejected') return '/application';
  return '/application';
}
