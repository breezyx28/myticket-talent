import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type ProfileTab = 'basic' | 'location' | 'portfolio' | 'verification' | 'settings';

const TABS: ProfileTab[] = ['basic', 'location', 'portfolio', 'verification', 'settings'];

export function ProfileTabs({
  active,
  onChange,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2 border-b border-ink-10 pb-4">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
            active === tab
              ? 'bg-ink text-white shadow-card-sm'
              : 'bg-ink-5 text-ink-60 hover:bg-ink-10 hover:text-ink',
          )}
        >
          {t(`profile.tabs.${tab}`)}
        </button>
      ))}
    </div>
  );
}
