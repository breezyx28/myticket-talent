import { getToken } from '@/api/authToken';
import { useUpdatePreferencesMutation } from '@/api/endpoints';
import type { AppLanguage } from '@/i18n';
import { applyAppLanguage, getAppLanguage } from '@/lib/language';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type LanguageSwitcherProps = {
  variant?: 'toggle' | 'select' | 'compact';
  persist?: boolean;
  className?: string;
  onChanged?: (lng: AppLanguage) => void;
};

export function LanguageSwitcher({
  variant = 'toggle',
  persist = false,
  className,
  onChanged,
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const [updatePreferences] = useUpdatePreferencesMutation();
  const current = getAppLanguage();

  async function setLanguage(next: AppLanguage) {
    if (next === current) return;
    await applyAppLanguage(next);
    onChanged?.(next);
    if (persist && getToken()) {
      try {
        await updatePreferences({ language: next }).unwrap();
      } catch {
        toast.error(t('common.error'));
      }
    }
  }

  if (variant === 'select') {
    return (
      <select
        aria-label={t('common.language')}
        className={cn(
          'rounded-xl border border-ink-10 bg-white px-3 py-2 text-[13px] font-medium text-ink',
          className,
        )}
        value={current}
        onChange={(e) => void setLanguage(e.target.value as AppLanguage)}
      >
        <option value="en">{t('locale.en')}</option>
        <option value="ar">{t('locale.ar')}</option>
      </select>
    );
  }

  const next: AppLanguage = current === 'ar' ? 'en' : 'ar';
  const label = current === 'ar' ? t('locale.ar') : t('locale.en');

  return (
    <button
      type="button"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-ink-10 bg-white font-semibold text-ink transition-colors hover:bg-ink-5',
        variant === 'compact' ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2 text-[13px]',
        className,
      )}
      onClick={() => void setLanguage(next)}
    >
      <Globe size={variant === 'compact' ? 14 : 16} className="text-ink-60" />
      {label}
    </button>
  );
}
