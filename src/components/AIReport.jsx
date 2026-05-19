export default function AIReport({ report, provider }) {
  const parseSections = (text) => {
    if (!text) return []

    const lines = text.split("\n")
    const sections = []
    let currentSection = null

    const headingPattern = /^\*{0,2}\s*(\d+)\.\s*(.*?)\s*\*{0,2}$/

    lines.forEach((line) => {
      const trimmed = line.trim()
      const match = trimmed.match(headingPattern)

      if (match) {
        if (currentSection) {
          sections.push(currentSection)
        }

        currentSection = {
          number: match[1],
          title: match[2],
          bodyLines: [],
        }
        return
      }

      if (!currentSection) {
        if (!trimmed) return
        currentSection = {
          number: "",
          title: "Rapor",
          bodyLines: [line],
        }
        return
      }

      currentSection.bodyLines.push(line)
    })

    if (currentSection) {
      sections.push(currentSection)
    }

    return sections.filter((section) => section.bodyLines.some((line) => line.trim()))
  }

  const renderRichText = (text) => {
    if (!text) return null

    const parts = text.split(/(\*\*.*?\*\*)/g)

    return parts.map((part, idx) => {
      if (/^\*\*.*\*\*$/.test(part)) {
        return (
          <span key={idx} className="font-semibold text-cyan-300">
            {part.replace(/^\*\*/g, "").replace(/\*\*$/g, "")}
          </span>
        )
      }

      return <span key={idx}>{part}</span>
    })
  }

  const sections = parseSections(report)

  return (
    <section className="mt-6 sm:mt-8 rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-5 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-cyan-500/10 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-black text-white sm:text-3xl">AI Finansal Analiz</h3>
          <p className="mt-2 text-sm text-slate-400">Markdown formatından ayrıştırılmış, bölüm bölüm okunabilir rapor.</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-cyan-300">
            NextusAI AI
          </span>
          <span className="rounded-full border border-slate-700/50 bg-slate-950/40 px-3 py-2 text-slate-300">
            {sections.length || 0} bölüm
          </span>
        </div>
      </div>

      {sections.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {sections.map((section, idx) => {
            const sectionLabel = section.number ? section.number.padStart(2, "0") : `${idx + 1}`.padStart(2, "0")
            const sectionTitle = section.title || "Analiz"
            const bodyText = section.bodyLines.join("\n").trim()

            return (
              <article
                key={`${sectionLabel}-${sectionTitle}`}
                className="rounded-[1.75rem] border border-slate-700/50 bg-slate-950/35 p-5 shadow-lg shadow-black/10 transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-500/30"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold tracking-[0.24em] text-cyan-300">
                      {sectionLabel}
                    </div>
                    <h4 className="mt-3 text-lg font-bold text-white">{sectionTitle}</h4>
                  </div>

                  <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {idx === 0 ? "Valuation" : idx === 1 ? "Risk" : "Verdict"}
                  </span>
                </div>

                <div className="space-y-4 whitespace-pre-wrap text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                  {renderRichText(bodyText)}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="text-slate-400">Rapor yükleniyor...</p>
      )}
    </section>
  )
}
