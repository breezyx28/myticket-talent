import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(function TextArea({ className, hasError, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-y rounded-xl border bg-white px-4 py-3 text-[14px] outline-none transition-colors',
        'focus:border-coral focus:ring-2 focus:ring-coral/30',
        hasError ? 'border-coral' : 'border-ink-10',
        className,
      )}
      {...props}
    />
  );
});
