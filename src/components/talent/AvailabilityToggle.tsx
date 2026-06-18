import { cn } from '@/lib/utils';
import type { TalentAvailability } from '@/types/domain';
import { useTranslation } from 'react-i18next';

export function AvailabilityToggle({
  status,
  onChange,
  disabled,
  readOnly,
}: {
  status: TalentAvailability;
  onChange?: (next: TalentAvailability) => void;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  const isAvailable = status === 'available';

  if (readOnly) {
    return (
      <span
        className={cn(
          'inline-flex rounded-full px-4 py-2 text-[12px] font-semibold',
          isAvailable ? 'bg-lemon text-ink' : 'bg-lavender/40 text-ink',
        )}
      >
        {isAvailable ? t('availability.available') : t('availability.reserved')}
      </span>
    );
  }

  return (
    <div className="inline-flex rounded-full border border-ink-10 bg-white p-1 shadow-card-sm">
      <button
        type="button"
        disabled={disabled}
        aria-pressed={isAvailable}
        aria-label={t('availability.setAvailable')}
        onClick={() => onChange?.('available')}
        className={cn(
          'rounded-full px-4 py-2 text-[12px] font-semibold transition-colors',
          isAvailable ? 'bg-lemon text-ink shadow-sm' : 'text-ink-60 hover:text-ink',
        )}
      >
        {t('availability.available')}
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={!isAvailable}
        aria-label={t('availability.setReserved')}
        onClick={() => onChange?.('reserved')}
        className={cn(
          'rounded-full px-4 py-2 text-[12px] font-semibold transition-colors',
          !isAvailable ? 'bg-lavender/50 text-ink shadow-sm' : 'text-ink-60 hover:text-ink',
        )}
      >
        {t('availability.reserved')}
      </button>
    </div>
  );
}
