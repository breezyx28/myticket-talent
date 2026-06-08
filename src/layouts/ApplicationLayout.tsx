import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STEPS = [
  'application.step_identity',
  'application.step_profile',
  'application.step_verification',
  'application.step_review',
] as const;

export function ApplicationLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const stepParam = new URLSearchParams(location.search).get('step');
  const activeStep = stepParam ? Math.min(Math.max(Number(stepParam), 0), STEPS.length - 1) : 0;

  return (
    <div className="min-h-dvh bg-surface-warm">
      <header className="border-b border-ink-10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-[960px] px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">
            MyTicket Talent
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            {t('application.step_identity')}
          </h1>
          <ol className="mt-6 flex flex-wrap gap-2">
            {STEPS.map((key, index) => {
              const done = index < activeStep;
              const current = index === activeStep;
              return (
                <li
                  key={key}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold',
                    current
                      ? 'bg-ink text-white shadow-card-sm'
                      : done
                        ? 'bg-mint/25 text-ink'
                        : 'bg-ink-5 text-ink-60',
                  )}
                >
                  {done ? <Check size={14} strokeWidth={2.5} /> : null}
                  {t(key)}
                </li>
              );
            })}
          </ol>
        </div>
      </header>
      <main className="mx-auto max-w-[960px] px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
