import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-ink-10/80', className)}
      aria-hidden
    />
  );
}

export function PageSkeletonBlocks() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6" aria-busy aria-label={t('common.loading')}>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
