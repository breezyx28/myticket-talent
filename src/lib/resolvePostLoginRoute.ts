import type { RoleApplicationStatus } from '@/types/domain';

export function resolvePostLoginRoute(input: {
  role: string | null;
  hasTalentApplication: boolean;
  applicationStatus: RoleApplicationStatus | null;
  hasTalentProfile: boolean;
}): string {
  const { role, hasTalentApplication, applicationStatus, hasTalentProfile } = input;

  if (role === 'organizer' || role === 'vendor') return '/access-denied';
  if (hasTalentProfile || role === 'talent') return '/';
  if (!hasTalentApplication) return '/application';
  if (applicationStatus === 'submitted') return '/application/status';
  if (applicationStatus === 'draft' || applicationStatus === 'rejected') return '/application';
  if (applicationStatus === 'approved') return '/';
  return '/application';
}
