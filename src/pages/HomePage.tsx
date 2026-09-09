import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { SPORT_GROUPS } from '../data/events'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { downloadAllTemplates, exportAllResults, parseWorkbookFile } from '../utils/excel'
import { eventsWithDataCount, randomizedCount, totalHeadcount } from '../utils/stats'

const GROUP_META: Record<string, { emoji: string; blurb: string }> = {
  เทนนิส: { emoji: '🎾', blurb: 'ทีม / เดี่ยว / คู่ / คู่ผสม' },
  ฟุตบอล: { emoji: '⚽', blurb: 'ทีมชาย แบ่งตามสีทีม' },
  ฟุตซอล: { emoji: '🥅', blurb: 'ทีมชาย แบ่งตามสีทีม' },
  วอลเลย์บอล: { emoji: '🏐', blurb: 'ทีมชาย / ทีมหญิง' },
  บาสเกตบอล: { emoji: '🏀', blurb: 'ทีมชาย / ทีมหญิง' },
  แบดมินตัน: { emoji: '🏸', blurb: 'คู่ทุกรุ่นอายุ / คู่ผสม' },
  เปตอง: { emoji: '🥎', blurb: 'เดี่ยว / คู่ / ทีม 3 คน' },
}

export function HomePage() {
  const { store, bulkSetRoster } = useEventStore()
  const { notify } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const totalEvents = SPORT_GROUPS.reduce((s, g) => s + g.events.length, 0)
  const withData = eventsWithDataCount(store)
  const randomized = randomizedCount(store)
  const heads = totalHeadcount(store)

  const handleBulkFile = async (file: File) => {
    try {
      const { parsed, unmatchedSheets } = await parseWorkbookFile(file)
      const codes = Object.keys(parsed)
      if (codes.length === 0) {
        notify('ไม่พบข้อมูลที่จับคู่กับประเภทกีฬาได้ในไฟล์นี้ กรุณาใช้ไฟล์ฟอร์มที่ดาวน์โหลดจากระบบ', 'error')
        return
      }
      bulkSetRoster(parsed, 'replace')
      notify(
        `นำเข้าข้อมูลสำเร็จ ${codes.length} ประเภทกีฬา${unmatchedSheets.length ? ` (ข้าม ${unmatchedSheets.length} ชีตที่จับคู่ไม่ได้)` : ''}`,
        'success',
      )
    } catch (err) {
      console.error(err)
      notify('อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบรูปแบบไฟล์ Excel', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-tu-maroon to-[#4a1219] p-6 text-white shadow-card sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">TU Sport Day 2026</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">ระบบสุ่มแบ่งสายกีฬาสี</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          อัปโหลดรายชื่อนักกีฬาผ่านฟอร์ม Excel แล้วสุ่มแบ่งเข้า 4 สี — ฟ้า ม่วง ชมพู เขียว — พร้อมจับสายแข่งขันรอบแรก
          (Seed 1) อัตโนมัติ ทำงานบนเบราว์เซอร์ทั้งหมด ไม่ต้องมีเซิร์ฟเวอร์
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => downloadAllTemplates(store)}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-tu-maroon shadow-sm transition hover:bg-white/90"
          >
            ⬇ ดาวน์โหลดฟอร์ม Excel (ทุกประเภท)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/20"
          >
            ⬆ อัปโหลดไฟล์รวม
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleBulkFile(f)
              e.target.value = ''
            }}
          />
          <Link
            to="/summary"
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-white/20"
          >
            📊 สรุปผล &amp; ส่งออก
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="ประเภทกีฬาทั้งหมด" value={totalEvents} />
        <StatTile label="มีข้อมูลนักกีฬาแล้ว" value={withData} suffix={`/ ${totalEvents}`} />
        <StatTile label="สุ่มแบ่งสีแล้ว" value={randomized} suffix={`/ ${totalEvents}`} accent />
        <StatTile label="นักกีฬารวม (โดยประมาณ)" value={heads} suffix="คน" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">ประเภทกีฬา</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SPORT_GROUPS.map((g) => {
            const done = g.events.filter((ev) => store[ev.code]?.result).length
            const meta = GROUP_META[g.name]
            return (
              <Link
                key={g.slug}
                to={`/sport/${g.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <div>
                  <span className="text-3xl">{meta?.emoji ?? '🏆'}</span>
                  <h3 className="mt-2 font-bold text-slate-900 group-hover:text-tu-maroon">{g.name}</h3>
                  <p className="text-xs text-slate-400">{meta?.blurb}</p>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{g.events.length} รายการ</span>
                    <span>
                      สุ่มแล้ว {done}/{g.events.length}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-tu-maroon transition-all"
                      style={{ width: `${g.events.length ? (done / g.events.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        <p className="font-semibold text-slate-700">วิธีใช้งาน</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>ดาวน์โหลดฟอร์ม Excel รวมทุกประเภท กรอกรายชื่อนักกีฬาในแต่ละชีตให้ครบ (ไม่ต้องแก้ชื่อหัวตาราง)</li>
          <li>อัปโหลดไฟล์เดิมกลับเข้าระบบ ข้อมูลจะกระจายเข้าแต่ละประเภทกีฬาให้อัตโนมัติ</li>
          <li>เข้าไปที่แต่ละประเภทกีฬา กดปุ่ม “สุ่มแบ่งสี” เพื่อสุ่มอย่างเป็นธรรม (จำนวนแต่ละสีต่างกันไม่เกิน 1 คน)</li>
          <li>ระบบจะจับสายแข่งขันรอบแรก (Seed 1) ให้อัตโนมัติ และสามารถส่งออกผลเป็น Excel ได้ทั้งรายประเภทและสรุปรวม</li>
        </ol>
        <div className="mt-3">
          <button onClick={() => exportAllResults(store)} className="text-xs font-semibold text-tu-maroon hover:underline">
            ส่งออกสรุปผลทั้งหมดตอนนี้ →
          </button>
        </div>
      </section>
    </div>
  )
}

function StatTile({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ? 'text-tu-maroon' : 'text-slate-900'}`}>
        {value.toLocaleString('th-TH')}
        {suffix && <span className="ml-1 text-sm font-medium text-slate-400">{suffix}</span>}
      </p>
    </div>
  )
}
