import { cn } from '@/lib/utils';
import type { TalentApplicationDetail } from '@/types/domain';
import { isTalentApplicationReady, TALENT_BIO_MIN_CHARS } from '@/lib/onboardingValidation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-[14px]">
      {ok ? (
        <CheckCircle2 size={18} className="shrink-0 text-mint-dark" />
      ) : (
        <AlertCircle size={18} className="shrink-0 text-amber" />
      )}
      <span className={cn(ok ? 'text-ink-60' : 'text-ink')}>{label}</span>
    </li>
  );
}

export function ReviewChecklist({ detail }: { detail: TalentApplicationDetail }) {
  const { t } = useTranslation();
  const app = detail.talent_application;
  const ready = isTalentApplicationReady(detail);

  const checks = [
    { ok: Boolean(app?.stage_name?.trim()), label: t('application.checkStageName') },
    {
      ok: Boolean(app?.contact_email?.trim()) && Boolean(app?.contact_phone?.trim()),
      label: t('application.checkContact'),
    },
    { ok: (app?.bio?.trim().length ?? 0) >= TALENT_BIO_MIN_CHARS, label: t('application.checkBio') },
    { ok: (app?.media?.length ?? 0) > 0, label: t('application.checkMedia') },
    { ok: Boolean(app?.accepted_quality_disclaimer), label: t('application.checkDisclaimer') },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border px-5 py-4',
        ready ? 'border-mint/30 bg-mint/5' : 'border-amber/30 bg-amber/5',
      )}
    >
      <p className="text-[13px] font-semibold text-ink">{t('application.reviewChecklist')}</p>
      <ul className="mt-3 space-y-2">
        {checks.map((c) => (
          <CheckRow key={c.label} ok={c.ok} label={c.label} />
        ))}
      </ul>
    </div>
  );
}
