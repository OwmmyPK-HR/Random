import { useEffect, useState } from 'react'
import { COLORS, type ColorName } from '../types'
import { usePrefersReducedMotion } from '../utils/useReducedMotion'
import { RollingDie3D } from './RollingDie3D'
import { DiceIcon } from './Icons'

const CYCLE_DURATION_MS = 8200
const SETTLE_HOLD_MS = 650
// เวลาที่แต่ละสีจะ "หยุด" ตามลำดับ (สัดส่วนของ CYCLE_DURATION_MS) — ทยอยหยุดทีละสีให้ลุ้นขึ้นเรื่อย ๆ แทนที่จะหยุดพร้อมกันหมดทีเดียว
const SETTLE_FRACTIONS = [0.42, 0.62, 0.8, 1]

/**
 * แอนิเมชันจับฉลากเบอร์ สไตล์ทอยลูกเต๋า D&D — ลูกเต๋า 3 มิติจริง (กล่อง 6 หน้าหมุนในพื้นที่ 3 มิติ ไม่ใช่ไอคอนแบนที่แค่บิดมุมมอง)
 * ของทั้ง 4 สีทอยหมุนพร้อมกัน (ไม่โชว์เลขระหว่างหมุน — ดูไม่ออกว่าจะได้เบอร์อะไรจนกว่าจะหยุดนิ่ง) แล้วทยอยหยุดนิ่งทีละสีเรียงตามลำดับ
 * บนพื้นหลังวงเวทมนตร์สไตล์ห้องใต้ดิน (ตั้งใจให้มืดเสมอ ไม่ขึ้นกับโหมดมืด/ขาว เหมือนแผงโปสเตอร์หน้าแรก — เพื่ออารมณ์ทอยเต๋าที่ตัดกับพื้นหลังปกติของหน้า)
 * (ผลจริงคำนวณไว้ล่วงหน้าแล้วก่อนเรียกคอมโพเนนต์นี้ — แอนิเมชันแค่สร้างความตื่นเต้นก่อนเผยผล)
 */
export function NumberDrawAnimation({
  finalAssignment,
  onDone,
}: {
  finalAssignment: Record<ColorName, number>
  onDone: () => void
}) {
  const reducedMotion = usePrefersReducedMotion()
  const [settledCount, setSettledCount] = useState(0)

  const allSettled = settledCount >= COLORS.length

  useEffect(() => {
    let cancelled = false
    const timeoutIds: number[] = []

    if (reducedMotion) {
      const t = window.setTimeout(() => {
        if (cancelled) return
        setSettledCount(COLORS.length)
        window.setTimeout(onDone, SETTLE_HOLD_MS)
      }, SETTLE_HOLD_MS)
      return () => {
        cancelled = true
        window.clearTimeout(t)
      }
    }

    COLORS.forEach((_, i) => {
      const id = window.setTimeout(
        () => {
          if (cancelled) return
          setSettledCount(i + 1)
          if (i === COLORS.length - 1) window.setTimeout(onDone, SETTLE_HOLD_MS)
        },
        CYCLE_DURATION_MS * SETTLE_FRACTIONS[i],
      )
      timeoutIds.push(id)
    })

    return () => {
      cancelled = true
      timeoutIds.forEach((id) => window.clearTimeout(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  return (
    <section className="relative flex flex-col items-center gap-7 overflow-hidden rounded-3xl border-2 border-gold-500/40 bg-gradient-to-b from-[#2b1810] via-[#1c1108] to-[#0e0906] px-6 py-14 shadow-pop">
      {/* วงเวทมนตร์หมุนรอบ ๆ พื้นหลัง — ล้วนตกแต่งอย่างเดียว ไม่ขวางการมองเห็น */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 animate-[spin_22s_linear_infinite] rounded-full border border-gold-400/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 animate-[spin_16s_linear_infinite_reverse] rounded-full border border-dashed border-gold-400/25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/10 blur-2xl" />
      {/* ประกายไฟลอย ๆ มุมการ์ด */}
      <span className="animate-floaty pointer-events-none absolute left-[12%] top-[18%] h-1.5 w-1.5 rounded-full bg-gold-300 shadow-[0_0_10px_3px] shadow-gold-300/60" />
      <span className="animate-floaty pointer-events-none absolute right-[15%] top-[28%] h-1 w-1 rounded-full bg-gold-300 shadow-[0_0_8px_2px] shadow-gold-300/60 [animation-delay:1s]" />
      <span className="animate-floaty pointer-events-none absolute bottom-[20%] left-[20%] h-1 w-1 rounded-full bg-gold-300 shadow-[0_0_8px_2px] shadow-gold-300/60 [animation-delay:2s]" />

      <span className="eyebrow relative inline-flex items-center gap-1.5 bg-gold-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#2b1810]">
        <DiceIcon size={12} className={allSettled || reducedMotion ? '' : 'animate-tumble'} />
        {allSettled ? '🎲 จับฉลากเบอร์เรียบร้อย!' : 'กำลังทอยลูกเต๋าจับฉลากเบอร์...'}
      </span>

      <div className="relative grid w-full max-w-lg grid-cols-2 gap-5 sm:grid-cols-4">
        {COLORS.map((c, i) => {
          const isSettled = i < settledCount
          return (
            <div key={c} className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-white/70">สี{c}</span>
              <RollingDie3D
                color={c}
                value={finalAssignment[c]}
                spinning={!isSettled}
                justSettled={isSettled}
                reducedMotion={reducedMotion}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
