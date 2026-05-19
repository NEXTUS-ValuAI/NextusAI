import { Sparkles, ShieldAlert, Target, TrendingUp, ArrowUpRight } from "lucide-react"
import { buildSummaryModel } from "./summaryHelpers"

export function AccessibleSummaryPanel({ data }) {
  if (!data) return null

  const summary = buildSummaryModel(data)

  return (
    <section
      className="mt-6 sm:mt-8 rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-cyan-500/10 sm:p-8"
      role="region"
      aria-labelledby="accessible-summary-title"
      aria-describedby="accessible-summary-desc"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">
            <Sparkles size={12} />
            Erişilebilir finansal özet
          </div>
          <h2 id="accessible-summary-title" className="mt-4 text-2xl font-black text-white sm:text-4xl">
            {summary.companyName} için sade sonuç
          </h2>
          <p id="accessible-summary-desc" className="mt-3 max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
            {summary.summaryText}
          </p>
        </div>

        <div className="w-full max-w-sm rounded-[1.75rem] border border-emerald-400/20 bg-slate-950/65 p-5 shadow-lg shadow-black/10">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-500">NextusAI Puanı</p>
          <p className="mt-2 text-5xl font-black text-emerald-300 sm:text-6xl">{summary.scoreText}</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Risk {summary.riskText} • Piyasa eğilimi {summary.moodText}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Risk Seviyesi" value={summary.riskText} tone="text-amber-200" icon={<ShieldAlert size={16} />} />
        <SummaryCard label="Piyasa Eğilimi" value={summary.moodText} tone="text-cyan-200" icon={<TrendingUp size={16} />} />
        <SummaryCard label="Teorik Değer" value={summary.fairValueText} tone="text-emerald-200" icon={<Target size={16} />} />
        <SummaryCard label="Potansiyel" value={summary.potentialText} tone="text-violet-200" icon={<ArrowUpRight size={16} />} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-700/50 bg-slate-950/45 p-5 shadow-lg shadow-black/10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">En güçlü sinyal</p>
          <p className="mt-3 text-base leading-8 text-slate-100 sm:text-lg">
            {summary.strongestSignal}
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-700/50 bg-slate-950/45 p-5 shadow-lg shadow-black/10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">En büyük risk</p>
          <p className="mt-3 text-base leading-8 text-slate-100 sm:text-lg">
            {summary.biggestRisk}
          </p>
        </div>
      </div>
    </section>
  )
}

function SummaryCard({ label, value, tone, icon }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-700/50 bg-slate-950/45 p-5 shadow-lg shadow-black/10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        <span className={`inline-flex items-center justify-center rounded-full border border-current/20 bg-current/10 p-1 ${tone || "text-cyan-200"}`}>
          {icon}
        </span>
        {label}
      </div>
      <p className={`mt-4 text-base leading-8 ${tone || "text-cyan-100"}`}>
        {value}
      </p>
    </article>
  )
}