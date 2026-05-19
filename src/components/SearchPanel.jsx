import { Search, Zap } from "lucide-react"

export default function SearchPanel({
  symbol,
  setSymbol,
  analyzeStock,
  loading,
  onKeyPress,
  accessibleMode = false,
}) {
  return (
    <section
      id="search-panel"
      role="search"
      aria-labelledby="search-panel-title"
      className={`mt-12 mb-12 rounded-[2rem] ${accessibleMode ? "ring-2 ring-cyan-400/35 ring-offset-4 ring-offset-slate-950" : ""}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 id="search-panel-title" className="text-3xl sm:text-4xl font-bold mb-3">
            Hisse Senedini <span className="text-cyan-400">Analiz Et</span>
          </h2>
          <p id="search-panel-help" className="mx-auto max-w-2xl text-slate-400">
            Hisse kodunu gir, canlı fiyat ile model değeri arasındaki farkı gör ve NEXTUS AI ile gerekçesini aç.
          </p>
          {accessibleMode && (
            <p className="mx-auto mt-4 max-w-2xl rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm leading-7 text-cyan-100">
              Görme engelli modu açık. Alt+Shift+S ile aramaya odaklanabilir, Alt+Shift+A ile analizi başlatabilirsin.
            </p>
          )}
        </div>

        <div className={`bg-gradient-to-br from-slate-800/40 to-slate-900/40 border rounded-2xl p-8 backdrop-blur-sm ${accessibleMode ? "border-cyan-400/30 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]" : "border-slate-700/50"}`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 font-semibold text-cyan-300">Canlı veri</span>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 font-semibold text-indigo-300">Comparable grubu</span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300">Explainable AI</span>
            </div>
            <span className="text-slate-500">Bloomberg-style karar akışı</span>
          </div>

          {/* Search input */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <label htmlFor="stock-symbol" className="sr-only">Hisse kodu</label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                id="stock-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  onKeyPress?.(e)
                }}
                placeholder="Hisse kodunu gir (ASELS, AAPL, MSFT...)"
                aria-describedby="search-panel-help stock-symbol-help"
                aria-label="Hisse kodu"
                aria-keyshortcuts="Alt+Shift+S"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 outline-none text-lg text-white placeholder-slate-500 focus:border-cyan-500/50 focus:bg-slate-950/70 transition-all"
              />
              <p id="stock-symbol-help" className="sr-only">
                Örnek semboller: ASELS, PATEK, THYAO, AAPL, MSFT, NVDA. Enter tuşu ile analiz başlatabilirsiniz.
              </p>
            </div>

            <button
              onClick={analyzeStock}
              disabled={loading || !symbol.trim()}
              aria-label="Analizi başlat"
              aria-keyshortcuts="Alt+Shift+A"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transform hover:scale-105 disabled:hover:scale-100 whitespace-nowrap"
            >
              <Zap size={20} className="group-hover:rotate-12 transition-transform" />
              <span>{loading ? "Yükleniyor..." : "Analizi Başlat"}</span>
            </button>
          </div>

          {/* Quick select buttons */}
          <div>
            <label className="text-xs sm:text-sm text-slate-400 font-semibold block mb-3">
              Öne çıkan hisse kodları
            </label>
            <div className="flex gap-2 flex-wrap">
              {["ASELS", "PATEK", "THYAO", "AAPL", "MSFT", "NVDA"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setSymbol(item)}
                    disabled={loading}
                    aria-label={`${item} hisse kodunu seç`}
                    className="px-4 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
