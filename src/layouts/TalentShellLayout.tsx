import { NAV_MAIN } from '@/config/nav';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
} from '@/api/endpoints';
import type { AppLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { Globe, LogOut, Menu, Mic2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';

export function TalentShellLayout() {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: preferences } = useGetPreferencesQuery();
  const [updatePreferences] = useUpdatePreferencesMutation();

  useEffect(() => {
    const next = preferences?.language;
    if ((next === 'en' || next === 'ar') && i18n.language !== next) {
      void i18n.changeLanguage(next);
    }
  }, [i18n, preferences?.language]);

  async function toggleLanguage() {
    const next: AppLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    await i18n.changeLanguage(next);
    try {
      await updatePreferences({ language: next }).unwrap();
    } catch {
      /* language still switched locally */
    }
  }

  const displayLang = preferences?.language ?? (i18n.language === 'ar' ? 'ar' : 'en');

  return (
    <div className="min-h-dvh bg-surface-page text-ink">
      <header className="sticky top-0 z-50 h-[72px] border-b border-ink-10 bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-full items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-full border border-ink-10 p-2 md:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <NavLink to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-ink">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lemon shadow-card-sm ring-1 ring-ink/5">
                <Mic2 size={18} strokeWidth={2} className="text-ink" />
              </span>
              <span className="leading-tight">
                MyTicket <span className="text-coral">Talent</span>
              </span>
            </NavLink>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleLanguage()}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-10 bg-white px-4 text-[13px] font-semibold text-ink-60 transition-colors hover:bg-ink-5 hover:text-ink"
            >
              <Globe size={16} strokeWidth={2} />
              {displayLang === 'ar' ? 'العربية' : 'EN'}
            </button>
            <div className="hidden rounded-2xl border border-ink-10 bg-white px-3 py-1.5 md:block">
              <p className="max-w-[220px] truncate text-[12px] font-semibold text-ink">{user?.email}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-40">Talent</p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="hidden h-10 items-center gap-2 rounded-full border-2 border-ink bg-white px-4 text-[13px] font-semibold shadow-sm transition-colors hover:bg-ink-5 md:inline-flex"
            >
              <LogOut size={16} strokeWidth={2} />
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-0 start-0 z-40 w-[86%] max-w-[320px] bg-white/95 p-6 transition-transform',
            'md:top-[72px] md:z-30 md:w-72 md:max-w-none md:translate-x-0 md:overflow-y-auto md:border-e md:border-ink-10 md:bg-white md:p-5 md:pt-6',
            open ? 'translate-x-0' : '-translate-x-full md:translate-x-0 rtl:translate-x-full rtl:md:translate-x-0',
          )}
        >
          <div className="mb-6 flex items-center justify-between md:hidden">
            <p className="text-sm font-bold">{t('common.language')}</p>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-ink-5"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1">
            {NAV_MAIN.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-colors',
                    isActive
                      ? 'bg-ink text-white shadow-card-md'
                      : 'text-ink-60 hover:bg-ink-5 hover:text-ink',
                  )
                }
              >
                <item.icon size={18} strokeWidth={2} />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-ink-10 bg-ink-5/60 p-4 md:hidden">
            <button
              type="button"
              onClick={() => {
                void signOut();
                setOpen(false);
              }}
              className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white"
            >
              {t('common.signOut')}
            </button>
          </div>
        </aside>

        <main className="min-h-[calc(100dvh-72px)] flex-1 px-4 py-10 md:ms-72 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
