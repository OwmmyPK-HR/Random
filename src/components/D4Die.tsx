import { COLOR_THEME, type ColorName } from '../types'

/**
 * ลูกเต๋า d4 (ทรงพีระมิด 4 หน้า) สไตล์ D&D — ใช้แทนเบอร์ 1-4 ที่จับฉลากได้ต่อสี
 * spinning = กำลังหมุนสุ่ม (ระหว่างแอนิเมชัน), justSettled = เพิ่งหยุดนิ่ง (โชว์เอฟเฟกต์เด้ง+แสงวาบ)
 * ปล่อยทั้งสอง flag เป็น false เพื่อแสดงผลนิ่ง ๆ ไม่มีแอนิเมชัน (ใช้ตอนโชว์ผลสุดท้ายถาวร)
 */
export function D4Die({
  color,
  value,
  spinning = false,
  justSettled = false,
  reducedMotion = false,
}: {
  color: ColorName
  value: number
  spinning?: boolean
  justSettled?: boolean
  reducedMotion?: boolean
}) {
  const theme = COLOR_THEME[color]
  const gradId = `d4-grad-${color}`

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      {justSettled && !reducedMotion && (
        <span
          className="animate-ringBurst pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 3px ${theme.base}` }}
        />
      )}
      <div
        className={`relative h-16 w-16 ${
          spinning ? 'animate-diceTumble' : justSettled && !reducedMotion ? 'animate-settlePop' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
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
    </div>
  )
}
