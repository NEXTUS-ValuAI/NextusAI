import { TrendingUp, Sparkles, Eye, EyeOff } from "lucide-react"

export default function Navbar({ a11yMode, onToggleAccessibleMode }) {
  return (
    <header className="relative z-50 backdrop-blur-2xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border-b border-cyan-500/20 shadow-2xl shadow-cyan-500/10 mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        {/* Logo and brand */}
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <img
              src="/logo.png"
              className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-lg object-contain group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23%0620BDCA" width="100" height="100"/><text x="50" y="65" font-size="50" font-weight="bold" text-anchor="middle" fill="white">N</text></svg>'
              }}
              alt="NextusAI Logo"
            />
          </div>

          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                NextusAI
              </h1>
              <span className="text-xs sm:text-sm font-bold text-cyan-300 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 px-2.5 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
                <Sparkles size={12} />
                NEXTUS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Yapay Zeka Finansal Analiz
            </p>
          </div>
        </div>

        {/* Tech stack */}
        <div className="hidden lg:flex gap-4">
          <div className="text-right border-l border-slate-700/50 pl-4">
            <p className="text-xs text-slate-500 mb-1">Canlı Veri</p>
            <p className="text-sm font-bold text-cyan-400">Yahoo Finance</p>
          </div>
          <div className="text-right border-l border-slate-700/50 pl-4">
            <p className="text-xs text-slate-500 mb-1">AI Engine</p>
            <p className="text-sm font-bold text-indigo-400">NextusAI AI</p>
          </div>
          <div className="text-right border-l border-slate-700/50 pl-4">
            <p className="text-xs text-slate-500 mb-1">by</p>
            <p className="text-sm font-bold text-emerald-400">NEXTUS</p>
          </div>
        </div>

        {/* Version badge */}
        <div className="flex flex-col items-end gap-3 w-full xl:w-auto">
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 rounded-full text-xs font-bold text-cyan-300 shadow-lg shadow-cyan-500/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE / PRIVATE BETA
          </div>

          <div className="w-full rounded-[1.4rem] border border-cyan-500/20 bg-slate-950/55 p-3 shadow-xl shadow-black/10 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-200">
                  {a11yMode?.accessibleMode ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">Erişilebilirlik</p>
                  <p className="text-sm font-bold text-white">NextusAI Görme Engelli Modu</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleAccessibleMode}
                aria-pressed={a11yMode?.accessibleMode}
                aria-keyshortcuts="Alt+Shift+X"
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${a11yMode?.accessibleMode ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]" : "border-slate-700/70 bg-slate-900/60 text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200"}`}
              >
                {a11yMode?.accessibleMode ? "Açık" : "Kapalı"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 w-full opacity-50"></div>
    </header>
  )
}
