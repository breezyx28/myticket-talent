import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ProfileTab = 'basic' | 'location' | 'portfolio' | 'verification' | 'settings';

const TABS: ProfileTab[] = ['basic', 'location', 'portfolio', 'verification', 'settings'];

export function ProfileSubNav({
  active,
  onChange,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="relative lg:hidden">
        <select
          value={active}
          onChange={(e) => onChange(e.target.value as ProfileTab)}
          className="w-full appearance-none rounded-xl border border-ink-10 bg-white py-3 ps-4 pe-10 text-[14px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          aria-label={t('profile.title')}
        >
          {TABS.map((tab) => (
            <option key={tab} value={tab}>
              {t(`profile.tabs.${tab}`)}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-40" />
      </div>

      <nav className="hidden lg:block" aria-label={t('profile.title')}>
        <ul className="space-y-0.5">
          {TABS.map((tab) => {
            const isActive = active === tab;
            return (
              <li key={tab}>
                <button
                  type="button"
                  onClick={() => onChange(tab)}
                  className={cn(
                    'relative w-full rounded-xl px-3 py-2.5 text-start text-[14px] font-semibold transition-colors',
                    isActive
                      ? 'bg-white text-ink shadow-card-sm ring-1 ring-ink-10'
                      : 'text-ink-60 hover:bg-white/60 hover:text-ink',
                  )}
                >
                  {isActive ? (
                    <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-coral" aria-hidden />
                  ) : null}
                  <span className={cn(isActive ? 'ps-2' : '')}>{t(`profile.tabs.${tab}`)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
