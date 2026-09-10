import { Link, useParams } from 'react-router-dom'
import { getGroupBySlug } from '../data/events'
import { EventCard } from '../components/EventCard'
import { useEventStore } from '../store/EventStoreContext'
import { groupEventsByCategory } from '../utils/eventGroups'
import { ArrowLeftIcon } from '../components/Icons'

export function SportGroupPage() {
  const { slug = '' } = useParams()
  const group = getGroupBySlug(slug)
  const { getEvent } = useEventStore()

  if (!group) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-8 text-center">
        <p className="text-mist-400">ไม่พบหมวดกีฬานี้</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
          ← กลับหน้าแรก
        </Link>
      </div>
    )
  }

  const done = group.events.filter((ev) => {
    const s = getEvent(ev.code)
    return s.colorBracket || s.unitBracket
  }).length
  const sections = groupEventsByCategory(group.events)

  return (
    <div className="space-y-5">
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-mist-500 hover:text-accent">
          <ArrowLeftIcon size={13} /> ประเภทกีฬาทั้งหมด
        </Link>
        <div className="relative mt-2 overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-soft">
          <img src={`./sports/${group.slug}.png`} alt="" className="h-32 w-full object-cover sm:h-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-card via-surface-card/75 to-transparent" />
          <div className="absolute inset-0 flex items-center gap-3 px-5">
            <img src={`./icons/${group.slug}.png`} alt="" className="h-12 w-12 shrink-0 drop-shadow-md" />
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-wide text-mist-100">{group.name}</h1>
              <p className="text-sm text-mist-500">
                {group.events.length} รายการแข่งขัน · จับคู่แล้ว {done}/{group.events.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <div key={section.heading ?? `single-${i}`}>
            {section.heading && (
              <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mist-400">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {section.heading}
              </h2>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.events.map((ev) => (
                <EventCard key={ev.code} ev={ev} state={getEvent(ev.code)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
