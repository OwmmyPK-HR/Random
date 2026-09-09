import { COLORS, COLOR_THEME, type ColorName } from '../types'
import { ColorDot } from './ColorBadge'

/**
 * แท่งสัดส่วนสีแบบ stacked (thin mark, ปลายมน, เว้นช่องว่าง 2px ระหว่างส่วน)
 * พร้อม legend ระบุจำนวน/สัดส่วนของแต่ละสี — ใช้สรุปภาพรวมการกระจายตัวของสี
 */
export function ColorDistributionBar({ counts }: { counts: Record<ColorName, number> }) {
  const total = COLORS.reduce((sum, c) => sum + counts[c], 0)

  if (total === 0) {
    return (
      <div className="h-3 w-full rounded-full bg-surface-raised" />
    )
  }

  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-surface-raised">
        {COLORS.map((c) => {
          const pct = (counts[c] / total) * 100
          if (pct <= 0) return null
          const theme = COLOR_THEME[c]
          return (
            <div
              key={c}
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${theme.soft}, ${theme.base})` }}
              title={`สี${c}: ${counts[c]}`}
            />
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {COLORS.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-xs font-medium text-mist-400">
            <ColorDot color={c} size={8} />
            <span>สี{c}</span>
            <span className="font-bold text-mist-100">{counts[c].toLocaleString('th-TH')}</span>
            <span className="text-mist-600">({total ? Math.round((counts[c] / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
