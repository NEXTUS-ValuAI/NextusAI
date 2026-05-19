import { TrendingUp, TrendingDown } from "lucide-react"

export default function BigCard({ title, value, color, change }) {
  const isPositive = change && change > 0

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 sm:rounded-3xl sm:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-indigo-500/0" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-indigo-500/0 transition-all duration-300 group-hover:from-cyan-500/5 group-hover:to-indigo-500/5 sm:rounded-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-500">{title}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <p className={`mt-4 text-2xl font-black leading-tight tracking-tight truncate sm:text-4xl ${color || "text-white"}`}>
          {value || "-"}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-500/0 transition-all duration-300 group-hover:border-cyan-500/30 sm:rounded-3xl" />
    </div>
  )
}
