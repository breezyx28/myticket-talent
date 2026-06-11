import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-20 bg-surface-muted px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink-40 shadow-card-sm">
          <Icon size={22} strokeWidth={1.75} />
        </span>
      ) : null}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description ? <p className="mt-2 max-w-[40ch] text-[14px] leading-relaxed text-ink-60">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link to={actionHref} className="mt-5">
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <Button variant="primary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyStateAction({ children }: { children: ReactNode }) {
  return <div className="mt-5">{children}</div>;
}
