import { Link } from 'react-router-dom'
import type { EventState, SportEvent } from '../types'
import { CheckCircleIcon, ChevronRightIcon, CircleDashedIcon, ClockIcon } from './Icons'

export function EventCard({ ev, state }: { ev: SportEvent; state: EventState }) {
  const count = state.roster.length
  const done = !!state.result

  return (
    <Link
      to={`/event/${ev.code}`}
      className="group flex flex-col justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">{ev.genderLabel}</span>
          {ev.ageLabel && (
            <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-gold-600">{ev.ageLabel}</span>
          )}
          {ev.mode === 'colorTeam' && (
            <span className="rounded-full bg-team-blue-light px-2 py-0.5 text-[11px] font-semibold text-team-blue-dark">
              แบ่งตามสีทีม
            </span>
          )}
        </div>
        <h3 className="mt-2 flex items-center gap-1 font-semibold text-ink-900 group-hover:text-brand-600">
          {ev.name}
          <ChevronRightIcon size={15} className="opacity-0 transition-opacity group-hover:opacity-100" />
        </h3>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-ink-400">{count > 0 ? `${count} รายการ` : 'ยังไม่มีข้อมูล'}</span>
        <StatusPill done={done} hasData={count > 0} />
      </div>
    </Link>
  )
}

function StatusPill({ done, hasData }: { done: boolean; hasData: boolean }) {
  if (done)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
        <CheckCircleIcon size={12} /> สุ่มแล้ว
      </span>
    )
  if (hasData)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/10 px-2.5 py-1 text-[11px] font-bold text-gold-600">
        <ClockIcon size={12} /> รอสุ่ม
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-400">
      <CircleDashedIcon size={12} /> ยังไม่มีข้อมูล
    </span>
  )
}
