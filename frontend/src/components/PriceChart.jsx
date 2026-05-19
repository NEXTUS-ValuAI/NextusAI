import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

export default function PriceChart({ history }) {
  const chartData = history || []
  const lastPoint = chartData[chartData.length - 1]
  const firstPoint = chartData[0]
  const trend = firstPoint && lastPoint
    ? Number(lastPoint.close) >= Number(firstPoint.close)
      ? "yükselen"
      : "düşen"
    : "belirsiz"

  return (
    <section className="mt-6 sm:mt-8 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-5 shadow-xl backdrop-blur-sm sm:rounded-3xl sm:p-6" role="region" aria-labelledby="price-chart-title" aria-describedby="price-chart-summary">
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
        <div>
          <h3 id="price-chart-title" className="text-lg font-black text-white sm:text-2xl">5 Yıllık Fiyat Eğrisi</h3>
          <p className="mt-2 text-sm text-slate-400">Beş yıllık kapanış serisi ve başlangıca göre trend yönü.</p>
        </div>

        {lastPoint && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 px-4 py-2 text-right">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">Son kapanış</p>
            <p className="mt-1 text-lg font-black text-cyan-300">{Number(lastPoint.close).toFixed(2)}</p>
          </div>
        )}
      </div>

      <p id="price-chart-summary" className="sr-only">
        Grafik {chartData.length} veri noktasından oluşuyor. Son kapanış {lastPoint ? Number(lastPoint.close).toFixed(2) : "bilinmiyor"}. Beş yıllık başlangıca göre trend {trend}.
      </p>

      <div className="h-72 sm:h-80">
        <div aria-hidden="true" className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval={Math.max(Math.floor((chartData.length || 0) / 5), 1)}
            />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} width={56} />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: "14px",
                color: "white",
                boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              }}
              labelStyle={{ color: "#e2e8f0", fontWeight: 700 }}
              formatter={(value) => [Number(value).toFixed(2), "Kapanış"]}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#22d3ee"
              strokeWidth={2.5}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, stroke: "#22d3ee", strokeWidth: 2, fill: "#020617" }}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
