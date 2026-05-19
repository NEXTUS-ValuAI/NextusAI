import { ArrowUpRight, Sparkles, Shield, Target } from "lucide-react"
import { money, num } from "../utils/formatters"

function buildInsight(data) {
  const potential = Number(data?.potential ?? 0)
  const score = Number(data?.valuai_score ?? 0)
  const risk = data?.risk_label || "belirsiz"
  const mood = data?.market_mood || "nötr"

  if (potential >= 25 && score >= 70) {
    return `Model, piyasa fiyatına göre güçlü bir iskonto ve yüksek kalite profili gösteriyor. Risk etiketi ${risk}, market mood ${mood} olarak okunuyor.`
  }

  if (potential >= 10) {
    return `Comparable valuation ile fair value arasında anlamlı bir boşluk var. Karar, değerleme kadar kalite ve risk bileşenlerine de dayanıyor.`
  }

  if (potential <= -5) {
    return `Piyasa fiyatı teorik değerin üzerine çıkmış görünüyor. Burada ana soru, büyüme ve kalite verilerinin bu primi gerçekten hak edip etmediği.`
  }

  return `Fiyat ile model değeri birbirine yakın. Bu yüzden skor kırılımı, risk etiketi ve comparable grup ayrışması kritik hale geliyor.`
}

function StatPill({ label, value, tone = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-950/35 px-4 py-3 backdrop-blur-sm">
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  )
}

export default function AnalysisHeader({ data }) {
  if (!data) return null

  const currentPrice = Number(data.current_price)
  const fairValue = Number(data.final_fair_value)
  const hasGap = Number.isFinite(currentPrice) && Number.isFinite(fairValue) && currentPrice !== 0
  const gap = hasGap ? ((fairValue - currentPrice) / currentPrice) * 100 : null
  const gapPositive = gap !== null && gap >= 0

  const score = Number(data.valuai_score)

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-slate-900/80 p-6 shadow-2xl shadow-cyan-500/5 sm:p-8" role="region" aria-labelledby="analysis-header-title" aria-describedby="analysis-header-summary">
      <div className="absolute inset-0 -z-10 opacity-70">
        <div className="absolute right-[-6rem] top-[-6rem] h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-[-4rem] h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            <Sparkles size={14} />
            NextusAI canlı model
          </div>

          <div>
            <h2 id="analysis-header-title" className="text-3xl font-black tracking-tight text-white sm:text-5xl">{data.company_name}</h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              <span className="font-semibold text-cyan-300">{data.symbol}</span>
              <span className="mx-2">•</span>
              <span>{data.sector}</span>
              <span className="mx-2">•</span>
              <span>{data.industry}</span>
              <span className="mx-2">•</span>
              <span>{data.currency}</span>
            </p>
          </div>

          <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {buildInsight(data)}
          </p>

          <p id="analysis-header-summary" className="sr-only">
            {data.company_name} için analiz özeti. Mevcut fiyat {money(currentPrice, data.currency)}. Teorik değer {money(fairValue, data.currency)}. Potansiyel {gap === null ? "bilinmiyor" : `${gap > 0 ? "+" : ""}${gap.toFixed(1)}%`}. NextusAI Puanı {Number.isFinite(score) ? score.toFixed(1) : "bilinmiyor"} üzerinden hesaplandı.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Target size={13} />
              {data.valuation_result}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
              <Shield size={13} />
              {data.market_mood || "nötr"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              <ArrowUpRight size={13} />
              {data.risk_label || "risk"}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[28rem] lg:max-w-[32rem]">
          <div className="rounded-[1.5rem] border border-slate-700/50 bg-slate-950/45 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-500">Mevcut fiyat</p>
            <p className="mt-3 text-3xl font-black text-white">{money(currentPrice, data.currency)}</p>
            <p className="mt-2 text-sm text-slate-400">Teorik değer: {money(fairValue, data.currency)}</p>
          </div>

          <div className="rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-sm">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-cyan-200/80">Potansiyel</p>
            <p className={`mt-3 text-3xl font-black ${gapPositive ? "text-emerald-300" : "text-red-300"}`}>
              {gap === null ? "-" : `${gap > 0 ? "+" : ""}${gap.toFixed(1)}%`}
            </p>
            <p className="mt-2 text-sm text-slate-300">{gapPositive ? "İskonto bölgesi" : "Prim bölgesi"}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="NextusAI Puanı" value={`${Number.isFinite(score) ? score.toFixed(1) : "-"}/100`} tone="text-emerald-300" />
        <StatPill label="Market Mood" value={data.market_mood || "-"} tone="text-cyan-300" />
        <StatPill label="Risk Label" value={data.risk_label || "-"} tone="text-amber-300" />
        <StatPill label="Comparable Group" value={data.comparable_group_name || "-"} tone="text-violet-300" />
      </div>
    </section>
  )
}
