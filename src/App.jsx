import { useEffect, useRef, useState } from "react"
import ErrorBoundary from "./components/common/ErrorBoundary"
import { Toast } from "./components/common/Toast"
import { LoadingSkeleton } from "./components/common/LoadingSkeleton"
import { ErrorPanel, EmptyState } from "./components/common/ErrorPanel"
import { AnalysisProvider, useAnalysis } from "./context/AnalysisContext"
import { useStockAnalysis } from "./hooks/useStockAnalysis"

import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import SearchPanel from "./components/SearchPanel"
import AnalysisHeader from "./components/AnalysisHeader"
import BigCard from "./components/BigCard"
import MetricCard from "./components/MetricCard"
import PriceChart from "./components/PriceChart"
import ScoreRadar from "./components/ScoreRadar"
import SignalPanel from "./components/SignalPanel"
import ComparableTable from "./components/ComparableTable"
import AIReport from "./components/AIReport"
import Chatbot from "./components/Chatbot"
import { ScoreBreakdown } from "./components/features/ScoreBreakdown"
import { PriceOverviewPanel } from "./components/features/PriceOverviewPanel"
import { ValuationModel } from "./components/features/ValuationModel"
import { TutorialModal } from "./components/common/TutorialModal"
import { AccessibleSummaryPanel } from "./components/accessibility/AccessibleSummaryPanel"
import { AccessibleVoiceSummary } from "./components/accessibility/AccessibleVoiceSummary"
import AccessibilityShortcutsPanel from "./components/accessibility/AccessibilityShortcutsPanel"
import VoiceCommandPanel from "./components/accessibility/VoiceCommandPanel"

import { money, num, percent, big } from "./utils/formatters"

const DEFAULT_A11Y_MODE = {
  accessibleMode: false,
}

function getInitialA11yMode() {
  if (typeof window === "undefined") {
    return DEFAULT_A11Y_MODE
  }

  try {
    const saved = window.localStorage.getItem("nextusai-a11y-mode")
    if (!saved) return DEFAULT_A11Y_MODE

    return {
      accessibleMode: Boolean(JSON.parse(saved)?.accessibleMode),
    }
  } catch {
    return DEFAULT_A11Y_MODE
  }
}

