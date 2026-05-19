import { useEffect, useMemo, useState } from "react"
import { Repeat, Square, Volume2, Languages } from "lucide-react"
import { buildSummaryModel } from "./summaryHelpers"
import { speakText, stopSpeech } from "../../api/nextusApi"

export function AccessibleVoiceSummary({ data }) {
  const summary = useMemo(() => buildSummaryModel(data), [data])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [statusMessage, setStatusMessage] = useState(
    "Sesli özet hazır. Türkçe erkek sesle okunacak."
  )

  useEffect(() => {
    setIsSpeaking(false)
    setStatusMessage("Sesli özet hazır. Türkçe erkek sesle okunacak.")

    return () => undefined
  }, [summary.summaryText])

  const handleStopSpeech = async (message = "Sesli okuma durduruldu.") => {
    try {
      await stopSpeech()
    } catch {
      // noop
    }

    setIsSpeaking(false)
    setStatusMessage(message)
  }

  const speakSummary = async () => {
    try {
      setIsSpeaking(true)
      setStatusMessage("Yazı Türkçe erkek sesle okunuyor. Metin değiştirilmeden okunacak.")
      await speakText(summary.summaryText)
      setStatusMessage("Sesli okuma tamamlandı.")
    } catch (error) {
      console.error(error)
      setStatusMessage("Sesli okuma başlatılamadı. Sistem Türkçe erkek sesi bulunamadı.")
    } finally {
      setIsSpeaking(false)
    }
  }

  const repeatSpeech = async () => {
    await speakSummary()
  }

  if (!data) return null

  return (
    <section
      className="mt-6 sm:mt-8 rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/60 p-6 shadow-2xl shadow-violet-500/10 sm:p-8"
      role="region"
      aria-labelledby="voice-summary-title"
      aria-describedby="voice-summary-desc"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-violet-100">
            <Volume2 size={12} />
            Sesli analiz özeti
          </div>
          <h3 id="voice-summary-title" className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Analizi sesli dinle
          </h3>
          <p id="voice-summary-desc" className="mt-3 max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
            Bu bölüm ekran okuyucu deneyimini görünür hale getirir. Ekrandaki metin değişmeden okunur ve Türkçe erkek ses tercih edilir.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-950/55 px-4 py-2 text-xs font-semibold text-slate-300">
          <Languages size={14} className="text-violet-200" />
          Türkçe ses desteği
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.9rem] border border-slate-700/50 bg-slate-950/60 p-5 shadow-lg shadow-black/10 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-500">Okunacak metin</p>
              <h4 className="mt-2 text-lg font-bold text-white sm:text-xl">Sesli özetin tam metni</h4>
            </div>

            {isSpeaking && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Sesli okuma aktif
              </span>
            )}
          </div>

          <p className="mt-4 text-base leading-8 text-slate-100 sm:text-lg">
            {summary.summaryText}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={speakSummary}
              aria-keyshortcuts="Alt+Shift+V"
              data-voice-summary-action="speak"
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Volume2 size={16} />
              Analizi Sesli Oku
            </button>

            <button
              type="button"
              onClick={() => handleStopSpeech()}
              disabled={!isSpeaking}
              data-voice-summary-action="stop"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Square size={16} />
              Durdur
            </button>

            <button
              type="button"
              onClick={repeatSpeech}
              disabled={isSpeaking}
              data-voice-summary-action="repeat"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Repeat size={16} />
              Tekrar Oku
            </button>
          </div>

          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {statusMessage}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <VoiceMetricCard label="Şirket" value={summary.companyName} tone="text-violet-200" />
          <VoiceMetricCard label="Skor" value={summary.scoreText} tone="text-emerald-200" />
          <VoiceMetricCard label="Risk" value={summary.riskText} tone="text-amber-200" />
          <VoiceMetricCard label="Piyasa Eğilimi" value={summary.moodText} tone="text-cyan-200" />
        </div>
      </div>
    </section>
  )
}

function VoiceMetricCard({ label, value, tone }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-700/50 bg-slate-950/50 p-4 shadow-lg shadow-black/10">
      <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className={`mt-3 text-base leading-8 font-semibold ${tone || "text-slate-100"}`}>
        {value}
      </p>
    </article>
  )
}