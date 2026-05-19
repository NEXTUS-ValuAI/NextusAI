import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Loader2, Sparkles, AlertTriangle } from "lucide-react"
import { extractVoiceCommandSymbol } from "./summaryHelpers"

export default function VoiceCommandPanel({ onVoiceAnalyze, accessibleMode = false }) {
  const recognitionRef = useRef(null)
  const onVoiceAnalyzeRef = useRef(onVoiceAnalyze)
  const [supported, setSupported] = useState(true)
  const [listening, setListening] = useState(false)
  const [lastTranscript, setLastTranscript] = useState("")
  const [statusMessage, setStatusMessage] = useState(
    "Mikrofon izni gerektiğinde tarayıcı sizden onay isteyecek. Örnek komut: ASELS analiz et."
  )

  useEffect(() => {
    onVoiceAnalyzeRef.current = onVoiceAnalyze
  }, [onVoiceAnalyze])

  useEffect(() => {
    const Recognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

    if (!Recognition) {
      setSupported(false)
      setStatusMessage("Bu tarayıcı Web Speech API sesli komutlarını desteklemiyor. Komutu manuel yazabilirsiniz.")
      return undefined
    }

    const recognition = new Recognition()
    recognition.lang = "tr-TR"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setStatusMessage("Dinleme başladı. Lütfen komutu söyleyin.")
    }

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || ""
      setLastTranscript(transcript)

      const symbol = extractVoiceCommandSymbol(transcript)

      if (symbol) {
        setStatusMessage(`${symbol} komutu algılandı. Analiz başlatılıyor.`)
        onVoiceAnalyzeRef.current?.(symbol)
      } else {
        setStatusMessage(`Komut algılandı ama beklenen format bulunamadı: "${transcript}". Örnek: ASELS analiz et.`)
      }
    }

    recognition.onerror = (event) => {
      setListening(false)

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setStatusMessage("Mikrofon izni verilmedi. Tarayıcı izinlerinden mikrofonu açıp tekrar deneyin.")
      } else if (event.error === "no-speech") {
        setStatusMessage("Ses algılanmadı. Tekrar deneyebilirsiniz.")
      } else {
        setStatusMessage("Sesli komut çalıştırılamadı. Lütfen tekrar deneyin.")
      }
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.abort()
      } catch {
        // noop
      }

      recognitionRef.current = null
    }
  }, [])

  const startListening = () => {
    if (!supported || listening) return

    try {
      recognitionRef.current?.start()
      setStatusMessage("Mikrofon izni isteniyor. Lütfen onay verin.")
    } catch {
      setStatusMessage("Dinleme başlatılamadı. Tarayıcı izinlerini kontrol edin.")
    }
  }

  const stopListening = () => {
    try {
      recognitionRef.current?.stop()
    } catch {
      // noop
    }

    setListening(false)
    setStatusMessage("Sesli komut dinleme durduruldu.")
  }

  return (
    <section
      className={`mt-6 sm:mt-8 rounded-[2rem] border bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-6 shadow-2xl shadow-black/15 sm:p-8 ${accessibleMode ? "border-cyan-400/30 ring-2 ring-cyan-400/20 ring-offset-4 ring-offset-slate-950" : "border-cyan-500/20"}`}
      role="region"
      aria-labelledby="voice-command-title"
      aria-describedby="voice-command-help"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-amber-100">
            <Sparkles size={12} />
            Deneysel sesli komut
          </div>
          <h3 id="voice-command-title" className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Mikrofonla analiz başlat
          </h3>
          <p id="voice-command-help" className="mt-3 max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
            Mikrofon izni gerektiğinde tarayıcı sizden onay isteyecek. Türkçe komut örneği: “ASELS analiz et”.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-950/55 px-4 py-2 text-xs font-semibold text-slate-300">
          {supported ? <Mic size={14} className="text-cyan-200" /> : <AlertTriangle size={14} className="text-amber-200" />}
          {supported ? "Tarayıcı destekliyor" : "Sesli komut desteklenmiyor"}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-slate-700/50 bg-slate-950/55 p-5 shadow-lg shadow-black/10 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-500">Komut kontrolü</p>
              <h4 className="mt-2 text-lg font-bold text-white sm:text-xl">Dinleme ve komut çözümleme</h4>
            </div>

            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${listening ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-100" : "border-slate-700/50 bg-slate-900/60 text-slate-300"}`}>
              {listening ? <Loader2 size={12} className="animate-spin" /> : <MicOff size={12} />}
              {listening ? "Dinleniyor" : "Beklemede"}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-200">
            {statusMessage}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startListening}
              disabled={!supported || listening}
              aria-keyshortcuts="Alt+Shift+C"
              data-voice-command-action="start"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic size={16} />
              Dinlemeyi Başlat
            </button>

            <button
              type="button"
              onClick={stopListening}
              disabled={!supported || !listening}
              data-voice-command-action="stop"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MicOff size={16} />
              Dinlemeyi Durdur
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">Son algılanan komut</p>
            <p className="mt-3 text-sm leading-7 text-slate-100 sm:text-base">
              {lastTranscript || "Henüz komut algılanmadı."}
            </p>
          </div>

          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {statusMessage}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <CommandInfoCard label="Komut biçimi" value='"ASELS analiz et"' tone="text-cyan-200" />
          <CommandInfoCard label="Mikrofon" value="İzin gerekir" tone="text-amber-200" />
          <CommandInfoCard label="Destek" value={supported ? "Var" : "Yok"} tone="text-emerald-200" />
          <CommandInfoCard label="Durum" value={listening ? "Dinleme açık" : "Hazır"} tone="text-violet-200" />
        </div>
      </div>

      {!supported && (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-100">
          Tarayıcınız sesli komutu desteklemiyor. Bu kartı sunumda yine gösterebilirsiniz; kullanıcı metinle analiz başlatmaya devam eder.
        </div>
      )}
    </section>
  )
}

function CommandInfoCard({ label, value, tone }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-700/50 bg-slate-950/50 p-4 shadow-lg shadow-black/10">
      <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className={`mt-3 text-base font-semibold leading-8 ${tone || "text-slate-100"}`}>
        {value}
      </p>
    </article>
  )
}