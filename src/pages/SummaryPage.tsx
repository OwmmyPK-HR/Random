import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENTS, SPORT_GROUPS } from '../data/events'
import { COLORS, COLOR_THEME } from '../types'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { exportAllResults } from '../utils/excel'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ColorDistributionBar } from '../components/ColorDistributionBar'
import { CheckCircleIcon, ClockIcon, DownloadIcon, TrashIcon } from '../components/Icons'

export function SummaryPage() {
  const { store, resetAll } = useEventStore()
  const { notify } = useToast()
  const [confirmReset, setConfirmReset] = useState(false)

  const randomizedTotal = EVENTS.filter((ev) => store[ev.code]?.result).length
  const colorCounts = Object.fromEntries(
    COLORS.map((c) => [c, EVENTS.reduce((sum, ev) => sum + (store[ev.code]?.result?.[c]?.length ?? 0), 0)]),
  ) as Record<(typeof COLORS)[number], number>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">สรุปผล &amp; ส่งออก</h1>
          <p className="text-sm text-ink-400">
            สุ่มแล้ว {randomizedTotal}/{EVENTS.length} รายการ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportAllResults(store)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-card"
          >
            <DownloadIcon size={16} /> ส่งออกสรุปผลทั้งหมด (Excel)
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <TrashIcon size={15} /> ล้างข้อมูลทั้งหมด
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
        <h2 className="text-sm font-bold text-ink-900">สัดส่วนนักกีฬาแต่ละสี (รวมทุกประเภทที่สุ่มแล้ว)</h2>
        <div className="mt-4">
          <ColorDistributionBar counts={colorCounts} />
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-[11px] font-bold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">หมวดกีฬา</th>
              <th className="px-4 py-3">รายการ</th>
              <th className="px-4 py-3">เงื่อนไข</th>
              {COLORS.map((c) => (
                <th key={c} className="px-3 py-3 text-center">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_THEME[c].base }} />
                    {c}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {SPORT_GROUPS.map((g) =>
              g.events.map((ev, idx) => {
                const state = store[ev.code]
                const result = state?.result
                return (
                  <tr key={ev.code} className="hover:bg-ink-50/60">
                    {idx === 0 && (
                      <td className="px-4 py-2.5 align-top font-semibold text-ink-700" rowSpan={g.events.length}>
                        {g.name}
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <Link to={`/event/${ev.code}`} className="font-medium text-ink-800 hover:text-brand-600">
                        {ev.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-400">
                      {ev.genderLabel}
                      {ev.ageLabel ? ` · ${ev.ageLabel}` : ''}
                    </td>
                    {COLORS.map((c) => (
                      <td key={c} className="px-3 py-2.5 text-center text-xs font-semibold text-ink-600">
                        {result?.[c]?.length ?? '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center">
                      {result ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                          <CheckCircleIcon size={11} /> สุ่มแล้ว
                        </span>
                      ) : state?.roster?.length ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] font-bold text-gold-600">
                          <ClockIcon size={11} /> รอสุ่ม
                        </span>
                      ) : (
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-400">ไม่มีข้อมูล</span>
                      )}
                    </td>
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="ล้างข้อมูลทั้งหมด?"
        message="รายชื่อนักกีฬาและผลการสุ่มของทุกประเภทกีฬาจะถูกลบทั้งหมดออกจากเครื่องนี้ การกระทำนี้ย้อนกลับไม่ได้"
        confirmLabel="ล้างข้อมูลทั้งหมด"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll()
          setConfirmReset(false)
          notify('ล้างข้อมูลทั้งหมดเรียบร้อย', 'success')
        }}
      />
    </div>
  )
}
