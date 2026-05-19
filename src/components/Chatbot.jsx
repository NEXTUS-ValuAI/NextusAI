import { useEffect, useRef, useState } from "react"
import { Send, MessageSquareMore, Sparkles, Mic, MicOff, Volume2, Square } from "lucide-react"
import { askChatbot, speakText, stopSpeech } from "../api/nextusApi"

export default function Chatbot({ symbol, accessibleMode = false }) {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [liveMessage, setLiveMessage] = useState("NextusAI chatbot hazır. Önerilen sorulardan birini seçebilirsiniz.")
  const [voiceStatus, setVoiceStatus] = useState("Sesli sohbet modu hazır. Türkçe erkek ses kullanılacak.")
  const [voiceListening, setVoiceListening] = useState(false)
  const [voiceSpeaking, setVoiceSpeaking] = useState(false)

  const recognitionRef = useRef(null)

  const quickPrompts = [
    "Bu şirket pahalı mı?",
    "En büyük risk ne?",
    "Rakiplerine göre nasıl?",
    "Skor neden böyle çıktı?",
  ]

  const supportsSpeechRecognition = typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  const stopVoiceOutput = async (message = "Sesli okuma durduruldu.") => {
    try {
      await stopSpeech()
    } catch {
      // noop
    }
    setVoiceSpeaking(false)
    setVoiceStatus(message)
  }

  const speakAnswer = async (text) => {
    if (!text) {
      return
    }

    setVoiceSpeaking(true)
    setVoiceStatus("Yanıt Türkçe erkek sesle okunuyor.")

    try {
      await speakText(text)
      setVoiceStatus("Sesli okuma tamamlandı.")
    } catch (error) {
      console.error(error)
      setVoiceStatus("Sesli okuma başlatılamadı. Sistem Türkçe erkek sesi bulunamadı.")
    } finally {
      setVoiceSpeaking(false)
    }
  }

  const stopVoiceListening = (message = "Sesli sohbet durduruldu.") => {
    try {
      recognitionRef.current?.abort()
    } catch {
      // noop
    }

    recognitionRef.current = null
    setVoiceListening(false)
    setVoiceStatus(message)
  }

  async function handleAsk(customQuestion) {
    const askedQuestion = (customQuestion ?? question).trim()
    if (!askedQuestion) return

    if (!symbol) {
      setLiveMessage("Önce analiz edilen bir hisse seçin.")
      setVoiceStatus("Önce bir hisse seçmeniz gerekiyor.")
      return
    }

    try {
      setLoading(true)
      setLiveMessage("Yanıt hazırlanıyor.")
      const result = await askChatbot(symbol, askedQuestion)
      setHistory((previousHistory) => [...previousHistory, { q: askedQuestion, a: result.answer }])
      setLiveMessage(`Yeni yanıt geldi: ${result.answer}`)
      if (accessibleMode) {
        await speakAnswer(result.answer)
      }
      setQuestion("")
    } catch (error) {
      console.error(error)
      setHistory((previousHistory) => [
        ...previousHistory,
        { q: askedQuestion, a: "Yanıt alınamadı. Lütfen tekrar deneyin." },
      ])
      setLiveMessage("Yanıt alınamadı. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  const startVoiceQuestion = () => {
    if (!accessibleMode) return

    const Recognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

    if (!Recognition) {
      setVoiceStatus("Bu tarayıcı sesli sohbet için mikrofon desteği sunmuyor.")
      return
    }

    if (voiceListening || loading) {
      return
    }

    const recognition = new Recognition()
    recognition.lang = "tr-TR"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setVoiceListening(true)
      setVoiceStatus("Dinliyorum. Sorunuzu Türkçe söyleyin.")
      setLiveMessage("Mikrofon açıldı.")
    }

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || ""

      if (!transcript) {
        setVoiceStatus("Ses algılanmadı.")
        return
      }

      setQuestion(transcript)
      setLiveMessage(`Sesle soruldu: ${transcript}`)
      stopVoiceListening("Soru algılandı. Yanıt hazırlanıyor.")
      handleAsk(transcript)
    }

    recognition.onerror = (event) => {
      setVoiceListening(false)

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceStatus("Mikrofon izni verilmedi.")
      } else if (event.error === "no-speech") {
        setVoiceStatus("Ses algılanmadı. Tekrar deneyebilirsiniz.")
      } else {
        setVoiceStatus("Sesli sohbet başlatılamadı.")
      }
    }

    recognition.onend = () => {
      setVoiceListening(false)
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setVoiceStatus("Sesli sohbet başlatılamadı. Tarayıcı izinlerini kontrol edin.")
    }
  }

  const repeatLastAnswer = async () => {
    const lastAnswer = history[history.length - 1]?.a

    if (!lastAnswer) {
      setVoiceStatus("Henüz sesli okunacak bir yanıt yok.")
      return
    }

    await speakAnswer(lastAnswer)
  }

  useEffect(() => {
    if (!accessibleMode) {
      stopVoiceListening("Sesli sohbet kapalı.")
      stopVoiceOutput("Sesli sohbet kapalı.")
    } else if (!supportsSpeechRecognition) {
      setVoiceStatus("Bu tarayıcı sesli sohbet için mikrofon desteği sunmuyor.")
    } else {
      setVoiceStatus("Sesli sohbet modu hazır. Türkçe erkek ses kullanılacak.")
    }

    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        // noop
      }

      stopSpeech().catch(() => {})
    }
  }, [accessibleMode])

  const handleSubmit = (event) => {
    event.preventDefault()
    handleAsk()
  }

  return (
    <section
      className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all mt-6 sm:mt-8 backdrop-blur-sm"
      role="region"
      aria-labelledby="chatbot-title"
      aria-describedby="chatbot-help"
      aria-busy={loading}
    >
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="chatbot-title" className="text-2xl font-black text-white sm:text-3xl">NextusAI Chatbot</h3>
          <p id="chatbot-help" className="mt-2 max-w-2xl text-sm text-slate-400">
            Analiz verisine bağlı, kısa ve açıklayıcı yanıtlar. Sorunu sor, gerekçeyi gör.
          </p>
        </div>

        <span className="inline-flex w-fit items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
          Bağlama duyarlı asistan
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Önerilen sorular">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleAsk(prompt)}
            type="button"
            disabled={loading || !symbol}
            aria-label={prompt}
            className="rounded-full border border-slate-700/60 bg-slate-950/35 px-3 py-2 text-left text-xs font-medium text-slate-300 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {accessibleMode && (
        <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Sesli sohbet</p>
              <h4 className="mt-2 text-lg font-bold text-white">Mikrofonla soru sor, yanıtı dinle</h4>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-950/55 px-3 py-2 text-xs font-semibold text-slate-300">
              {supportsSpeechRecognition ? <Mic size={14} className="text-cyan-200" /> : <MicOff size={14} className="text-amber-200" />}
              {supportsSpeechRecognition ? "Mikrofon hazır" : "Mikrofon desteği yok"}
            </span>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-200">
            {voiceStatus}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startVoiceQuestion}
              disabled={!supportsSpeechRecognition || voiceListening || loading}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic size={16} />
              Mikrofonla Sor
            </button>

            <button
              type="button"
              onClick={stopVoiceListening}
              disabled={!supportsSpeechRecognition || !voiceListening}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MicOff size={16} />
              Dinlemeyi Durdur
            </button>

            <button
              type="button"
              onClick={repeatLastAnswer}
              disabled={history.length === 0 || voiceSpeaking}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Volume2 size={16} />
              Son Yanıtı Sesli Oku
            </button>

            <button
              type="button"
              onClick={() => stopVoiceOutput()}
              disabled={!voiceSpeaking}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Square size={16} />
              Sesli Oku Durdur
            </button>
          </div>

          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {voiceStatus}
          </div>
        </div>
      )}

      <form className="flex flex-col gap-2 sm:flex-row sm:gap-3" onSubmit={handleSubmit}>
        <label htmlFor="chatbot-question" className="sr-only">
          NextusAI chatbot soru alanı
        </label>
        <input
          id="chatbot-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleAsk()
          }}
          placeholder="Bu şirketin en büyük riski ne?"
          aria-describedby="chatbot-help"
          aria-label="Chatbot soru alanı"
          className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base focus:border-emerald-500/50 focus:bg-slate-950/70 transition-all text-white placeholder-slate-500"
        />

        <button
          type="submit"
          disabled={loading || !question.trim()}
          aria-label={loading ? "Yanıt bekleniyor" : "Soruyu gönder"}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 whitespace-nowrap"
        >
          <Send size={18} />
          <span className="hidden sm:inline">{loading ? "Yanıt..." : "Sor"}</span>
          <span className="sm:hidden">{loading ? "..." : "Sor"}</span>
        </button>
      </form>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {history.length > 0 ? (
        <div className="mt-6 space-y-4" role="log" aria-live="polite" aria-relevant="additions text" aria-atomic="false" aria-label="Soru geçmişi">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            <MessageSquareMore size={14} className="text-cyan-300" />
            Mesaj Geçmişi
            <Sparkles size={13} className="text-emerald-300" />
          </div>

          {history.slice(-5).map((item, index) => (
            <div
              key={`${item.q}-${index}`}
              className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4 sm:p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-cyan-300">Soru</span>
              </div>
              <p className="text-sm font-medium text-white sm:text-base">{item.q}</p>

              <div className="mt-4 mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">Yanıt</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">{item.a}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs italic text-slate-400 sm:text-sm">
          Hisse analizi hakkında soru sorun - NextusAI veriye dayalı yanıt versin.
        </p>
      )}
    </section>
  )
}
