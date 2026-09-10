import { useState } from 'react'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ColorDot } from '../components/ColorBadge'
import { NumberDrawAnimation } from '../components/NumberDrawAnimation'
import { COLORS, COLOR_THEME } from '../types'
import { DiceIcon, PrinterIcon } from '../components/Icons'

export function NumberDrawPage() {
  const { numberDraw, drawColorNumbers, resetNumberDraw } = useEventStore()
  const { notify } = useToast()
  const [isDrawing, setIsDrawing] = useState(false)
  const [confirmRedraw, setConfirmRedraw] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const hasDrawn = !!numberDraw.assignment

  const doDraw = () => {
    drawColorNumbers() // คำนวณผลจริงทันที เก็บไว้เงียบ ๆ ก่อน — แอนิเมชันด้านล่างจะค่อย ๆ เผยผลนี้
    setIsDrawing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-mist-100">จับฉลากเบอร์ประจำสี</h1>
          <p className="hidden text-xs font-semibold text-mist-500 print:block">จับฉลากเบอร์ประจำสี</p>
          <p className="no-print text-sm text-mist-500">
            สุ่มเบอร์ 1-4 ให้แต่ละสี ใช้สำหรับลำดับเดินขบวน พิธีเปิด หรือกิจกรรมอื่นที่ต้องใช้เบอร์ประจำสี (ไม่เกี่ยวกับการจับคู่แข่งขันของแต่ละประเภทกีฬา)
          </p>
        </div>
        {hasDrawn && !isDrawing && (
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 rounded-xl border border-surface-borderLight bg-surface-card px-3.5 py-2 text-sm font-semibold text-mist-200 hover:bg-surface-raised"
          >
            <PrinterIcon size={15} /> พิมพ์ผล
          </button>
        )}
      </div>

      <section className="no-print rounded-2xl border border-surface-border bg-surface-card p-5 shadow-soft">
        <button
          onClick={() => (hasDrawn ? setConfirmRedraw(true) : doDraw())}
          disabled={isDrawing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-base font-bold text-accent-contrast shadow-glowAccent transition hover:-translate-y-0.5 hover:bg-accent-soft disabled:pointer-events-none disabled:translate-y-0 disabled:bg-surface-raised disabled:text-mist-600 disabled:shadow-none"
        >
          <DiceIcon size={19} className={isDrawing ? 'animate-tumble' : ''} />
          {isDrawing ? 'กำลังจับฉลาก...' : hasDrawn ? 'จับฉลากใหม่' : 'เริ่มจับฉลากเบอร์'}
        </button>
        {numberDraw.drawnAt && !isDrawing && (
          <p className="mt-3 text-center text-xs text-mist-600">
            จับฉลากล่าสุด: {new Date(numberDraw.drawnAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
      </section>

      {isDrawing && numberDraw.assignment && (
        <NumberDrawAnimation finalAssignment={numberDraw.assignment} onDone={() => setIsDrawing(false)} />
      )}

      {hasDrawn && !isDrawing && (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {COLORS.map((c) => {
            const theme = COLOR_THEME[c]
            const n = numberDraw.assignment![c]
            return (
              <div
                key={c}
                className="animate-popIn flex flex-col items-center gap-3 rounded-2xl border border-surface-border bg-surface-card p-6 text-center shadow-soft"
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-mist-300">
                  <ColorDot color={c} size={10} /> สี{c}
                </span>
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full text-3xl font-extrabold text-white [font-variant-numeric:tabular-nums]"
                  style={{ background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`, boxShadow: `0 0 20px ${theme.base}55` }}
                >
                  {n}
                </span>
                <span className="text-xs font-semibold text-mist-500">เบอร์ {n}</span>
              </div>
            )
          })}
        </section>
      )}

      {!hasDrawn && !isDrawing && (
        <div className="rounded-2xl border border-dashed border-surface-borderLight bg-surface-card p-8 text-center text-sm text-mist-500">
          ยังไม่ได้จับฉลากเบอร์ — กดปุ่มด้านบนเพื่อเริ่มสุ่ม
        </div>
      )}

      {hasDrawn && !isDrawing && (
        <div className="no-print flex justify-center">
          <button onClick={() => setConfirmClear(true)} className="text-xs font-semibold text-mist-500 hover:text-rose-400 hover:underline">
            ล้างผลจับฉลากเบอร์
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmRedraw}
        title="จับฉลากใหม่?"
        message="เบอร์ประจำสีเดิมจะถูกแทนที่ด้วยผลใหม่ทันที การกระทำนี้ย้อนกลับไม่ได้"
        confirmLabel="จับฉลากใหม่"
        danger
        onCancel={() => setConfirmRedraw(false)}
        onConfirm={() => {
          setConfirmRedraw(false)
          doDraw()
        }}
      />
      <ConfirmDialog
        open={confirmClear}
        title="ล้างผลจับฉลากเบอร์?"
        message="ผลจับฉลากเบอร์ประจำสีจะถูกลบทั้งหมด (ไม่กระทบข้อมูลของประเภทกีฬาอื่น)"
        confirmLabel="ล้าง"
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false)
          resetNumberDraw()
          notify('ล้างผลจับฉลากเบอร์เรียบร้อย', 'success')
        }}
      />
    </div>
  )
}
