import { cn } from '@/lib/utils';
import { forwardRef, type SelectHTMLAttributes } from 'react';

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(function Select({ className, hasError, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border bg-white px-4 py-3 text-[14px] outline-none transition-colors',
        'focus:border-coral focus:ring-2 focus:ring-coral/30',
        hasError ? 'border-coral' : 'border-ink-10',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
