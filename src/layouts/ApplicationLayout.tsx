import { PageTransition } from '@/components/layout/PageTransition';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const stepParam = new URLSearchParams(location.search).get('step');
  const activeStep = stepParam ? Math.min(Math.max(Number(stepParam), 0), STEPS.length - 1) : 0;
  const progressValue = ((activeStep + 1) / STEPS.length) * 100;

  function goToStep(index: number) {
    if (index > activeStep) return;
    navigate(`/application?step=${index}`, { replace: true });
  }

  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="border-b border-ink-10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-[960px] px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">
                {t('brand.product')} {t('brand.talent')}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                {t(STEPS[activeStep])}
              </h1>
            </div>
            <LanguageSwitcher variant="compact" persist />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={progressValue} className="flex-1" />
            <span className="shrink-0 text-[12px] font-medium text-ink-40">
              {activeStep + 1}/{STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[960px] gap-8 px-6 py-8">
        <aside className="hidden w-48 shrink-0 md:block">
          <ol className="space-y-1">
            {STEPS.map((key, index) => {
              const done = index < activeStep;
              const current = index === activeStep;
              const clickable = done;
              return (
                <li key={key}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => goToStep(index)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-[13px] font-semibold transition-colors',
                      current
                        ? 'bg-white text-ink shadow-card-sm ring-1 ring-ink-10'
                        : done
                          ? 'text-ink-60 hover:bg-white/70 hover:text-ink'
                          : 'cursor-default text-ink-40',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]',
                        current
                          ? 'bg-coral text-white'
                          : done
                            ? 'bg-mint/20 text-mint-dark'
                            : 'bg-ink-10 text-ink-40',
                      )}
                    >
                      {done ? <Check size={12} strokeWidth={2.5} /> : index + 1}
                    </span>
                    {t(key)}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-ink-10 bg-white p-6 shadow-card-sm md:p-8">
            <p className="mb-6 text-[13px] font-medium text-ink-40 md:hidden">{t(STEPS[activeStep])}</p>
            <PageTransition key={location.search}>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
