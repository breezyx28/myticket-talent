import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'default' | 'muted' | 'success' | 'warning' | 'danger';

const variantClass: Record<BadgeVariant, string> = {
  default: 'bg-ink-5 text-ink-60',
  muted: 'bg-ink-5 text-ink-40',
  success: 'bg-mint/30 text-mint-dark',
  warning: 'bg-lemon/40 text-ink',
  danger: 'bg-coral/15 text-coral',
};

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
