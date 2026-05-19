export function LoadingSkeleton() {
  return (
    <div className="fade-in space-y-6 sm:space-y-8" role="status" aria-live="polite" aria-busy="true" aria-label="Analiz yükleniyor">
      <p className="sr-only">Analiz yükleniyor, lütfen bekleyin.</p>
      <div className="rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
        <div className="h-3 w-32 animate-pulse rounded-full bg-slate-800/80" />
        <div className="mt-4 h-12 w-2/3 animate-pulse rounded-2xl bg-slate-800/80" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded-lg bg-slate-800/80" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4 animate-pulse">
              <div className="h-3 w-20 rounded-full bg-slate-800/80" />
              <div className="mt-4 h-8 w-28 rounded-xl bg-slate-800/80" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-5 animate-pulse">
            <div className="h-3 w-24 rounded-full bg-slate-800/80" />
            <div className="mt-4 h-7 w-32 rounded-xl bg-slate-800/80" />
            <div className="mt-4 h-2 rounded-full bg-slate-800/80" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-96 rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6 animate-pulse" />
        <div className="h-96 rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6 animate-pulse" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-48 rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6 animate-pulse" />
        <div className="h-48 rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6 animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-48 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-800 rounded w-5/6" />
        <div className="h-4 bg-slate-800 rounded w-4/6" />
      </div>
    </div>
  )
}
