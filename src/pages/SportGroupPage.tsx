import { Link, useParams } from 'react-router-dom'
import { getGroupBySlug } from '../data/events'
import { EventCard } from '../components/EventCard'
import { useEventStore } from '../store/EventStoreContext'
import { ArrowLeftIcon, SPORT_ICON } from '../components/Icons'

export function SportGroupPage() {
  const { slug = '' } = useParams()
  const group = getGroupBySlug(slug)
  const { getEvent } = useEventStore()

  if (!group) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-8 text-center">
        <p className="text-mist-400">ไม่พบหมวดกีฬานี้</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-gold-400 hover:underline">
          ← กลับหน้าแรก
        </Link>
      </div>
    )
  }

  const Icon = SPORT_ICON[group.name]
  const done = group.events.filter((ev) => {
    const s = getEvent(ev.code)
    return s.colorBracket || s.unitBracket
  }).length

  return (
    <div className="space-y-5">
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-mist-500 hover:text-gold-400">
          <ArrowLeftIcon size={13} /> ประเภทกีฬาทั้งหมด
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400 text-surface-canvas shadow-glowGold">
            {Icon && <Icon size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-wide text-mist-100">{group.name}</h1>
            <p className="text-sm text-mist-500">
              {group.events.length} รายการแข่งขัน · จับคู่แล้ว {done}/{group.events.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.events.map((ev) => (
          <EventCard key={ev.code} ev={ev} state={getEvent(ev.code)} />
        ))}
      </div>
    </div>
  )
}
