import { Brain, TrendingUp, Zap, Shield, ArrowRight, Sparkles } from "lucide-react"

export default function Hero({ onOpenTutorial, isTutorialOpen = false }) {
  const handleStartAnalysis = () => {
    const searchPanel = document.getElementById("search-panel")
    if (searchPanel) {
      searchPanel.scrollIntoView({ behavior: "smooth", block: "center" })
      setTimeout(() => {
        const input = searchPanel.querySelector("input")
        if (input) input.focus()
      }, 300)
    }
  }

  const handleHowItWorks = () => {
    onOpenTutorial?.()
  }

  return (
    <section className="relative overflow-hidden py-24 px-4 sm:px-8 mb-12">
      {/* Animated background circles */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top badge with animation */}
        <div className="flex justify-center mb-12">
          <div className="group inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 rounded-full px-6 py-3 backdrop-blur-sm hover:from-cyan-500/30 hover:to-indigo-500/30 transition-all duration-300 cursor-pointer">
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Canlı veri • Comparable valuation • Explainable AI</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Main headline with gradient */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight mb-6">
            <span className="block bg-gradient-to-r from-cyan-200 via-blue-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
              Hisse Senetlerini
            </span>
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
              Gerçekten Anlayın
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
            Canlı piyasa verisi, comparable valuation ve <span className="font-bold text-cyan-400">explainable AI scoring</span>'i <br className="hidden sm:block" />
            tek ekranda birleştirerek <span className="font-bold text-indigo-400">daha net yatırım kararları</span> alın. <br className="hidden sm:block" />
            <span className="mt-3 block text-base font-medium text-cyan-300">NEXTUS Chatbot ile sadece sonucu değil, sonucu doğuran gerekçeyi de görün.</span>
          </p>

          <div className="mx-auto mb-12 grid max-w-4xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 text-left backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">01</p>
              <p className="mt-2 text-sm font-semibold text-white">Ticker gir</p>
              <p className="mt-1 text-sm text-slate-400">Canlı fiyat ve emsal grup otomatik çekilir.</p>
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 text-left backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">02</p>
              <p className="mt-2 text-sm font-semibold text-white">Fair value gör</p>
              <p className="mt-1 text-sm text-slate-400">Model değeri, potansiyel ve skor kırılımı tek ekranda çıkar.</p>
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 text-left backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">03</p>
              <p className="mt-2 text-sm font-semibold text-white">NEXTUS Chatbot'a sor</p>
              <p className="mt-1 text-sm text-slate-400">Rakamı değil, nedenini açıkça oku.</p>
            </div>
          </div>

          {/* CTA Buttons with hover effects */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={handleStartAnalysis}
              type="button"
              className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              <span>Hemen Başla</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleHowItWorks}
              type="button"
              aria-haspopup="dialog"
              aria-controls="tutorial-modal"
              aria-expanded={isTutorialOpen}
              className="px-10 py-5 border-2 border-cyan-500/50 text-cyan-300 rounded-xl font-bold text-lg hover:bg-cyan-500/10 transition-all duration-300">
              Nasıl Çalışır?
            </button>
          </div>

          {/* Company badge */}
          <div className="flex justify-center mb-16">
            <div className="inline-block rounded-lg border border-slate-700/50 bg-slate-800/50 px-6 py-3 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Live market intelligence • <span className="font-bold text-cyan-400">NEXTUS</span></p>
            </div>
          </div>
        </div>

        {/* Features grid with cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 mb-20">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-cyan-400" />}
            title="Comparable Valuation"
            description="Emsal şirketlerle fiyat farkını, çarpanları ve değerleme boşluğunu görün."
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-indigo-400" />}
            title="AI Analiz"
            description="Raporu yalnızca üretmez, skor ve risk tarafında açıklanabilir hale getirir."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-emerald-400" />}
            title="Explainable Score"
            description="Değerleme, kârlılık, büyüme ve risk bileşenlerini şeffaf biçimde ayırır."
          />
        </div>

        {/* Stats section with impressive numbers */}
        <div className="border-t border-slate-700/50 pt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-200 mb-2">Platform Özellikleri</h2>
            <p className="text-slate-400">Canlı, açıklanabilir ve jüri önünde güven veren ürün akışı</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stat label="Market Feed" value="Yahoo Finance" icon="📊" />
            <Stat label="AI Stack" value="NextusAI AI" icon="🤖" />
            <Stat label="Skor Aralığı" value="0 - 100" icon="📈" />
            <Stat label="Low Latency" value="< 3 saniye" icon="⚡" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10">
      <div className="mb-5 p-4 bg-slate-900/50 rounded-xl group-hover:bg-slate-800 transition-colors w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function Stat({ label, value, icon }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-slate-700/30 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6 text-center transition-all hover:-translate-y-1 hover:border-cyan-500/30">
      <p className="text-4xl mb-3 group-hover:scale-125 transition-transform">{icon}</p>
      <p className="mb-2 text-sm uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">{value}</p>
    </div>
  )
}
