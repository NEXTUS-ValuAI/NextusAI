import { ArrowDownRight, ArrowUpRight, CalendarRange, Target, TrendingUp } from "lucide-react"
import { money } from "../../utils/formatters"

function formatSignedPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-"
  }

  const numericValue = Number(value)
  return `${numericValue >= 0 ? "+" : "-"}${Math.abs(numericValue).toFixed(1)}%`
}

function PriceStat({ label, value, helper, tone = "text-slate-100", icon }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-700/50 bg-slate-950/55 p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className={`mt-3 text-lg font-black sm:text-xl ${tone}`}>{value}</p>
        </div>

        {icon && <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-2 text-slate-300">{icon}</div>}
      </div>

      {helper && <p className="mt-3 text-sm leading-7 text-slate-400">{helper}</p>}
    </article>
  )
}

export function PriceOverviewPanel({ data }) {
  if (!data) return null

  const currency = data.currency
  const startPrice = data.price_5y_start_price
  const endPrice = data.price_5y_end_price ?? data.current_price
  const changePct = data.price_5y_change_pct
  const cagrPct = data.price_5y_cagr_pct
  const forecastPrice = data.next_year_price_estimate
  const forecastChangePct = data.next_year_change_pct

  const hasGrowthData = changePct !== null && changePct !== undefined && !Number.isNaN(Number(changePct))
  const hasForecastData = forecastChangePct !== null && forecastChangePct !== undefined && !Number.isNaN(Number(forecastChangePct))
  const growthDelta = hasGrowthData ? Number(changePct) : null
  const forecastDelta = hasForecastData ? Number(forecastChangePct) : null
  const growthDirectionUp = growthDelta !== null ? growthDelta > 0 : null
  const growthDirectionDown = growthDelta !== null ? growthDelta < 0 : null
  const forecastDirectionUp = forecastDelta !== null ? forecastDelta > 0 : null
  const forecastDirectionDown = forecastDelta !== null ? forecastDelta < 0 : null

  return (
    <section
      className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 p-6 shadow-2xl shadow-cyan-500/10 sm:p-8"
      role="region"
      aria-labelledby="price-overview-title"
      aria-describedby="price-overview-desc"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">
            <CalendarRange size={12} />
            Uzun vadeli fiyat görünümü
          </div>
          <h3 id="price-overview-title" className="mt-4 text-2xl font-black text-white sm:text-4xl">
            5 yıllık artış ve 1 yıllık tahmin
          </h3>
          <p id="price-overview-desc" className="mt-3 text-sm leading-8 text-slate-300 sm:text-base">
            Bu bölüm son 5 yıldaki fiyat değişimini, bileşik büyümeyi ve gelecek 12 ay için kaba fiyat projeksiyonunu ayrı bir özet halinde gösterir.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-950/55 px-4 py-2 text-xs font-semibold text-slate-300">
          <TrendingUp size={14} className="text-cyan-300" />
          5 yıl + 1 yıl görünüm
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <PriceStat
            label="5 Yıl Başlangıç"
            value={money(startPrice, currency)}
            helper="Beş yıl önceki kapanış fiyatı"
            tone="text-violet-100"
          />
          <PriceStat
            label="Bugünkü Fiyat"
            value={money(endPrice, currency)}
            helper="Son kapanış veya güncel fiyat"
            tone="text-cyan-100"
          />
          <PriceStat
            label="5 Yıllık Artış"
            value={formatSignedPercent(changePct)}
            helper={growthDirectionDown ? "Fiyat gerilemiş" : growthDirectionUp ? "Fiyat yükselmiş" : "Fiyat yatay"}
            tone={growthDirectionDown ? "text-red-100" : growthDirectionUp ? "text-emerald-100" : "text-slate-100"}
            icon={growthDirectionDown ? <ArrowDownRight size={18} /> : growthDirectionUp ? <ArrowUpRight size={18} /> : <TrendingUp size={18} />}
          />
          <PriceStat
            label="5Y CAGR"
            value={formatSignedPercent(cagrPct)}
            helper="Yıllık bileşik büyüme oranı"
            tone="text-amber-100"
            icon={<TrendingUp size={18} />}
          />
          <PriceStat
            label="1 Yıl Tahmin"
            value={money(forecastPrice, currency)}
            helper="5 yıllık eğilimden türetilen kaba projeksiyon"
            tone="text-emerald-100"
            icon={<Target size={18} />}
          />
          <PriceStat
            label="1 Yıl Değişim"
            value={formatSignedPercent(forecastChangePct)}
            helper={forecastDirectionDown ? "Tahmini baskı" : forecastDirectionUp ? "Tahmini artış" : "Tahmini yatay"}
            tone={forecastDirectionDown ? "text-red-100" : forecastDirectionUp ? "text-cyan-100" : "text-slate-100"}
          />
        </div>

        <aside className="rounded-[1.8rem] border border-slate-700/50 bg-slate-950/55 p-5 shadow-lg shadow-black/10">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Özet</p>
          <div className="mt-4 flex items-start gap-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-200">
              <CalendarRange size={22} />
            </div>
            <div>
              <p className="text-lg font-black text-white">5 yıllık fiyat hikayesi</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Fiyatın {money(startPrice, currency)} seviyesinden {money(endPrice, currency)} seviyesine nasıl geldiğini ve bu hareketin yıllık bileşik karşılığını aynı yerde görürsünüz.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-300">5 yıllık toplam değişim</span>
                <span className={`text-sm font-black ${growthDirectionDown ? "text-red-300" : growthDirectionUp ? "text-emerald-300" : "text-slate-300"}`}>
                  {formatSignedPercent(changePct)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-300">1 yıl tahmini fiyat</span>
                <span className="text-sm font-black text-cyan-300">{money(forecastPrice, currency)}</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Bu değer yatırım tavsiyesi değildir. 5 yıllık eğilim üzerinden oluşturulmuş kaba bir projeksiyondur.
              </p>
            </div>
          </div>

          <p className="sr-only">
            5 yıllık artış {formatSignedPercent(changePct)}. Gelecek 1 yıl tahmini {money(forecastPrice, currency)}.
          </p>
        </aside>
      </div>
    </section>
  )
}