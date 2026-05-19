import { useEffect, useRef } from "react"
import { X, TrendingUp, Brain, Shield, Zap, MessageSquare } from "lucide-react"

export function TutorialModal({ isOpen, onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose?.()
        return
      }

      if (event.key !== "Tab") return

      const focusableSelectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ]

      const focusableElements = dialogRef.current?.querySelectorAll(focusableSelectors.join(",")) || []
      const focusables = Array.from(focusableElements)

      if (!focusables.length) return

      const firstFocusable = focusables[0]
      const lastFocusable = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div 
      id="tutorial-modal"
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-desc"
      ref={dialogRef}
      onClick={(e) => {
        if (e.target.id === "tutorial-modal") onClose?.()
      }}
    >
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl max-w-2xl max-h-96 overflow-y-auto shadow-2xl shadow-cyan-500/20" role="document">
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-cyan-500/20 p-6 flex justify-between items-center">
          <h2 id="tutorial-title" className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Nasıl Çalışır?
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition"
            aria-label="Rehber penceresini kapat"
            ref={closeButtonRef}
          >
            <X size={28} />
          </button>
        </div>

        <p id="tutorial-desc" className="sr-only">
          NextusAI nasıl kullanılır: hisse kodunu gir, analiz oluştur, skor ve raporu incele, chatbot ile soru sor, ardından pencereyi kapat.
        </p>

        <div className="p-8 space-y-8">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
                <TrendingUp size={24} className="text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">1. Hisse Kodunu Gir</h3>
              <p className="text-slate-400 leading-relaxed">
                Arama kutusuna analiz etmek istediğin hisse senedinin kodunu yaz. Türkiye'deki (ASELS, PATEK) veya uluslararası (AAPL, MSFT) kodlar desteklenir.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500/20 border border-indigo-500/40">
                <Brain size={24} className="text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">2. Analiz Yapılır</h3>
              <p className="text-slate-400 leading-relaxed">
                Platform canlı veriler (Yahoo Finance), comparable şirketler ve yapay zeka kullanarak detaylı analiz hazırlar. Bu işlem 2-3 saniye sürer.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                <Shield size={24} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">3. Sonuçları Görüntüle</h3>
              <p className="text-slate-400 leading-relaxed">
                NextusAI Puanı (0-100), adil fiyat, karşılaştırmalı metrikler, risk analizi ve açılır detaylı raporları göz önünde bulundur. Her şey açıklanabilir ve saydam.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/20 border border-purple-500/40">
                <Zap size={24} className="text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">4. Scoreları Analiz Et</h3>
                <p className="text-slate-400 leading-relaxed">
                5 faktör skoru göreceksin: Değerleme (30%), Kârlılık (25%), Büyüme (20%), Borçluluk (15%) ve Risk (10%). Her biri renkli ilerleme çubuğu ile gösterilir.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pink-500/20 border border-pink-500/40">
                <MessageSquare size={24} className="text-pink-400" />
              </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2">5. NextusAI Chatbot ile sorular sor</h3>
              <p className="text-slate-400 leading-relaxed">
                Raporun altında NextusAI Chatbot'a sorular sorabilirsin. "Neden 65 puan aldı?", "Benzer şirketler neler?" gibi soruları anında yanıtla.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h4 className="text-lg font-bold text-cyan-400 mb-4">🎯 Kilit Özellikler</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ Canlı market verilerine dayalı real-time analiz</li>
              <li>✅ Yapay zeka ile oluşturulan detaylı finansal raporlar</li>
              <li>✅ Comparable valuation ile sektörel karşılaştırma</li>
              <li>✅ 0-100 arası şeffaf scoring sistemi</li>
              <li>✅ Gelir, büyüme ve risk analizi</li>
              <li>✅ Etkileşimli sohbet desteği</li>
            </ul>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-xl p-6 text-center">
            <p className="text-slate-300 mb-4">Hemen bir hisse senedi analiz etmeye başlayabilirsin!</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all transform hover:scale-105"
            >
              Başlayalım 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
