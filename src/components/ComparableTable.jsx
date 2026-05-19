import { num, big } from "../utils/formatters"

export default function ComparableTable({ rows }) {
  return (
    <section className="mt-6 sm:mt-8 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-5 shadow-xl backdrop-blur-sm sm:rounded-3xl sm:p-6" aria-labelledby="comparable-table-title">
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
        <div>
          <h3 id="comparable-table-title" className="text-xl font-black text-white sm:text-2xl">Benzer Şirket Evreni</h3>
          <p className="mt-2 text-sm text-slate-400">Comparable grubunun medyan çarpanlarıyla fair value hesaplanır.</p>
        </div>

        <span className="rounded-full border border-slate-700/50 bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {rows?.length || 0} şirket
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <caption className="sr-only">
              Benzer şirketlerin F/K, PD/DD ve piyasa değeri karşılaştırması.
            </caption>
            <thead className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm">
              <tr className="border-b border-slate-800 text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">Sembol</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-6">Şirket</th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">F/K</th>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-6">PD/DD</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right sm:px-6">Değer</th>
              </tr>
            </thead>

            <tbody>
              {rows?.length ? (
                rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-800/70 transition hover:bg-cyan-500/5"
                  >
                    <td className="px-4 py-3 font-bold text-cyan-300 sm:px-6">
                      <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-cyan-200">
                        {row.symbol}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-300 sm:table-cell sm:px-6">
                      <div className="max-w-[24rem] truncate">{row.company_name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 sm:px-6">{num(row.pe_ratio)}</td>
                    <td className="px-4 py-3 text-slate-300 sm:px-6">{num(row.pb_ratio)}</td>
                    <td className="px-4 py-3 text-right text-slate-300 sm:px-6">{big(row.market_cap)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-500 sm:px-6" colSpan={5}>
                    Comparable verisi bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
        {rows?.length} şirketi analiz et • Medyan F/K ve PD/DD kullanılarak fair value hesaplanır
      </p>
    </section>
  )
}
