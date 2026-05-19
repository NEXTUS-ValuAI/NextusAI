import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function ScoreBreakdown({ data }) {
  const [expanded, setExpanded] = useState(false)

  const scores = [
    { label: "Değerleme", value: data.valuation_score, weight: 30 },
    { label: "Kârlılık", value: data.profitability_score, weight: 25 },
    { label: "Büyüme", value: data.growth_score, weight: 20 },
    { label: "Borçluluk", value: data.debt_score, weight: 15 },
    { label: "Risk", value: data.risk_score, weight: 10 }
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 65) return "text-cyan-400"
    if (score >= 50) return "text-blue-400"
    if (score >= 35) return "text-yellow-400"
    return "text-red-400"
  }

  const getBarColor = (score) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 65) return "bg-cyan-500"
    if (score >= 50) return "bg-blue-500"
    if (score >= 35) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition group"
      >
        <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Skor Analizi</h3>
        <ChevronDown size={24} className={`text-cyan-400 transition-transform group-hover:scale-125 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-8 space-y-6 animate-in fade-in">
          {scores.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-xl ${getScoreColor(item.value)}`}>
                    {item.value.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">
                    {item.weight}% ağırlık
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden border border-slate-700/30">
                <div
                  className={`h-full ${getBarColor(item.value)} rounded-full transition-all duration-700 shadow-lg`}
                  style={{ width: `${Math.min(Math.max(item.value, 0), 100)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-slate-700/30">
            {data.valuai_score >= 80 && (
              <p className="text-slate-300 text-sm leading-6 font-medium">
                ✅ <span className="font-bold text-emerald-400">Güçlü Fundamentals</span> - Valuation açısından uygun görünüyor.
              </p>
            )}
            {data.valuai_score >= 65 && data.valuai_score < 80 && (
              <p className="text-slate-300 text-sm leading-6 font-medium">
                👍 <span className="font-bold text-cyan-400">Pozitif Göstergeler</span> - İzlemeye değer bir profil.
              </p>
            )}
            {data.valuai_score >= 50 && data.valuai_score < 65 && (
              <p className="text-slate-300 text-sm leading-6 font-medium">
                ⚖️ <span className="font-bold text-blue-400">Dengeli Profil</span> - Detaylı araştırma yapmalısınız.
              </p>
            )}
            {data.valuai_score >= 35 && data.valuai_score < 50 && (
              <p className="text-slate-300 text-sm leading-6 font-medium">
                ⚠️ <span className="font-bold text-yellow-400">Zayıf Göstergeler</span> - Dikkatli yaklaşın.
              </p>
            )}
            {data.valuai_score < 35 && (
              <p className="text-slate-300 text-sm leading-6 font-medium">
                🔴 <span className="font-bold text-red-400">Riskli Profil</span> - Derinlemesine analiz gerekli.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
