import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }>(
  function TextInput({ className, hasError, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-3 text-[14px] outline-none transition-colors',
          'focus:border-coral focus:ring-2 focus:ring-coral/30',
          hasError ? 'border-coral' : 'border-ink-10',
          className,
        )}
        {...props}
      />
    );
  },
);
