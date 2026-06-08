import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function StatBubble({
  label,
  value,
  icon: Icon,
  className,
  footer,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-ink-10 bg-white p-5 shadow-card-sm transition-colors hover:border-ink-20',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">{label}</p>
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lemon/50 text-ink">
            <Icon size={18} strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-[32px] font-bold leading-none tracking-tight text-ink" dir="ltr">
        {value}
      </p>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
