import { ArrowRight, Eye, Keyboard, Mic, Search, Volume2, Zap } from "lucide-react"

export default function AccessibilityShortcutsPanel({
  symbol,
  loading,
  hasResults,
  onToggleAccessibleMode,
  onFocusSearch,
  onAnalyze,
  onSpeakSummary,
  onStartVoiceCommand,
  onFocusResults,
}) {
  const shortcuts = [
    {
      key: "Alt+Shift+X",
      label: "Görme engelli modunu aç/kapat",
      description: "Arayüzü sadeleştirir ve erişilebilir bileşenleri öne çıkarır.",
      onClick: onToggleAccessibleMode,
      icon: <Eye size={14} />,
    },
    {
      key: "Alt+Shift+S",
      label: "Arama kutusuna git",
      description: "Hisse kodunu doğrudan giriş alanına taşır.",
      onClick: onFocusSearch,
      icon: <Search size={14} />,
    },
    {
      key: "Alt+Shift+A",
      label: "Analizi başlat",
      description: "Girdiğin hisse için değerlendirmeyi çalıştırır.",
      onClick: onAnalyze,
      icon: <Zap size={14} />,
      disabled: loading || !symbol?.trim(),
    },
    {
      key: "Alt+Shift+V",
      label: "Sesli özeti oku",
      description: "Analiz sonucunu Türkçe olarak seslendirir.",
      onClick: onSpeakSummary,
      icon: <Volume2 size={14} />,
      disabled: !hasResults,
    },
    {
      key: "Alt+Shift+C",
      label: "Sesli komutu başlat",
      description: "Mikrofonu açar ve Türkçe komut bekler.",
      onClick: onStartVoiceCommand,
      icon: <Mic size={14} />,
    },
    {
      key: "Alt+Shift+R",
      label: "Sonuçlara git",
      description: "Hazır sonuç bölümüne odaklanır.",
      onClick: onFocusResults,
      icon: <ArrowRight size={14} />,
      disabled: !hasResults,
    },
  ]

  return (
    <section className="mt-6 sm:mt-8 rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 p-6 shadow-2xl shadow-cyan-500/10 sm:p-8" aria-labelledby="accessibility-shortcuts-title">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100">
            <Keyboard size={12} />
            Klavye kısayolları
          </div>
          <h3 id="accessibility-shortcuts-title" className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Alt+Shift ile hızlı erişim
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
            Bu tuşlar görme engelli kullanıcılar için sade akış sağlar. İstersen butonlara tıklayarak da aynı işlemleri çalıştırabilirsin.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-950/55 px-4 py-2 text-xs font-semibold text-slate-300">
          Kısayollar açık
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.key}
            type="button"
            onClick={shortcut.onClick}
            disabled={shortcut.disabled}
            aria-keyshortcuts={shortcut.key}
            className="group rounded-[1.5rem] border border-slate-700/50 bg-slate-950/55 p-4 text-left shadow-lg shadow-black/10 transition hover:border-cyan-400/25 hover:bg-slate-950/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-slate-500">{shortcut.key}</p>
                <h4 className="mt-2 text-base font-bold text-white">{shortcut.label}</h4>
              </div>
              <span className="inline-flex items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-100">
                {shortcut.icon}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{shortcut.description}</p>
          </button>
        ))}
      </div>

      <p className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3 text-sm leading-7 text-cyan-100/90">
        {hasResults
          ? "Sonuçlar hazır olduğu için sesli özet ve sonuçlara git kısayolları aktif."
          : "Önce bir hisse kodu girip analizi başlat; sonra sesli özet ve sonuçlara git kısayolları kullanılabilir."}
      </p>
    </section>
  )
}
