import { PageTransition } from '@/components/layout/PageTransition';
import { Mic2 } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function PublicAuthLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-surface-muted lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #ff6b4a 0%, transparent 50%), radial-gradient(circle at 80% 70%, #f5e642 0%, transparent 40%)',
          }}
        />
        <div className="relative flex items-center gap-3 font-extrabold tracking-tight text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lemon text-ink">
            <Mic2 size={20} />
          </span>
          MyTicket <span className="text-coral">Talent</span>
        </div>
        <div className="relative">
          <p className="text-[32px] font-extrabold leading-tight text-white">{t('auth.brandTagline')}</p>
          <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-white/60">
            {t('auth.loginTitle')}
          </p>
        </div>
      </div>

      <div className="flex min-h-dvh flex-col justify-center px-6 py-16 lg:px-12">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </div>
    </div>
  );
}
