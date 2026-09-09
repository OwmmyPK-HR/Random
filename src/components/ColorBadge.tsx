import { COLOR_THEME, type ColorName } from '../types'

export function ColorDot({ color, size = 10 }: { color: ColorName; size?: number }) {
  const theme = COLOR_THEME[color]
  return (
    <span
      className="inline-block shrink-0 rounded-full ring-2 ring-surface-card"
      style={{
        background: `radial-gradient(circle at 30% 28%, ${theme.soft}, ${theme.base})`,
        width: size,
        height: size,
        boxShadow: `0 0 8px ${theme.base}99`,
      }}
    />
  )
}

export function ColorBadge({ color, size = 'sm' }: { color: ColorName; size?: 'sm' | 'md' | 'lg' }) {
  const theme = COLOR_THEME[color]
  const sizing =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs gap-1.5' : size === 'md' ? 'px-3 py-1 text-sm gap-1.5' : 'px-3.5 py-1.5 text-sm gap-2'
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ring-1 ring-inset ${sizing}`}
      style={{ backgroundColor: theme.light, color: theme.dark, boxShadow: `inset 0 0 0 1px ${theme.base}55` }}
    >
      <ColorDot color={color} size={size === 'sm' ? 8 : size === 'md' ? 9 : 11} />
      สี{color}
    </span>
  )
}

/** ลูกแก้วมันวาว 3 มิติ — ไอคอนตัวแทนสีทีมขนาดใหญ่ ใช้บนการ์ดสรุปสี */
export function ColorOrb({ color, size = 44 }: { color: ColorName; size?: number }) {
  const theme = COLOR_THEME[color]
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 26%, #ffffff, ${theme.soft} 24%, ${theme.base} 62%, ${theme.base} 100%)`,
        boxShadow: `inset -${Math.max(3, size * 0.09)}px -${Math.max(4, size * 0.12)}px ${size * 0.22}px rgba(0,0,0,.22), inset 2px 3px 5px rgba(255,255,255,.6), 0 ${size * 0.14}px ${size * 0.3}px ${theme.base}4D`,
      }}
    />
  )
}

/** แถบสีเต็ม พร้อม glow — ใช้เป็นหัวการ์ด/ปุ่มเน้นสี พื้นหลังไล่เฉด */
export function ColorSolid({ color, className = '' }: { color: ColorName; className?: string }) {
  const theme = COLOR_THEME[color]
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`, boxShadow: `0 0 20px ${theme.base}55` }}
    >
      <ColorDot color={color} size={9} />
      สี{color}
    </span>
  )
}
