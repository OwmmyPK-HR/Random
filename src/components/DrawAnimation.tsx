import { useEffect, useRef, useState } from 'react'
import { COLORS, COLOR_THEME, type ColorName, type CompetitionMode, type RosterEntry } from '../types'
import { entryLabel } from '../utils/shuffle'
import { DiceIcon } from './Icons'

interface SlotValue {
  label: string
  color: ColorName
}

interface FinalSlots {
  a: SlotValue
  b?: SlotValue // ไม่มี = บาย
}

const CYCLE_DURATION_MS = 1700
const SETTLE_HOLD_MS = 550

function randomOf<T>(arr: T[]): T | undefined {
  return arr.length === 0 ? undefined : arr[Math.floor(Math.random() * arr.length)]
}

function randomSlots(mode: CompetitionMode, roster: RosterEntry[]): [SlotValue, SlotValue] {
  if (mode === 'colorTeam') {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5)
    return [
      { label: `สี${shuffled[0]}`, color: shuffled[0] },
      { label: `สี${shuffled[1]}`, color: shuffled[1] },
    ]
  }
  const fallback: SlotValue = { label: '?', color: 'ฟ้า' }
  const a = randomOf(roster)
  const b = randomOf(roster)
  return [a ? { label: entryLabel(a), color: a.color } : fallback, b ? { label: entryLabel(b), color: b.color } : fallback]
}

/**
 * แอนิเมชันแบบสล็อต — สุ่มโชว์ชื่อ/สีคู่แข่งขันสลับไปมาเร็ว ๆ แล้วค่อย ๆ ช้าลงจนหยุดที่ผลจริง
 * (ผลจริงคำนวณไว้ล่วงหน้าแล้วก่อนเรียกคอมโพเนนต์นี้ — แอนิเมชันแค่สร้างความตื่นเต้นก่อนเผยผล)
 */
export function DrawAnimation({
  mode,
  roster,
  finalSlots,
  onDone,
}: {
  mode: CompetitionMode
  roster: RosterEntry[]
  finalSlots?: FinalSlots
  onDone: () => void
}) {
  const [slots, setSlots] = useState<[SlotValue, SlotValue]>(() => randomSlots(mode, roster))
  const [settled, setSettled] = useState(false)
  const finalRef = useRef(finalSlots)
  finalRef.current = finalSlots

  useEffect(() => {
    let elapsed = 0
    let delay = 60
    let cancelled = false
    let timeoutId: number

    const step = () => {
      if (cancelled) return
      elapsed += delay
      if (elapsed >= CYCLE_DURATION_MS) {
        const target = finalRef.current
        setSlots([
          target?.a ?? randomSlots(mode, roster)[0],
          target?.b ?? { label: 'บาย · ผ่านเข้ารอบถัดไป', color: target?.a.color ?? 'ฟ้า' },
        ])
        setSettled(true)
        window.setTimeout(onDone, SETTLE_HOLD_MS)
        return
      }
      setSlots(randomSlots(mode, roster))
      delay = Math.min(delay * 1.16, 260)
      timeoutId = window.setTimeout(step, delay)
    }

    timeoutId = window.setTimeout(step, delay)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isBye = settled && !finalRef.current?.b

  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-accent/30 bg-accent/5 px-6 py-12">
      <span className="eyebrow inline-flex items-center gap-1.5 bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-accent-contrast">
        <DiceIcon size={12} className={settled ? '' : 'animate-tumble'} />
        {settled ? 'ได้คู่แข่งขันแล้ว!' : 'กำลังสุ่มจับคู่แข่งขัน...'}
      </span>

      <div className="flex w-full max-w-lg items-stretch gap-3">
        <Slot value={slots[0]} cycling={!settled} />
        <span className={`flex shrink-0 items-center text-base font-extrabold text-mist-500 ${settled ? 'animate-popIn' : ''}`}>
          VS
        </span>
        <Slot value={slots[1]} cycling={!settled} dim={isBye} />
      </div>
    </section>
  )
}

function Slot({ value, cycling, dim }: { value: SlotValue; cycling: boolean; dim?: boolean }) {
  const theme = COLOR_THEME[value.color]
  return (
    <div
      className={`flex min-h-[3.5rem] flex-1 items-center justify-center overflow-hidden rounded-xl px-3 py-3 text-center text-sm font-extrabold text-white transition-all ${
        cycling ? 'animate-pulseGlow' : 'animate-popIn'
      }`}
      style={
        dim
          ? { background: 'rgb(var(--surface-raised))', color: 'rgb(var(--mist-500))', boxShadow: 'none' }
          : { background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`, boxShadow: `0 0 26px ${theme.base}66` }
      }
    >
      <span className="truncate">{value.label}</span>
    </div>
  )
}
