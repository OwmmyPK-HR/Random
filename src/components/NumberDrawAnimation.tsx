import { useEffect, useRef, useState } from 'react'
import { COLORS, COLOR_THEME, type ColorName } from '../types'
import { DiceIcon } from './Icons'

const CYCLE_DURATION_MS = 1500
const SETTLE_HOLD_MS = 550

function randomDisplay(): Record<ColorName, number> {
  return Object.fromEntries(COLORS.map((c) => [c, 1 + Math.floor(Math.random() * 4)])) as Record<ColorName, number>
}

/**
 * แอนิเมชันจับฉลากเบอร์ — เลข 1-4 ของทั้ง 4 สีสลับไปมาเร็ว ๆ พร้อมกันแล้วค่อย ๆ หยุดที่ผลจริง
 * (ผลจริงคำนวณไว้ล่วงหน้าแล้วก่อนเรียกคอมโพเนนต์นี้ — แอนิเมชันแค่สร้างความตื่นเต้นก่อนเผยผล)
 */
export function NumberDrawAnimation({
  finalAssignment,
  onDone,
}: {
  finalAssignment: Record<ColorName, number>
  onDone: () => void
}) {
  const [display, setDisplay] = useState<Record<ColorName, number>>(() => randomDisplay())
  const [settled, setSettled] = useState(false)
  const finalRef = useRef(finalAssignment)
  finalRef.current = finalAssignment

  useEffect(() => {
    let elapsed = 0
    let delay = 70
    let cancelled = false
    let timeoutId: number

    const step = () => {
      if (cancelled) return
      elapsed += delay
      if (elapsed >= CYCLE_DURATION_MS) {
        setDisplay(finalRef.current)
        setSettled(true)
        window.setTimeout(onDone, SETTLE_HOLD_MS)
        return
      }
      setDisplay(randomDisplay())
      delay = Math.min(delay * 1.15, 260)
      timeoutId = window.setTimeout(step, delay)
    }

    timeoutId = window.setTimeout(step, delay)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-accent/30 bg-accent/5 px-6 py-12">
      <span className="eyebrow inline-flex items-center gap-1.5 bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-accent-contrast">
        <DiceIcon size={12} className={settled ? '' : 'animate-tumble'} />
        {settled ? 'จับฉลากเบอร์เรียบร้อย!' : 'กำลังจับฉลากเบอร์...'}
      </span>

      <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {COLORS.map((c, i) => {
          const theme = COLOR_THEME[c]
          return (
            <div
              key={c}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 text-white transition-all ${
                settled ? 'animate-popIn' : 'animate-pulseGlow'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`,
                boxShadow: `0 0 26px ${theme.base}66`,
                animationDelay: settled ? `${i * 70}ms` : undefined,
              }}
            >
              <span className="text-xs font-bold">สี{c}</span>
              <span className="text-3xl font-extrabold [font-variant-numeric:tabular-nums]">{display[c]}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
