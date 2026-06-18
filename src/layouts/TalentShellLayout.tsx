import { PageTransition } from '@/components/layout/PageTransition';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { UserMenu } from '@/components/ui/UserMenu';
import { NAV_MAIN, NAV_MOBILE_TABS } from '@/config/nav';
import { useAuth } from '@/hooks/useAuth';
import { useGetConversationsUnreadCountQuery } from '@/api/endpoints';
import { cn } from '@/lib/utils';
import { Menu, Mic2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export function TalentShellLayout() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { data: unreadData } = useGetConversationsUnreadCountQuery();
  const unreadCount = unreadData?.unread_count ?? 0;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-surface-muted text-ink">
      <header className="sticky top-0 z-50 border-b border-ink-10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] max-w-full items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex rounded-full border border-ink-10 p-2 lg:hidden"
              aria-label={t('shell.openMenu')}
              onClick={() => setOpen(true)}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <NavLink to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lemon shadow-card-sm ring-1 ring-ink/5">
                <Mic2 size={16} strokeWidth={2} className="text-ink" />
              </span>
              <span className="hidden leading-tight sm:inline">
                {t('brand.product')} <span className="text-coral">{t('brand.talent')}</span>
              </span>
            </NavLink>
          </div>
          <UserMenu email={user?.email} onSignOut={() => void signOut()} />
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-0 start-0 z-40 w-[86%] max-w-[280px] bg-white p-5 pt-20 transition-transform lg:static lg:z-auto lg:w-56 lg:max-w-none lg:translate-x-0 lg:border-e lg:border-ink-10 lg:bg-transparent lg:pt-6 lg:ps-6',
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 rtl:translate-x-full rtl:lg:translate-x-0',
          )}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <LanguageSwitcher variant="compact" persist />
            <button
              type="button"
              className="rounded-full p-2 hover:bg-ink-5"
              aria-label={t('shell.closeMenu')}
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-0.5" aria-label={t('nav.home')}>
            {NAV_MAIN.map((item) => {
              const showBadge = item.to === '/engagements' && unreadCount > 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors',
                      isActive
                        ? 'bg-white text-ink shadow-card-sm ring-1 ring-ink-10 lg:bg-white'
                        : 'text-ink-60 hover:bg-white/70 hover:text-ink lg:hover:bg-white/50',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-coral" aria-hidden />
                      ) : null}
                      <span className="relative">
                        <item.icon size={18} strokeWidth={2} className={cn(isActive ? 'text-coral' : '')} />
                        {showBadge ? (
                          <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        ) : null}
                      </span>
                      <span className={cn(isActive ? 'ps-1' : '')}>{t(item.labelKey)}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-[calc(100dvh-64px)] flex-1 px-4 py-8 pb-24 md:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-[1280px] rounded-2xl bg-white p-6 shadow-card-sm md:p-8">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-10 bg-white/95 backdrop-blur-md lg:hidden"
        aria-label={t('nav.home')}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex">
          {NAV_MOBILE_TABS.map((item) => {
            const showBadge = item.to === '/engagements' && unreadCount > 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
                    isActive ? 'text-coral' : 'text-ink-40',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <item.icon size={20} strokeWidth={isActive ? 2.25 : 2} />
                      {showBadge ? (
                        <span className="absolute -end-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-coral px-0.5 text-[8px] font-bold text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      ) : null}
                    </span>
                    {t(item.labelKey)}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          aria-label={t('shell.closeMenu')}
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
