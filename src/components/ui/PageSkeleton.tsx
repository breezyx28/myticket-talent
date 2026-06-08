export function PageSkeleton({ label }: { label?: string }) {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-tint px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-10 border-t-coral" />
      {label ? <p className="text-[14px] font-medium text-ink-60">{label}</p> : null}
    </div>
  );
}
