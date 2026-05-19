import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function ScoreRadar({ data }) {
  const radarData = [
    { subject: "Değerleme", value: data.valuation_score },
    { subject: "Kârlılık", value: data.profitability_score },
    { subject: "Büyüme", value: data.growth_score },
    { subject: "Borçluluk", value: data.debt_score },
    { subject: "Risk", value: data.risk_score },
  ]
  const strongestFactor = radarData.reduce((best, item) => (Number(item.value) > Number(best.value) ? item : best), radarData[0])
  const weakestFactor = radarData.reduce((worst, item) => (Number(item.value) < Number(worst.value) ? item : worst), radarData[0])

  return (
    <section className="mt-6 sm:mt-8 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-5 shadow-xl backdrop-blur-sm sm:rounded-3xl sm:p-6" role="region" aria-labelledby="score-radar-title" aria-describedby="score-radar-summary">
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
        <div>
          <h3 id="score-radar-title" className="text-lg font-black text-white sm:text-2xl">Skor Profili</h3>
          <p className="mt-2 text-sm text-slate-400">0-100 normalize edilmiş 5 faktörlü görünüm.</p>
        </div>

        <span className="rounded-full border border-slate-700/50 bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Explainable score
        </span>
      </div>

      <p id="score-radar-summary" className="sr-only">
        Grafik beş boyut içeriyor. En güçlü alan {strongestFactor?.subject} ve skoru {Number(strongestFactor?.value || 0).toFixed(1)}. En zayıf alan {weakestFactor?.subject} ve skoru {Number(weakestFactor?.value || 0).toFixed(1)}.
      </p>

      <div className="h-72 sm:h-80">
        <div aria-hidden="true" className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="70%">
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: "14px",
                color: "white",
                boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              }}
              formatter={(value, name) => [Number(value).toFixed(1), name]}
            />
            <Radar
              name="Skor"
              dataKey="value"
              stroke="#67e8f9"
              fill="url(#radarGradient)"
              fillOpacity={1}
              strokeWidth={2.5}
              dot={{ fill: "#67e8f9", r: 3 }}
              isAnimationActive={true}
            />
          </RadarChart>
        </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 sm:text-sm">
        Değerleme, kârlılık, büyüme, borçluluk ve risk boyutları normalize edilmiştir.
      </p>
    </section>
  )
}
