import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-ink-10/80', className)}
      aria-hidden
    />
  );
}

export function PageSkeletonBlocks() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
