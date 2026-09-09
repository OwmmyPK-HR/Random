import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENTS, SPORT_GROUPS } from '../data/events'
import { COLORS, COLOR_THEME } from '../types'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { exportAllResults } from '../utils/excel'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function SummaryPage() {
  const { store, resetAll } = useEventStore()
  const { notify } = useToast()
  const [confirmReset, setConfirmReset] = useState(false)

  const randomizedTotal = EVENTS.filter((ev) => store[ev.code]?.result).length
  const colorTotals = COLORS.map((c) => EVENTS.reduce((sum, ev) => sum + (store[ev.code]?.result?.[c]?.length ?? 0), 0))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">สรุปผล &amp; ส่งออก</h1>
          <p className="text-sm text-slate-500">
            สุ่มแล้ว {randomizedTotal}/{EVENTS.length} รายการ
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportAllResults(store)}
            className="rounded-xl bg-tu-maroon px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-tu-maroon/90"
          >
            ⬇ ส่งออกสรุปผลทั้งหมด (Excel)
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            ล้างข้อมูลทั้งหมด
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COLORS.map((c, i) => {
          const theme = COLOR_THEME[c]
          return (
            <div key={c} className="rounded-2xl border p-4 shadow-soft" style={{ borderColor: theme.light, backgroundColor: theme.light }}>
              <p className="text-xs font-semibold" style={{ color: theme.dark }}>
                สี{c}
              </p>
              <p className="mt-1 text-2xl font-extrabold" style={{ color: theme.dark }}>
                {colorTotals[i].toLocaleString('th-TH')}
                <span className="ml-1 text-sm font-medium opacity-70">รายการ</span>
              </p>
            </div>
          )
        })}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">หมวดกีฬา</th>
              <th className="px-4 py-3">รายการ</th>
              <th className="px-4 py-3">เงื่อนไข</th>
              {COLORS.map((c) => (
                <th key={c} className="px-3 py-3 text-center">
                  {c}
                </th>
              ))}
              <th className="px-4 py-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {SPORT_GROUPS.map((g) =>
              g.events.map((ev, idx) => {
                const state = store[ev.code]
                const result = state?.result
                return (
                  <tr key={ev.code} className="hover:bg-slate-50">
                    {idx === 0 && (
                      <td className="px-4 py-2.5 align-top font-semibold text-slate-700" rowSpan={g.events.length}>
                        {g.name}
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <Link to={`/event/${ev.code}`} className="font-medium text-slate-800 hover:text-tu-maroon">
                        {ev.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {ev.genderLabel}
                      {ev.ageLabel ? ` · ${ev.ageLabel}` : ''}
                    </td>
                    {COLORS.map((c) => (
                      <td key={c} className="px-3 py-2.5 text-center text-xs font-semibold text-slate-600">
                        {result?.[c]?.length ?? '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center">
                      {result ? (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">สุ่มแล้ว</span>
                      ) : state?.roster?.length ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">รอสุ่ม</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">ไม่มีข้อมูล</span>
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
