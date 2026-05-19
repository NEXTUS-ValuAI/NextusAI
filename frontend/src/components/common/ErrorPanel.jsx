import { AlertTriangle, ArrowRight, Brain, Search, Shield, Sparkles, TrendingUp, X } from "lucide-react"

export function ErrorPanel({ error, onClose, onRetry }) {
  const getSuggestion = (error) => {
    if (error.includes("bulunamadı")) {
      return "Sembol yazımını kontrol edin. Örn: ASELS, PATEK, AAPL"
    }
    if (error.includes("Bağlantı")) {
      return "Backend'in çalıştığından emin olun (localhost:8000)"
    }
    if (error.includes("Geçici")) {
      return "Birkaç saniye bekleyip tekrar deneyin"
    }
    return "Biraz sonra tekrar deneyebilirsiniz"
  }

  return (
    <div className="fade-in fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40" role="alertdialog" aria-modal="true" aria-labelledby="error-title" aria-describedby="error-desc">
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-md" role="document">
        <div className="flex justify-between items-start mb-4">
          <AlertTriangle size={32} className="text-red-400" />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300"
            aria-label="Hata penceresini kapat"
          >
            <X size={20} />
          </button>
        </div>

        <h2 id="error-title" className="text-2xl font-black mb-2 text-red-400">
          Hata Oluştu
        </h2>

        <p id="error-desc" className="text-slate-300 mb-4">
          {error}
        </p>

        <p className="text-sm text-slate-400 mb-6 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
          💡 {getSuggestion(error)}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition"
            aria-label="Tekrar dene"
          >
            Tekrar Dene
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition"
            aria-label="Kapat"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="relative flex min-h-96 items-center justify-center overflow-hidden py-20" role="region" aria-labelledby="empty-state-title" aria-describedby="empty-state-desc">
      <div className="absolute inset-0 -z-10 opacity-80">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="max-w-4xl text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 shadow-2xl shadow-cyan-500/10">
          <Search size={36} className="text-cyan-300" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          <Sparkles size={14} />
          Live market intelligence
        </div>

        <h2 id="empty-state-title" className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Hisse Senedini Analiz Et
        </h2>

        <p id="empty-state-desc" className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Bir ticker gir, canlı fiyat ile teorik değer arasındaki farkı gör, comparable grup üzerinden nedenini oku ve NEXTUS AI ile sonucu aç.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 text-left backdrop-blur-sm">
            <TrendingUp className="h-6 w-6 text-cyan-300" />
            <p className="mt-3 text-sm font-semibold text-white">Canlı fiyat</p>
            <p className="mt-1 text-sm text-slate-400">Yahoo Finance üzerinden anlık veri akışı.</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 text-left backdrop-blur-sm">
            <Brain className="h-6 w-6 text-indigo-300" />
            <p className="mt-3 text-sm font-semibold text-white">AI açıklaması</p>
            <p className="mt-1 text-sm text-slate-400">Skor ve rapor, ham veri yerine gerekçeyle gelir.</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 text-left backdrop-blur-sm">
            <Shield className="h-6 w-6 text-emerald-300" />
            <p className="mt-3 text-sm font-semibold text-white">Risk okuması</p>
            <p className="mt-1 text-sm text-slate-400">Borçluluk, beta ve sinyal katmanı birlikte değerlendirilir.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {["ASELS", "PATEK", "THYAO", "AAPL", "MSFT"].map((item) => (
            <span key={item} className="rounded-full border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300">
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
          <ArrowRight size={16} className="text-cyan-300" />
          Bir sembol gir ve analiz akışını başlat.
        </div>
      </div>
    </div>
  )
}
