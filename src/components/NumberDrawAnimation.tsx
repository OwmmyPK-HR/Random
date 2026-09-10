import { useEffect, useRef, useState } from 'react'
import { COLORS, COLOR_THEME, type ColorName } from '../types'
import { usePrefersReducedMotion } from '../utils/useReducedMotion'
import { DiceIcon } from './Icons'

const CYCLE_DURATION_MS = 4500
const SETTLE_HOLD_MS = 650
const SPIN_TICK_MS = 90
// เวลาที่แต่ละสีจะ "หยุด" ตามลำดับ (สัดส่วนของ CYCLE_DURATION_MS) — ทยอยหยุดทีละสีให้ลุ้นขึ้นเรื่อย ๆ แทนที่จะหยุดพร้อมกันหมดทีเดียว
const SETTLE_FRACTIONS = [0.42, 0.62, 0.8, 1]

function randomNumber(): number {
  return 1 + Math.floor(Math.random() * 4)
}

function randomDisplay(): Record<ColorName, number> {
  return Object.fromEntries(COLORS.map((c) => [c, randomNumber()])) as Record<ColorName, number>
}

/**
 * แอนิเมชันจับฉลากเบอร์ — ลูกแก้วมันวาว 4 สีหมุนตัวเลข 1-4 พร้อมกัน แล้วทยอยหยุดทีละสีเรียงตามลำดับ
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
  const [display, setDisplay] = useState<Record<ColorName, number>>(() => randomDisplay())
  const [settledCount, setSettledCount] = useState(0)
  const finalRef = useRef(finalAssignment)
  finalRef.current = finalAssignment

  const allSettled = settledCount >= COLORS.length

  useEffect(() => {
    let cancelled = false
    const timeoutIds: number[] = []
    let spinId: number | undefined
    const settledSoFar = { current: 0 }

    if (reducedMotion) {
      const t = window.setTimeout(() => {
        if (cancelled) return
        setDisplay(finalRef.current)
        setSettledCount(COLORS.length)
        window.setTimeout(onDone, SETTLE_HOLD_MS)
      }, SETTLE_HOLD_MS)
      return () => {
        cancelled = true
        window.clearTimeout(t)
      }
    }

    // หมุนตัวเลขสุ่มของสีที่ยังไม่หยุดไปเรื่อย ๆ
    spinId = window.setInterval(() => {
      if (cancelled) return
      setDisplay((prev) => {
        const next = { ...prev }
        for (let i = settledSoFar.current; i < COLORS.length; i++) next[COLORS[i]] = randomNumber()
        return next
      })
    }, SPIN_TICK_MS)

    COLORS.forEach((color, i) => {
      const id = window.setTimeout(
        () => {
          if (cancelled) return
          settledSoFar.current = i + 1
          setDisplay((prev) => ({ ...prev, [color]: finalRef.current[color] }))
          setSettledCount(i + 1)
          if (i === COLORS.length - 1) {
            window.clearInterval(spinId)
            window.setTimeout(onDone, SETTLE_HOLD_MS)
          }
        },
        CYCLE_DURATION_MS * SETTLE_FRACTIONS[i],
      )
      timeoutIds.push(id)
    })

    return () => {
      cancelled = true
      window.clearInterval(spinId)
      timeoutIds.forEach((id) => window.clearTimeout(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  return (
    <section className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-accent/30 bg-accent/5 px-6 py-12">
      <span className="eyebrow inline-flex items-center gap-1.5 bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-accent-contrast">
        <DiceIcon size={12} className={allSettled || reducedMotion ? '' : 'animate-tumble'} />
        {allSettled ? 'จับฉลากเบอร์เรียบร้อย!' : 'กำลังจับฉลากเบอร์...'}
      </span>

      <div className="grid w-full max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
        {COLORS.map((c, i) => {
          const theme = COLOR_THEME[c]
          const isSettled = i < settledCount
          return (
            <div key={c} className="flex flex-col items-center gap-2.5">
              <span className="text-xs font-bold text-mist-300">สี{c}</span>
              <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
                {isSettled && !reducedMotion && (
                  <span
                    className="animate-ringBurst pointer-events-none absolute inset-0 rounded-full"
                    style={{ boxShadow: `0 0 0 3px ${theme.base}` }}
                  />
                )}
                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white [font-variant-numeric:tabular-nums] ${
                    isSettled ? (reducedMotion ? '' : 'animate-settlePop') : 'animate-wobble'
                  }`}
                  style={{
                    background: `radial-gradient(circle at 32% 26%, #ffffff, ${theme.soft} 24%, ${theme.base} 62%, ${theme.base} 100%)`,
                    boxShadow: isSettled
                      ? `inset -3px -4px 8px rgba(0,0,0,.22), inset 2px 3px 5px rgba(255,255,255,.6), 0 8px 20px ${theme.base}55`
                      : `0 0 18px ${theme.base}55`,
                  }}
                >
                  {display[c]}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
