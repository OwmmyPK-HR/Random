import { useCallback, useEffect, useState } from 'react'
import { hasSeenTour, markTourSeen } from '../utils/tourSeen'
import { usePrefersReducedMotion } from '../utils/useReducedMotion'
import { CloseIcon, HelpIcon } from './Icons'

export interface TourStep {
  /** ต้องตรงกับ data-tour ของ element เป้าหมายในหน้านั้น ๆ */
  target: string
  title: string
  body: string
}

export interface TourController {
  active: boolean
  stepIndex: number
  steps: TourStep[]
  reducedMotion: boolean
  start: () => void
  next: () => void
  skip: () => void
}

/**
 * ทัวร์สอนใช้งานแบบสปอตไลท์ (โทนเทา) — ไล่ไฮไลต์ทีละจุดพร้อมคำอธิบายสั้น ๆ ว่ากดตรงไหน/ทำงานยังไง
 * เด้งอัตโนมัติครั้งแรกที่เข้าหน้านั้น (จำไว้ต่อเครื่อง/เบราว์เซอร์ ไม่เด้งซ้ำ) และกดปุ่ม "?" เรียกดูซ้ำเองได้เสมอ
 */
export function useTour(pageKey: string, steps: TourStep[]): TourController {
  const reducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    // ปุ่ม "?" อยู่ที่แถบบนจุดเดียว ใช้ hook เดียวกันตลอดอายุแอป (ไม่ได้ mount ใหม่ทุกหน้า) — พอเปลี่ยนหน้า
    // ต้องรีเซ็ตสถานะทัวร์ของหน้าเดิมทิ้งก่อนเสมอ ไม่งั้น stepIndex ที่ค้างไว้จะเพี้ยนไปเทียบกับขั้นตอนของหน้าใหม่
    setActive(false)
    setStepIndex(0)
    if (steps.length === 0 || hasSeenTour(pageKey)) return
    const t = window.setTimeout(() => setActive(true), 500)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey])

  const stop = useCallback(() => {
    setActive(false)
    markTourSeen(pageKey)
  }, [pageKey])

  const start = useCallback(() => {
    setStepIndex(0)
    setActive(true)
  }, [])

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= steps.length) {
        stop()
        return i
      }
      return i + 1
    })
  }, [steps.length, stop])

  return { active, stepIndex, steps, reducedMotion, start, next, skip: stop }
}

/** ปุ่มวงกลม "?" ที่แถบบน — เรียกทัวร์สอนใช้งานของหน้าปัจจุบันซ้ำได้ทุกเมื่อ (ไม่โชว์ถ้าหน้านั้นไม่มีทัวร์) */
export function TourButton({ tour, className = '' }: { tour: TourController; className?: string }) {
  if (tour.steps.length === 0) return null
  return (
    <button
      onClick={tour.start}
      className={`no-print flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border text-mist-300 transition-colors hover:border-accent/50 hover:text-accent-soft ${className}`}
      aria-label="ดูวิธีใช้งานหน้านี้"
      title="วิธีใช้งานหน้านี้"
    >
      <HelpIcon size={17} />
    </button>
  )
}

const TOOLTIP_WIDTH = 300
const MARGIN = 14
const SPOTLIGHT_PAD = 8
// ความสูงโดยประมาณขั้นต่ำที่กล่องคำอธิบายต้องใช้ — ใช้ตัดสินใจว่าพอมีที่ว่างเหนือ/ใต้จุดไฮไลต์ให้วางไหม
const TOOLTIP_MIN_SPACE = 190

export interface TooltipPosition {
  top?: number
  bottom?: number
  transform?: string
}

/**
 * หาตำแหน่งวางกล่องคำอธิบาย (เหนือ/ใต้จุดไฮไลต์ หรือลอยกลางจอถ้าไม่มีที่ว่างพอ) โดย "หนีบ" ขอบของจุดไฮไลต์ไว้ในจอก่อนคำนวณเสมอ
 * — จุดไฮไลต์บางจุด (เช่นกริดการ์ดทั้งบล็อก) อาจสูงเกินจอ ทำให้ rect.top ติดลบ หรือ rect.bottom เลยขอบจอไปได้
 * ถ้าใช้ค่าดิบตรง ๆ กล่องคำอธิบายจะคำนวณตำแหน่งหลุดออกนอกจอไปทั้งกล่องโดยไม่รู้ตัว
 */
