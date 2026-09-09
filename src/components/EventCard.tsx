import { Link } from 'react-router-dom'
import type { EventState, SportEvent } from '../types'

export function EventCard({ ev, state }: { ev: SportEvent; state: EventState }) {
  const count = state.roster.length
  const done = !!state.result

  return (
    <Link
      to={`/event/${ev.code}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {ev.genderLabel}
          </span>
          {ev.ageLabel && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              {ev.ageLabel}
            </span>
          )}
          {ev.mode === 'colorTeam' && (
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">แบ่งตามสีทีม</span>
          )}
        </div>
        <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-tu-maroon">{ev.name}</h3>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">{count > 0 ? `${count} รายการ` : 'ยังไม่มีข้อมูล'}</span>
        <StatusPill done={done} hasData={count > 0} />
      </div>
    </Link>
  )
}

function StatusPill({ done, hasData }: { done: boolean; hasData: boolean }) {
  if (done)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> สุ่มแล้ว
      </span>
    )
  if (hasData)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> รอสุ่ม
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> ยังไม่มีข้อมูล
    </span>
  )
}
