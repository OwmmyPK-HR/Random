import { Link, useParams } from 'react-router-dom'
import { getGroupBySlug } from '../data/events'
import { EventCard } from '../components/EventCard'
import { useEventStore } from '../store/EventStoreContext'

export function SportGroupPage() {
  const { slug = '' } = useParams()
  const group = getGroupBySlug(slug)
  const { getEvent } = useEventStore()

  if (!group) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">ไม่พบหมวดกีฬานี้</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-tu-maroon hover:underline">
          ← กลับหน้าแรก
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Link to="/" className="text-xs font-medium text-slate-400 hover:text-tu-maroon">
          ← ประเภทกีฬาทั้งหมด
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{group.name}</h1>
        <p className="text-sm text-slate-500">{group.events.length} รายการแข่งขัน</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.events.map((ev) => (
          <EventCard key={ev.code} ev={ev} state={getEvent(ev.code)} />
        ))}
      </div>
    </div>
  )
}
