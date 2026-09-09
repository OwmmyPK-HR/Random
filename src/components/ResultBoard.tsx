import { COLORS, COLOR_THEME, type ResultMap, type RosterEntry } from '../types'

function entryLabel(entry: RosterEntry): { main: string; sub?: string } {
  if (entry.teamName) {
    return { main: entry.teamName, sub: [entry.name1, entry.name2, entry.name3].filter(Boolean).join(' · ') }
  }
  const names = [entry.name1, entry.name2, entry.name3].filter(Boolean)
  return { main: names.join(' - ') }
}

export function ResultBoard({ result }: { result: ResultMap }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLORS.map((color, colIdx) => {
        const theme = COLOR_THEME[color]
        const entries = result[color]
        return (
          <div
            key={color}
            className="animate-popIn rounded-2xl border bg-white shadow-soft overflow-hidden"
            style={{ borderColor: theme.light, animationDelay: `${colIdx * 80}ms` }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: theme.light }}>
              <span className="font-bold" style={{ color: theme.dark }}>
                สี{color}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: theme.base }}
              >
                {entries.length} รายการ
              </span>
            </div>
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto scrollbar-thin">
              {entries.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-400">ไม่มีรายการ</li>}
              {entries.map((entry, i) => {
                const { main, sub } = entryLabel(entry)
                return (
                  <li key={entry.id} className="flex items-start gap-2 px-4 py-2 text-sm">
                    <span className="mt-0.5 shrink-0 text-xs font-semibold text-slate-400">{i + 1}.</span>
                    <span>
                      <span className="font-medium text-slate-800">{main}</span>
                      {sub && <span className="block text-xs text-slate-400">{sub}</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
