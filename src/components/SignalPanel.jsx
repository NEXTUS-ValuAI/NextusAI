export default function SignalPanel({ title, items, color }) {
  return (
    <section className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-5 shadow-xl backdrop-blur-sm sm:rounded-3xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <h3 className={`text-xl font-black sm:text-2xl ${color || "text-cyan-300"}`}>{title}</h3>
        <span className="rounded-full border border-slate-700/50 bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {items?.length || 0} madde
        </span>
      </div>

      <ul className="space-y-3 text-sm text-slate-300 sm:text-base">
        {items?.length ? (
          items.map((item, index) => (
            <li key={index} className="flex gap-3 rounded-xl border border-slate-700/40 bg-slate-950/35 px-3 py-3 leading-7">
              <span className={`mt-1 flex-shrink-0 ${color || "text-cyan-300"}`}>●</span>
              <span className="text-slate-300">{item}</span>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-slate-700/40 bg-slate-950/35 px-3 py-3 italic text-slate-500">Belirgin sinyal bulunamadı.</li>
        )}
      </ul>
    </section>
  )
}
