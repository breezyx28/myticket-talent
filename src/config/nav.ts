import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, MessageSquare, UserRound } from 'lucide-react';

export type NavItem = { to: string; labelKey: string; icon: LucideIcon };

/** Primary dashboard navigation (≤3 items). */
export const NAV_MAIN: NavItem[] = [
  { to: '/', labelKey: 'nav.home', icon: LayoutDashboard },
  { to: '/engagements', labelKey: 'nav.engagements', icon: MessageSquare },
  { to: '/profile', labelKey: 'nav.profile', icon: UserRound },
];

/** Mobile bottom tab bar uses the same items. */
export const NAV_MOBILE_TABS = NAV_MAIN;
