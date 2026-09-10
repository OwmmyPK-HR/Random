import { Link } from 'react-router-dom'
import { COLORS } from '../types'
import { usePrefersReducedMotion } from '../utils/useReducedMotion'
import { RollingDie3D } from './RollingDie3D'
import { ChevronRightIcon } from './Icons'

/**
 * แผงโปรโมทฟีเจอร์ "จับฉลากเบอร์ประจำสี" ที่หน้าแรก — โชว์ลูกเต๋า 3 มิติ (CSS 3D transforms ควบคุมด้วย JavaScript
 * เหมือนตอนทอยจริง) ทอยวนไปเรื่อย ๆ ไม่มีวันหยุด ให้เห็นเอฟเฟกต์ก่อนกดเข้าไปลองเล่นจริง
 * (ค่าที่ใช้เป็นแค่ตัวโชว์ ไม่ผูกกับผลจับฉลากจริงในระบบ — เข้าไปกดจับฉลากจริงที่หน้า "จับฉลากเบอร์ประจำสี" ต่างหาก)
 */
export function DiceTeaser() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-gold-500/40 bg-gradient-to-b from-[#2b1810] via-[#1c1108] to-[#0e0906] p-6 shadow-pop sm:p-8">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 animate-[spin_24s_linear_infinite] rounded-full border border-gold-400/15" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/10 blur-2xl" />

      <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <span className="eyebrow inline-flex items-center gap-1.5 bg-gold-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#2b1810]">
            🎲 ฟีเจอร์ใหม่
          </span>
          <h2 className="mt-2.5 text-xl font-extrabold text-white sm:text-2xl">จับฉลากเบอร์ประจำสี สไตล์ทอยลูกเต๋า</h2>
          <p className="mt-1.5 max-w-sm text-sm text-white/70">
            ทอยลูกเต๋า 3 มิติสุ่มเบอร์ 1-4 ให้แต่ละสี ใช้จัดลำดับเดินขบวน พิธีเปิด หรือกิจกรรมอื่น ๆ ได้เลย
          </p>
          <Link
            to="/number-draw"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-bold text-[#2b1810] transition hover:-translate-y-0.5 hover:bg-gold-300"
          >
            ลองจับฉลากเลย <ChevronRightIcon size={15} />
          </Link>
        </div>

        <div className="grid shrink-0 grid-cols-4 gap-3 sm:gap-4">
          {COLORS.map((c, i) => (
            <RollingDie3D key={c} color={c} value={i + 1} spinning justSettled={false} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  )
}
