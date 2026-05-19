export default function MetricCard({ title, value, icon: Icon }) {
  return (
    <div className="group relative min-h-[7rem] overflow-hidden rounded-xl border border-slate-700/40 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:from-slate-800/50 hover:to-slate-900/50 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/0 via-cyan-400/30 to-indigo-500/0" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-500">{title}</p>
          <p className="mt-2 truncate text-lg font-semibold text-white sm:text-2xl">{value || "-"}</p>
        </div>
        {Icon && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-950/50 p-2.5 transition-colors group-hover:border-cyan-500/20 group-hover:bg-cyan-500/10">
            <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-cyan-400" />
          </div>
        )}
      </div>
    </div>
  )
}
