import { COLOR_THEME, type ColorName } from '../types'

/** ไอคอนลูกเต๋า d4 (ทรงพีระมิด 4 หน้า) แบบนิ่ง — ใช้แสดงเบอร์ 1-4 ที่จับฉลากได้แล้วต่อสี (ไม่มีแอนิเมชัน) */
export function D4Die({ color, value }: { color: ColorName; value: number }) {
  const theme = COLOR_THEME[color]
  const gradId = `d4-grad-${color}`

  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-lg">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.soft} />
            <stop offset="100%" stopColor={theme.base} />
          </linearGradient>
        </defs>
        {/* หน้าเต๋ารูปสามเหลี่ยม (d4) + เส้นแบ่งหน้าให้ดูมีมิติ */}
        <polygon points="32,5 59,55 5,55" fill={`url(#${gradId})`} stroke={theme.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="32,5 32,55 5,55" fill="#ffffff" fillOpacity="0.15" />
        <line x1="32" y1="5" x2="32" y2="55" stroke={theme.dark} strokeWidth="1.5" strokeOpacity="0.45" />
      </svg>
      <span className="absolute inset-x-0 bottom-2.5 text-center text-lg font-extrabold text-white [font-variant-numeric:tabular-nums] drop-shadow-md">
        {value}
      </span>
    </div>
  )
}
