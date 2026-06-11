import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink md:text-[32px]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-[65ch] text-[14px] leading-relaxed text-ink-60">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