function AppContent() {
  const { symbol, setSymbol, data, loading, error, clearError, toast } = useAnalysis()
  const { analyzeStock } = useStockAnalysis()
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [announcement, setAnnouncement] = useState("NextusAI hazır. Bir hisse kodu girip analizi başlatabilirsiniz.")
  const [a11yMode, setA11yMode] = useState(getInitialA11yMode)
  const resultsRef = useRef(null)
  const isAccessibleMode = a11yMode.accessibleMode

  const scrollToSearch = () => {
    const searchPanel = document.getElementById("search-panel")
    if (!searchPanel) return

    searchPanel.scrollIntoView({ behavior: "smooth", block: "center" })
    setTimeout(() => {
      const input = searchPanel.querySelector("input")
      input?.focus()
    }, 300)
  }

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    resultsRef.current?.focus()
  }

  const triggerDomAction = (selector) => {
    const button = document.querySelector(selector)

    if (!button) {
      return false
    }

    button.click()
    return true
  }

  const handleVoiceAnalyze = async (voiceSymbol) => {
    const targetSymbol = voiceSymbol.trim().toUpperCase()
    if (!targetSymbol) return

    setSymbol(targetSymbol)
    setAnnouncement(`${targetSymbol} sesli komutla algılandı. Analiz başlatılıyor.`)
    await analyzeStock(targetSymbol)
  }

  const handleAnalyze = async () => {
    const targetSymbol = symbol.trim().toUpperCase()
    if (!targetSymbol) return

    setAnnouncement(`${targetSymbol} analizi başlatıldı. Sonuçlar hazırlanıyor.`)
    await analyzeStock(targetSymbol)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAnalyze()
    }
  }

  useEffect(() => {
    // Don't auto-load - wait for user to search
  }, [])

  useEffect(() => {
    if (loading) return

    if (data) {
      setAnnouncement(`${data.company_name} için analiz tamamlandı. Sonuçlar ekranda.`)
      resultsRef.current?.focus()
    }
  }, [loading, data])

  useEffect(() => {
    if (error) {
      setAnnouncement(`Hata oluştu: ${error}`)
    }
  }, [error])

  useEffect(() => {
    try {
      const persistedValue = JSON.stringify({ accessibleMode: a11yMode.accessibleMode })
      window.localStorage.setItem("nextusai-a11y-mode", persistedValue)
    } catch {
      // localStorage is optional; ignore write failures.
    }
  }, [a11yMode])

  useEffect(() => {
    const handleGlobalShortcut = (event) => {
      if (event.repeat || !event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === "x") {
        event.preventDefault()
        toggleAccessibleMode()
        return
      }

      if (!isAccessibleMode) {
        return
      }

      if (key === "s") {
        event.preventDefault()
        scrollToSearch()
        return
      }

      if (key === "a") {
        event.preventDefault()
        handleAnalyze()
        return
      }

      if (key === "v") {
        event.preventDefault()
        triggerDomAction('[data-voice-summary-action="speak"]')
        return
      }

      if (key === "c") {
        event.preventDefault()
        triggerDomAction('[data-voice-command-action="start"]')
        return
      }

      if (key === "r" && data) {
        event.preventDefault()
        scrollToResults()
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut)

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut)
    }
  }, [data, isAccessibleMode, handleAnalyze])

  const toggleAccessibleMode = () => {
    setA11yMode((previous) => {
      const nextValue = !previous.accessibleMode
      setAnnouncement(
        nextValue
          ? "Görme engelli modu açıldı. Arayüz sadeleştirildi ve kısayollar aktif edildi."
          : "Görme engelli modu kapatıldı."
      )
      return {
        accessibleMode: nextValue,
      }
    })
  }

  return (
    <div
      className={`min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 ${isAccessibleMode ? "a11y-accessible-mode" : ""}`}
    >
      <a
        href="#main-content"
        className="skip-link"
      >
        Ana içeriğe atla
      </a>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => null}
        />
      )}

      {error && (
        <ErrorPanel
          error={error}
          onClose={clearError}
          onRetry={handleAnalyze}
        />
      )}

      <main id="main-content" role="main" aria-busy={loading} aria-hidden={tutorialOpen} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Navbar
            a11yMode={a11yMode}
            onToggleAccessibleMode={toggleAccessibleMode}
          />
          {isAccessibleMode && (
            <section className="mt-8 rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-500/10 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Görme engelli modu</p>
                  <h2 className="mt-3 text-2xl font-black text-white sm:text-4xl">Sade arayüz aktif</h2>
                  <p className="mt-3 text-sm leading-8 text-slate-300 sm:text-base">
                    Dekoratif alanlar gizlenir, sesli okuma ve klavye kısayolları öne çıkar. Alt+Shift+X ile modu açıp kapatabilir, Alt+Shift+S ile aramaya gidebilir, Alt+Shift+A ile analizi başlatabilirsin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleAccessibleMode}
                  aria-pressed={isAccessibleMode}
                  aria-keyshortcuts="Alt+Shift+X"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
                >
                  {isAccessibleMode ? "Modu kapat" : "Modu aç"}
                </button>
              </div>
            </section>
          )}

          {!isAccessibleMode && !data && !loading && (
            <Hero
              onOpenTutorial={() => setTutorialOpen(true)}
              isTutorialOpen={tutorialOpen}
            />
          )}

          <SearchPanel
            symbol={symbol}
            setSymbol={setSymbol}
            analyzeStock={handleAnalyze}
            loading={loading}
            onKeyPress={handleKeyPress}
            accessibleMode={isAccessibleMode}
          />

          {isAccessibleMode && (
            <VoiceCommandPanel
              onVoiceAnalyze={handleVoiceAnalyze}
              accessibleMode={isAccessibleMode}
            />
          )}

          {isAccessibleMode && (
            <AccessibilityShortcutsPanel
              symbol={symbol}
              loading={loading}
              hasResults={Boolean(data)}
              onToggleAccessibleMode={toggleAccessibleMode}
              onFocusSearch={scrollToSearch}
              onAnalyze={handleAnalyze}
              onSpeakSummary={() => triggerDomAction('[data-voice-summary-action="speak"]')}
              onStartVoiceCommand={() => triggerDomAction('[data-voice-command-action="start"]')}
              onFocusResults={scrollToResults}
            />
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : isAccessibleMode ? (
            data ? (
              <div ref={resultsRef} tabIndex={-1} className="fade-in space-y-8 pb-12 outline-none">
                <AccessibleSummaryPanel data={data} />
                <AccessibleVoiceSummary data={data} />
                <PriceOverviewPanel data={data} />
                <Chatbot symbol={data.symbol} accessibleMode={isAccessibleMode} />
              </div>
            ) : (
              <section className="fade-in rounded-[2rem] border border-slate-700/50 bg-slate-950/60 p-6 shadow-2xl shadow-black/10 sm:p-8" aria-live="polite">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Hazır</p>
                <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">Bir hisse kodu gir ve analizi başlat</h3>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                  Arama alanına odaklanmak için Alt+Shift+S, analizi başlatmak için Alt+Shift+A, sesli komut için Alt+Shift+C kullanabilirsin.
                </p>
              </section>
            )
          ) : data ? (
            <div ref={resultsRef} tabIndex={-1} className="fade-in space-y-8 pb-12 outline-none">
              <AnalysisHeader data={data} />

              <AccessibleSummaryPanel data={data} />
              <AccessibleVoiceSummary data={data} />
              <PriceOverviewPanel data={data} />

              <section>
                <h3 className="text-lg font-bold text-slate-300 mb-4">Ana Metriker</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                  <BigCard title="NextusAI Puanı" value={`${data.valuai_score?.toFixed(1) || '-'}/100`} color="text-emerald-400" />
                  <BigCard title="Market Mood" value={data.market_mood || '-'} color="text-cyan-400" />
                  <BigCard title="Risk" value={data.risk_label || '-'} color="text-yellow-400" />
                  <BigCard title="Potansiyel" value={percent(data.potential)} color="text-purple-400" />
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-300 mb-4">Finansal Veriler</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <MetricCard title="Mevcut Fiyat" value={money(data.current_price, data.currency)} />
                  <MetricCard title="Teorik Değer" value={money(data.final_fair_value, data.currency)} />
                  <MetricCard title="Panel Sonucu" value={data.valuation_result} />
                  <MetricCard title="F/K" value={num(data.pe_ratio)} />
                  <MetricCard title="PD/DD" value={num(data.pb_ratio)} />
                  <MetricCard title="Forward F/K" value={num(data.forward_pe)} />
                  <MetricCard title="ROE" value={percent(data.roe * 100)} />
                  <MetricCard title="Kâr Marjı" value={percent(data.profit_margin * 100)} />
                  <MetricCard title="Gelir Büyümesi" value={percent(data.revenue_growth * 100)} />
                  <MetricCard title="Beta" value={num(data.beta)} />
                  <MetricCard title="Piyasa Değeri" value={big(data.market_cap)} />
                  <MetricCard title="Firma Değeri" value={big(data.enterprise_value)} />
                </div>
              </section>

              <section className="space-y-6">
                <ScoreBreakdown data={data} />
                <ValuationModel data={data} />
              </section>

              <section className="grid lg:grid-cols-2 gap-6">
                <PriceChart history={data.history} />
                <ScoreRadar data={data} />
              </section>

              <section className="grid lg:grid-cols-2 gap-6">
                <SignalPanel title="Güçlü Sinyaller" items={data.positive_signals} color="text-emerald-400" />
                <SignalPanel title="İzlenmesi Gerekenler" items={data.negative_signals} color="text-red-400" />
              </section>

              <ComparableTable rows={data.comparable_rows} />
              <AIReport report={data.ai_report} provider={data.ai_provider} />
              <Chatbot symbol={data.symbol} accessibleMode={isAccessibleMode} />

              <footer className="mt-12 pt-8 border-t border-slate-800/50 text-center text-slate-500 text-xs sm:text-sm">
                <p>⚠️ Bu platform yatırım tavsiyesi vermez. Eğitim ve analiz amacıyla geliştirilmiştir.</p>
                <p className="mt-3 font-semibold">© 2026 NextusAI by <span className="text-cyan-400">NEXTUS</span> • AI Powered Financial Analysis</p>
              </footer>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      <TutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AnalysisProvider>
        <AppContent />
      </AnalysisProvider>
    </ErrorBoundary>
  )
}
