import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function ValuationModel({ data }) {
  const [expanded, setExpanded] = useState(false)

  const models = data.model_values || []
  const growthAdjustment = Number(data.growth_adjustment ?? 1)
  const riskAdjustment = Number(data.risk_adjustment ?? 1)
  const potential = Number(data.potential ?? 0)

  return (
    <div className="rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-6 shadow-xl backdrop-blur-sm" aria-labelledby="valuation-model-title">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-4 text-left transition hover:opacity-80"
      >
        <div>
          <h3 id="valuation-model-title" className="text-2xl font-black text-white">Değerleme Modelleri</h3>
          <p className="mt-2 text-sm text-slate-400">Üç modelin ağırlıklı birleşimi final değeri oluşturur.</p>
        </div>
        <ChevronDown size={24} className={`mt-1 shrink-0 text-cyan-400 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {models.length ? (
              models.map((model, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-100">{model.model}</span>
                    <span className="text-lg font-black text-emerald-300">
                      ${model.value?.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-800/80">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                      style={{ width: `${Math.min(Math.max((model.weight || 0) * 100, 0), 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Ağırlık: {((model.weight || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4 text-sm text-slate-400 lg:col-span-3">
                Model kırılımı henüz yüklenmedi.
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4">
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between gap-4">
                  <span>Baz Adil Değer</span>
                  <span className="font-bold text-cyan-300">${data.base_fair_value?.toFixed(2) || '-'}</span>
                </div>

                <div className="border-t border-slate-800/70 pt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>Büyüme Ayarlaması</span>
                    <span>{((growthAdjustment - 1) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>Risk Ayarlaması</span>
                    <span>{((riskAdjustment - 1) * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="border-t border-cyan-500/20 pt-3 flex justify-between font-bold text-cyan-300">
                  <span>Final Teorik Değer</span>
                  <span className="text-lg">${data.final_fair_value?.toFixed(2) || '-'}</span>
                </div>

                <div className="border-t border-slate-800/70 pt-3 flex justify-between text-slate-200">
                  <span>Mevcut Fiyat</span>
                  <span className="font-bold">${data.current_price?.toFixed(2) || '-'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-4">
              <div className="flex justify-between gap-4 text-sm text-slate-300">
                <span>Potansiyel</span>
                <span className="text-lg font-black text-emerald-300">
                  {potential > 0 ? '+' : ''}{potential.toFixed(1)}%
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sonuç</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  <span className="font-bold text-cyan-300">{data.valuation_result}</span>
                  <span className="mt-2 block text-slate-400">Bu çıktı yatırım tavsiyesi değil; değerleme motorunun ortak karar özeti.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
