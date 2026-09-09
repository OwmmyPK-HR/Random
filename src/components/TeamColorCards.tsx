import { COLORS, COLOR_THEME } from '../types'
import { ColorOrb } from './ColorBadge'

/** การ์ดสรุป 4 สีทีม พื้นพาสเทลอ่อน + ลูกแก้วมันวาว — ใช้เปิดหน้าให้เห็นภาพรวมทันที */
export function TeamColorCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {COLORS.map((c) => {
        const theme = COLOR_THEME[c]
        return (
          <div
            key={c}
            className="relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-4 shadow-soft"
            style={{ borderColor: `${theme.base}30`, backgroundColor: theme.light }}
          >
            <div
              className="pointer-events-none absolute -right-5 -top-6 h-20 w-20 rounded-full opacity-40"
              style={{ background: `radial-gradient(circle, ${theme.soft}, transparent 70%)` }}
            />
            <ColorOrb color={c} size={38} />
            <span className="relative text-base font-extrabold" style={{ color: theme.dark }}>
              สี{c}
            </span>
          </div>
        )
      })}
    </div>
  )
}
