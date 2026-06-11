import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const variantClass: Record<AlertVariant, string> = {
  info: 'border-sky/30 bg-sky/10 text-ink',
  success: 'border-mint/30 bg-mint/10 text-ink',
  warning: 'border-amber/40 bg-amber/10 text-ink',
  error: 'border-coral/30 bg-coral/10 text-ink',
};

const iconClass: Record<AlertVariant, string> = {
  info: 'text-sky-dark',
  success: 'text-mint-dark',
  warning: 'text-amber',
  error: 'text-coral',
};

export function Alert({
  variant = 'info',
  icon: Icon,
  title,
  children,
  action,
  actionHref,
  actionLabel,
  className,
}: {
  variant?: AlertVariant;
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 rounded-2xl border px-5 py-4',
        variantClass[variant],
        className,
      )}
      role="status"
    >
      <div className="flex min-w-0 flex-1 gap-3">
        {Icon ? <Icon size={20} className={cn('mt-0.5 shrink-0', iconClass[variant])} /> : null}
        <div className="min-w-0">
          {title ? <p className="text-[14px] font-semibold text-ink">{title}</p> : null}
          <div className={cn('text-[14px] leading-relaxed text-ink-60', title ? 'mt-1' : '')}>{children}</div>
        </div>
      </div>
      {action ?? (actionHref && actionLabel ? (
        <Link
          to={actionHref}
          className="shrink-0 rounded-full bg-coral px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:bg-coral-dark active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null)}
    </div>
  );
}