export function computeTooltipPosition(rect: { top: number; bottom: number }, viewportHeight: number): TooltipPosition {
  // หนีบทั้งขอบบนและล่างไว้ในช่วง [0, viewportHeight] เสมอ (ไม่ใช่แค่ขอบเดียว) กันกรณีเป้าหมายยังไม่ได้เลื่อนเข้าจอเลย
  // (เช่น rect.top เป็นค่าบวกมาก ๆ) ไม่งั้น "พื้นที่ว่าง" ที่คำนวณได้จะเพี้ยนจนตำแหน่งกล่องคำอธิบายหลุดจอไปได้เหมือนกัน
  const visibleTop = Math.min(Math.max(rect.top, 0), viewportHeight)
  const visibleBottom = Math.min(Math.max(rect.bottom, 0), viewportHeight)
  const spaceBelow = viewportHeight - visibleBottom
  const spaceAbove = visibleTop

  if (spaceBelow >= TOOLTIP_MIN_SPACE) return { top: visibleBottom + MARGIN }
  if (spaceAbove >= TOOLTIP_MIN_SPACE) return { bottom: viewportHeight - visibleTop + MARGIN }
  // จุดไฮไลต์ใหญ่จนเต็มจอ ไม่มีที่ว่างพอทั้งบนและล่าง — ลอยกล่องคำอธิบายไว้กลางจอแทน ยังมองเห็นแน่นอนไม่ว่าจุดจะใหญ่แค่ไหน
  return { top: viewportHeight / 2, transform: 'translateY(-50%)' }
}

/** ตัวสปอตไลท์ + กล่องคำอธิบาย — เรนเดอร์ไว้ครั้งเดียวนอกสุดของหน้า (ไม่ต้องกังวลเรื่อง z-index ซ้อนกับเนื้อหาอื่น) */
export function TourOverlay({ tour }: { tour: TourController }) {
  const { active, stepIndex, steps, reducedMotion, next, skip } = tour
  const [rect, setRect] = useState<DOMRect | null>(null)
  const step = steps[stepIndex]

  useEffect(() => {
    if (!active || !step) {
      setRect(null)
      return
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    if (!el) {
      // หา element เป้าหมายไม่เจอ (เช่น ยังไม่มีข้อมูล/ผลลัพธ์ให้แสดง) — ข้ามขั้นตอนนี้ไปเลย
      next()
      return
    }
    el.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
    const measure = () => setRect(el.getBoundingClientRect())
    const t = window.setTimeout(measure, reducedMotion ? 30 : 380)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip()
      if (e.key === 'Enter' || e.key === ' ') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, skip, next])

  if (!active || !step || !rect) return null

  const isLast = stepIndex === steps.length - 1
  const top = rect.top - SPOTLIGHT_PAD
  const left = rect.left - SPOTLIGHT_PAD
  const width = rect.width + SPOTLIGHT_PAD * 2
  const height = rect.height + SPOTLIGHT_PAD * 2

  const tooltipPosition = computeTooltipPosition(rect, window.innerHeight)
  const tooltipLeft = Math.min(Math.max(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, MARGIN), window.innerWidth - TOOLTIP_WIDTH - MARGIN)

  return (
    <>
      {/* พื้นหลังทึบสีเทาเข้ม กันคลิกโดนเนื้อหาจริงด้านหลัง — คลิกที่ไหนก็ได้เพื่อไปขั้นตอนถัดไป */}
      <div className="fixed inset-0 z-[997]" onClick={next} aria-hidden="true" />
      {/* วงสปอตไลท์ — box-shadow ขนาดมหาศาลทำให้พื้นที่นอกกรอบนี้มืดลงเป็นสีเทาทั้งจอ เหลือแค่จุดที่ไฮไลต์สว่างอยู่ */}
      <div
        className={`pointer-events-none fixed z-[998] rounded-xl ring-2 ring-white/85 ${reducedMotion ? '' : 'transition-all duration-300 ease-out'}`}
        style={{ top, left, width, height, boxShadow: '0 0 0 9999px rgba(24,24,27,0.78)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        className="fixed z-[999] rounded-2xl border border-white/10 bg-zinc-800 p-4 text-white shadow-pop"
        style={{
          width: TOOLTIP_WIDTH,
          left: tooltipLeft,
          ...tooltipPosition,
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            ขั้นตอน {stepIndex + 1}/{steps.length}
          </span>
          <button onClick={skip} className="text-zinc-400 hover:text-white" aria-label="ปิดทัวร์แนะนำ">
            <CloseIcon size={15} />
          </button>
        </div>
        <p className="text-sm font-bold text-white">{step.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-300">{step.body}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button onClick={skip} className="text-xs font-semibold text-zinc-400 hover:text-white">
            ข้ามทั้งหมด
          </button>
          <button onClick={next} className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-900 hover:bg-zinc-200">
            {isLast ? 'เข้าใจแล้ว' : 'ถัดไป'}
          </button>
        </div>
        {steps.length > 1 && (
          <div className="mt-3 flex justify-center gap-1">
            {steps.map((_, i) => (
              <span key={i} className={`h-1 w-4 rounded-full ${i === stepIndex ? 'bg-white' : 'bg-white/25'}`} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
