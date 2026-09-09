import { COLORS, COLOR_THEME, type ResultMap, type RosterEntry } from '../types'
import { TrashIcon } from './Icons'

function entryLabel(entry: RosterEntry): { main: string; sub?: string } {
  if (entry.teamName) {
    return { main: entry.teamName, sub: [entry.name1, entry.name2, entry.name3].filter(Boolean).join(' · ') }
  }
  const names = [entry.name1, entry.name2, entry.name3].filter(Boolean)
  return { main: names.join(' - ') }
}

function initials(text: string): string {
  const t = text.trim()
  return t ? t[0] : '·'
}

export function ResultBoard({ result, onRemove }: { result: ResultMap; onRemove?: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLORS.map((color, colIdx) => {
        const theme = COLOR_THEME[color]
        const entries = result[color]
        return (
          <div
            key={color}
            className="animate-popIn overflow-hidden rounded-2xl border bg-surface-card shadow-soft"
            style={{ borderColor: `${theme.base}40`, animationDelay: `${colIdx * 90}ms` }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})` }}
            >
              <span className="font-extrabold text-white drop-shadow-sm">สี{color}</span>
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-extrabold text-white ring-1 ring-inset ring-white/25">
                {entries.length} รายการ
              </span>
            </div>
            <ul className="max-h-80 divide-y divide-surface-border overflow-y-auto scrollbar-thin">
              {entries.length === 0 && <li className="px-4 py-6 text-center text-sm text-mist-600">ไม่มีรายการ</li>}
              {entries.map((entry, i) => {
                const { main, sub } = entryLabel(entry)
                return (
                  <li key={entry.id} className="flex items-center gap-2.5 px-3.5 py-2 text-sm">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: theme.light, color: theme.dark }}
                    >
                      {initials(main)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-mist-100">{main}</span>
                      {sub && <span className="block truncate text-xs text-mist-500">{sub}</span>}
                    </span>
                    {onRemove ? (
                      <button
                        onClick={() => onRemove(entry.id)}
                        className="ml-auto shrink-0 text-mist-600 hover:text-rose-400"
                        aria-label="ลบรายการนี้"
                      >
                        <TrashIcon size={13} />
                      </button>
                    ) : (
                      <span className="ml-auto shrink-0 text-[11px] font-semibold text-mist-600">{i + 1}</span>
                    )}
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
