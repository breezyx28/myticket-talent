import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function PageSection({
  title,
  description,
  children,
  className,
  contentClassName,
  elevated = false,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  elevated?: boolean;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      {elevated ? (
        <div className={cn('rounded-2xl border border-ink-10 bg-white p-6 shadow-card-sm', contentClassName)}>
          {children}
        </div>
      ) : (
        <div className={contentClassName}>{children}</div>
      )}
      {title ? (
        <div>
          <p className="text-[13px] font-semibold text-ink">{title}</p>
          {description ? <p className="mt-0.5 text-[12px] text-ink-40">{description}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
