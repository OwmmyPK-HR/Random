import { Link } from 'react-router-dom'
import type { EventState, SportEvent } from '../types'
import { CheckCircleIcon, ChevronRightIcon, CircleDashedIcon, ClockIcon } from './Icons'

export function EventCard({ ev, state }: { ev: SportEvent; state: EventState }) {
  const count = state.roster.length
  const done = !!(state.colorBracket || state.unitBracket)

  return (
    <Link
      to={`/event/${ev.code}`}
      className="group flex flex-col justify-between rounded-2xl border border-surface-border bg-surface-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold-400/40 hover:shadow-glowGold"
    >
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-semibold text-mist-400">{ev.genderLabel}</span>
          {ev.ageLabel && (
            <span className="rounded-full bg-gold-400/10 px-2 py-0.5 text-[11px] font-semibold text-gold-400">{ev.ageLabel}</span>
          )}
          {ev.mode === 'colorTeam' && (
            <span className="rounded-full bg-team-blue/15 px-2 py-0.5 text-[11px] font-semibold text-team-blue-soft">
              แบ่งตามสีทีม
            </span>
          )}
        </div>
        <h3 className="mt-2 flex items-center gap-1 font-semibold text-mist-100 group-hover:text-gold-300">
          {ev.name}
          <ChevronRightIcon size={15} className="opacity-0 transition-opacity group-hover:opacity-100" />
        </h3>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-mist-500">{count > 0 ? `${count} รายการ` : 'ยังไม่มีข้อมูล'}</span>
        <StatusPill done={done} hasData={count > 0} />
      </div>
    </Link>
  )
}

function StatusPill({ done, hasData }: { done: boolean; hasData: boolean }) {
  if (done)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-team-green/15 px-2.5 py-1 text-[11px] font-bold text-team-green-soft">
        <CheckCircleIcon size={12} /> จับคู่แล้ว
      </span>
    )
  if (hasData)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/10 px-2.5 py-1 text-[11px] font-bold text-gold-400">
        <ClockIcon size={12} /> รอจับคู่
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised px-2.5 py-1 text-[11px] font-bold text-mist-600">
      <CircleDashedIcon size={12} /> ยังไม่มีข้อมูล
    </span>
  )
}
