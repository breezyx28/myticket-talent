import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <ProgressPrimitive.Root
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-ink-10', className)}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-coral transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
