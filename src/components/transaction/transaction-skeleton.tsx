export function TransactionSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted">Reading transaction...</p>

      <div className="flex gap-2">
        <div className="h-7 w-28 animate-pulse rounded-full bg-surface-hover" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-surface-hover" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-surface-hover" />
      </div>

      <div className="h-10 w-full animate-pulse rounded-xl bg-surface-hover" />

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex gap-4">
          <div className="size-11 shrink-0 animate-pulse rounded-2xl bg-surface-hover" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
            <div className="h-7 w-full max-w-lg animate-pulse rounded bg-surface-hover" />
            <div className="h-7 w-2/3 max-w-md animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="h-36 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>

      <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface" />
      <div className="h-16 animate-pulse rounded-2xl border border-border bg-surface" />
      <div className="h-14 animate-pulse rounded-2xl border border-border bg-surface" />
    </div>
  );
}
