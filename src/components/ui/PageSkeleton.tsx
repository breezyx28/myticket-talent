import { useTranslation } from 'react-i18next';

export function PageSkeleton({ label }: { label?: string }) {
  const { t } = useTranslation();
  const text = label ?? t('common.loading');

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-tint px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={text}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-10 border-t-coral" />
      <p className="text-[14px] font-medium text-ink-60">{text}</p>
    </div>
  );
}
