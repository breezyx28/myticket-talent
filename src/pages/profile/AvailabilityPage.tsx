import { AvailabilityToggle } from '@/components/talent/AvailabilityToggle';
import {
  useGetTalentAvailabilityQuery,
  useSetTalentAvailabilityMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import type { TalentAvailability } from '@/types/domain';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">{t('availability.title')}</h1>
        <p className="mt-2 text-[14px] text-ink-60">
          {status === 'available' ? t('availability.availableHint') : t('availability.reservedHint')}
        </p>
      </div>

      <div className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        {isLoading ? (
          <p className="text-[14px] text-ink-60">{t('common.loading')}</p>
        ) : (
          <AvailabilityToggle status={status} onChange={(next) => void onChange(next)} disabled={saving} />
        )}
      </div>
    </div>
  );
}
