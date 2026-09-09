import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENTS } from '../data/events'
import { useEventStore } from '../store/EventStoreContext'
import { formatThaiDateFull } from '../utils/date'
import { SPORT_ICON, CalendarIcon, CheckCircleIcon, ClockIcon, MapPinIcon, SearchIcon } from '../components/Icons'

export function SchedulePage() {
  const { store } = useEventStore()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const matchesQuery = (evName: string, sportGroup: string, venue?: string) =>
    !q || `${sportGroup} ${evName} ${venue ?? ''}`.toLowerCase().includes(q)

  const { dated, undated } = useMemo(() => {
    const withDate: { code: string; date: string }[] = []
    const noDate: string[] = []
    for (const ev of EVENTS) {
      const state = store[ev.code]
      if (!matchesQuery(ev.name, ev.sportGroup, state?.venue)) continue
      if (state?.date) withDate.push({ code: ev.code, date: state.date })
      else noDate.push(ev.code)
    }
    withDate.sort((a, b) => a.date.localeCompare(b.date))
    const groups: { date: string; codes: string[] }[] = []
    for (const { code, date } of withDate) {
      const last = groups[groups.length - 1]
      if (last && last.date === date) last.codes.push(code)
      else groups.push({ date, codes: [code] })
    }
    return { dated: groups, undated: noDate }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, q])

  const totalScheduled = dated.reduce((sum, g) => sum + g.codes.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-mist-100">ตารางแข่งขัน</h1>
        <p className="text-sm text-mist-500">
          กำหนดวันที่/สถานที่แข่งขันจริงได้ที่หน้าแต่ละประเภทกีฬา — กำหนดแล้ว {totalScheduled}/{EVENTS.length} รายการ
        </p>
      </div>

      <div className="relative">
        <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาประเภทกีฬาหรือสถานที่"
          className="w-full rounded-xl border border-surface-border bg-surface-card py-2.5 pl-10 pr-3 text-sm text-mist-100 placeholder:text-mist-600 focus:border-accent focus:outline-none"
        />
      </div>

      {dated.length === 0 && undated.length === 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface-card p-8 text-center text-sm text-mist-500">
          ไม่พบประเภทกีฬาที่ตรงกับ “{query}”
        </div>
      )}

      <div className="space-y-4">
        {dated.map((group) => (
          <section key={group.date} className="rounded-2xl border border-surface-border bg-surface-card shadow-soft">
            <div className="flex items-center gap-2 border-b border-surface-border bg-surface-sunken px-4 py-2.5">
              <CalendarIcon size={15} className="text-accent" />
              <h2 className="text-sm font-bold text-mist-100">{formatThaiDateFull(group.date)}</h2>
              <span className="ml-auto text-xs font-semibold text-mist-500">{group.codes.length} รายการ</span>
            </div>
            <ul className="divide-y divide-surface-border">
              {group.codes.map((code) => (
                <ScheduleRow key={code} code={code} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {undated.length > 0 && (
        <section className="rounded-2xl border border-dashed border-surface-borderLight bg-surface-card shadow-soft">
          <div className="flex items-center gap-2 border-b border-surface-border px-4 py-2.5">
            <ClockIcon size={15} className="text-mist-500" />
            <h2 className="text-sm font-bold text-mist-400">ยังไม่กำหนดวัน ({undated.length})</h2>
          </div>
          <ul className="divide-y divide-surface-border">
            {undated.map((code) => (
              <ScheduleRow key={code} code={code} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ScheduleRow({ code }: { code: string }) {
  const { store } = useEventStore()
  const ev = EVENTS.find((e) => e.code === code)
  if (!ev) return null
  const state = store[code]
  const Icon = SPORT_ICON[ev.sportGroup]
  const hasBracket = !!(state?.colorBracket || state?.unitBracket)

  return (
    <li>
      <Link to={`/event/${code}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-raised/60">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-surface-raised dark:text-accent">
          {Icon && <Icon size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-mist-100">
            {ev.sportGroup} · {ev.name}
          </p>
          {state?.venue && (
            <p className="flex items-center gap-1 truncate text-xs text-mist-500">
              <MapPinIcon size={11} /> {state.venue}
            </p>
          )}
        </div>
        {hasBracket ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-team-green/15 px-2 py-0.5 text-[11px] font-bold text-team-green-soft">
            <CheckCircleIcon size={11} /> จับสลากแล้ว
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-bold text-mist-500">
            รอจับสลาก
          </span>
        )}
      </Link>
    </li>
  )
}
