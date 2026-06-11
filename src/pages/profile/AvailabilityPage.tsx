import { AvailabilityToggle } from '@/components/talent/AvailabilityToggle';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  useGetTalentAvailabilityQuery,
  useSetTalentAvailabilityMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import type { TalentAvailability } from '@/types/domain';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

/** Deep-link wrapper — availability is managed inline on Profile → Location. */
export function AvailabilityPage() {
  const { t } = useTranslation();
  const { data: availability, isLoading } = useGetTalentAvailabilityQuery();
  const [setAvailability, { isLoading: saving }] = useSetTalentAvailabilityMutation();

  const status: TalentAvailability = availability?.status ?? 'available';

  async function onChange(next: TalentAvailability) {
    try {
      await setAvailability({ status: next }).unwrap();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        title={t('availability.title')}
        description={
          status === 'available' ? t('availability.availableHint') : t('availability.reservedHint')
        }
      />
      <p className="text-[13px] text-ink-60">
        <Link to="/profile?tab=location" className="font-semibold text-coral hover:underline">
          {t('profile.tabs.location')}
        </Link>
      </p>
      <div className="rounded-2xl border border-ink-10 bg-surface-muted p-6">
        {isLoading ? (
          <p className="text-[14px] text-ink-60">{t('common.loading')}</p>
        ) : (
          <AvailabilityToggle status={status} onChange={(next) => void onChange(next)} disabled={saving} />
        )}
      </div>
    </div>
  );
}
