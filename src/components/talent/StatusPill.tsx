import { cn } from '@/lib/utils';
import { APPLICATION_STATUS_PILL, ENGAGEMENT_STATUS_PILL } from '@/types/domain';

type PillKind = 'application' | 'engagement';

export function StatusPill({
  status,
  label,
  kind = 'engagement',
  className,
}: {
  status: string;
  label: string;
  kind?: PillKind;
  className?: string;
}) {
  const palette = kind === 'application' ? APPLICATION_STATUS_PILL : ENGAGEMENT_STATUS_PILL;
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
        palette[status] ?? 'bg-ink-5 text-ink-60',
        className,
      )}
    >
      {label}
    </span>
  );
}
