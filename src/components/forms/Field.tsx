import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Field({
  label,
  error,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label className={cn('block', className)} htmlFor={htmlFor}>
      <span className="text-[12px] font-semibold text-ink-60">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-coral" role="alert">
          {error}
        </p>
      ) : null}
      {!error && hint ? <p className="mt-1.5 text-[12px] text-ink-40">{hint}</p> : null}
    </label>
  );
}
