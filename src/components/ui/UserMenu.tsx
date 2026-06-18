import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function UserMenu({
  email,
  onSignOut,
}: {
  email?: string | null;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t('shell.userMenu')}
          className={cn(
            'inline-flex h-10 max-w-[240px] items-center gap-2 rounded-full border border-ink-10 bg-white px-3 text-[13px] font-semibold text-ink',
            'transition-colors hover:bg-ink-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2',
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-5 text-ink-60">
            <UserRound size={14} />
          </span>
          <span className="hidden truncate sm:inline">{email ?? t('shell.talent')}</span>
          <ChevronDown size={14} className="shrink-0 text-ink-40" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] rounded-2xl border border-ink-10 bg-white p-1.5 shadow-elevated"
          sideOffset={8}
          align="end"
        >
          {email ? (
            <div className="border-b border-ink-10 px-3 py-2.5">
              <p className="truncate text-[12px] font-semibold text-ink">{email}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-40">{t('shell.talent')}</p>
            </div>
          ) : null}
          <div className="px-2 py-2">
            <LanguageSwitcher variant="compact" persist className="w-full justify-center" />
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-ink-10" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium text-coral outline-none hover:bg-coral/5 focus:bg-coral/5"
            onSelect={() => void onSignOut()}
          >
            <LogOut size={16} />
            {t('common.signOut')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
