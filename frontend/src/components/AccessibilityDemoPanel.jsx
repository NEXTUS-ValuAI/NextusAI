import { ArrowRight, Eye, Keyboard, MessageSquare, CheckCircle2 } from "lucide-react"

export function AccessibilityDemoPanel({ symbol, loading, data, onJumpToSearch, onJumpToResults }) {
  const currentStage = data ? 4 : loading ? 3 : symbol ? 2 : 1

  const narration = data
    ? `${data.company_name} için analiz tamamlandı. Sonuçlar ekranda ve odağı sonuç bölümüne taşıyoruz.`
    : loading
      ? `${symbol || "Hisse"} analizi başlatıldı. Ekran okuyucu sonuçların hazırlanmasını duyuruyor.`
      : "Şimdi odağımız arama alanında. Hisse kodunu girip Enter ile analizi başlatıyoruz."

  const stageLabel = {
    1: "Başlangıç",
    2: "Arama",
    3: "Analiz",
    4: "Sonuç",
  }[currentStage]

  return (
    <section id="accessibility-demo-panel" className="mb-10 rounded-[2rem] border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-cyan-500/10 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-amber-100">
            <Eye size={12} />
            Görme engelli demo modu
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Erişilebilirlik ürünün bir parçası
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Bu panel, demo videosunda erişilebilir deneyimi görünür şekilde anlatmak için tasarlandı. Klavye ile kullanım, ekran okuyucu uyumu, sesli analiz özeti ve sesli komut desteğini aynı yerde gösterebilirsin.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4 shadow-lg shadow-black/20">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-500">Aktif aşama</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xl font-black text-amber-200">{stageLabel}</p>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              {data ? "Sonuç hazır" : loading ? "Analiz sürüyor" : "Başlangıç"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {narration}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onJumpToSearch}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              <Keyboard size={14} />
              Arama alanına git
            </button>
            {data && (
              <button
                type="button"
                onClick={onJumpToResults}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                <ArrowRight size={14} />
                Sonuçlara git
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DemoStep
          index="01"
          title="Ana içeriğe atla"
          text="Ekran okuyucu, uzun dekoratif alanları atlayıp doğrudan işleme geçer."
        />
        <DemoStep
          index="02"
          title="Hisse kodunu yaz"
          text="ASELS, AAPL ya da MSFT gibi semboller giriş alanına girilir."
        />
        <DemoStep
          index="03"
          title="Enter ile analiz başlat"
          text="İşlem başladığında 'sonuçlar hazırlanıyor' mesajı sesli olarak duyurulur."
        />
        <DemoStep
          index="04"
          title="Sonucu dinle"
          text="Skorlar, fiyat farkı ve chatbot yanıtları okunur; gerekirse sonuç bölümüne odak taşınır."
        />
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-slate-700/50 bg-slate-950/45 p-5 shadow-lg shadow-black/10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          <CheckCircle2 size={14} className="text-emerald-300" />
          Videoda göstereceğin görünür özellikler
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            "Klavye ile kullanım",
            "Ekran okuyucu uyumu",
            "Sesli analiz özeti",
            "Grafiklerin metinsel açıklaması",
            "Yüksek kontrast modu",
            "Sesli komut deneysel desteği",
          ].map((item) => (
            <li key={item} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 px-4 py-3 text-sm font-medium text-slate-200">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-500/5 px-4 py-3 text-sm leading-7 text-amber-100/90">
        Sunum notu: Bu kart, görme engelli kullanıcı deneyimini ekranda görünür hale getirir. Videoda “şimdi arama alanındayız, şimdi sonuçlara geçtik” diye anlatabileceğin bölüm burası.
      </p>
    </section>
  )
}

function DemoStep({ index, title, text }) {
  return (
    <article className="rounded-2xl border border-slate-700/50 bg-slate-950/50 p-4 transition hover:border-amber-400/25 hover:bg-slate-950/70">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-slate-500">{index}</p>
      <h3 className="mt-2 text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
    </article>
  )
}