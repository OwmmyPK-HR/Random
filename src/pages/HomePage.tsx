import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { EVENTS, SPORT_GROUPS } from '../data/events'
import { COLORS } from '../types'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { downloadAllTemplates, exportAllResults, parseWorkbookFile } from '../utils/excel'
import { eventsWithDataCount, randomizedCount, totalHeadcount } from '../utils/stats'
import { groupRosterByColor } from '../utils/shuffle'
import { ColorDistributionBar } from '../components/ColorDistributionBar'
import {
  ChartIcon,
  CheckCircleIcon,
  DownloadIcon,
  SPORT_ICON,
  TrophyIcon,
  UploadIcon,
  UsersIcon,
} from '../components/Icons'

const GROUP_BLURB: Record<string, string> = {
  เทนนิส: 'ทีม · เดี่ยว · คู่ · คู่ผสม',
  ฟุตบอล: 'ทีมชาย แบ่งตามสีทีม',
  ฟุตซอล: 'ทีมชาย แบ่งตามสีทีม',
  วอลเลย์บอล: 'ทีมชาย · ทีมหญิง',
  บาสเกตบอล: 'ทีมชาย · ทีมหญิง',
  แบดมินตัน: 'คู่ทุกรุ่นอายุ · คู่ผสม',
  เปตอง: 'เดี่ยว · คู่ · ทีม 3 คน',
}

export function HomePage() {
  const { store, bulkSetRoster } = useEventStore()
  const { notify } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const totalEvents = EVENTS.length
  const withData = eventsWithDataCount(store)
  const randomized = randomizedCount(store)
  const heads = totalHeadcount(store)

  const colorCounts = Object.fromEntries(
    COLORS.map((c) => [c, EVENTS.reduce((sum, ev) => sum + groupRosterByColor(store[ev.code]?.roster ?? [])[c].length, 0)]),
  ) as Record<(typeof COLORS)[number], number>

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
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-800 p-6 text-white shadow-pop sm:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]">
          <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-team-blue blur-3xl" />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/80 ring-1 ring-inset ring-white/20">
            <TrophyIcon size={13} /> TU Sport Day 2026
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
            ระบบสุ่มจับคู่แข่งขันกีฬาสี
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-[15px]">
            แต่ละสี — ฟ้า ม่วง ชมพู เขียว — มีนักกีฬาและทีมของตัวเองอยู่แล้ว แค่กรอกรายชื่อแยกตามสีผ่านฟอร์ม Excel
            แล้วให้ระบบ<strong className="font-bold">สุ่มจับคู่แข่งขันรอบแรก (Seed 1)</strong>ให้อย่างเป็นธรรม
            ทำงานบนเบราว์เซอร์ทั้งหมด ไม่ต้องมีเซิร์ฟเวอร์
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => downloadAllTemplates(store)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <DownloadIcon size={16} /> ดาวน์โหลดฟอร์ม Excel (ทุกประเภท)
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/20"
            >
              <UploadIcon size={16} /> อัปโหลดไฟล์รวม
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
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/20"
            >
              <ChartIcon size={16} /> สรุปผล &amp; ส่งออก
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<TrophyIcon size={17} />} label="ประเภทกีฬาทั้งหมด" value={totalEvents} />
        <StatTile icon={<UsersIcon size={17} />} label="มีข้อมูลนักกีฬาแล้ว" value={withData} suffix={`/ ${totalEvents}`} />
        <StatTile icon={<CheckCircleIcon size={17} />} label="สุ่มจับคู่แข่งขันแล้ว" value={randomized} suffix={`/ ${totalEvents}`} accent />
        <StatTile icon={<UsersIcon size={17} />} label="นักกีฬารวม (โดยประมาณ)" value={heads} suffix="คน" />
      </section>

      {/* COLOR DISTRIBUTION */}
      {withData > 0 && (
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <h2 className="text-sm font-bold text-ink-900">สัดส่วนนักกีฬาแต่ละสี (รวมทุกประเภทที่มีข้อมูลแล้ว)</h2>
          <div className="mt-4">
            <ColorDistributionBar counts={colorCounts} />
          </div>
        </section>
      )}

      {/* SPORT GROUPS */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-ink-900">ประเภทกีฬา</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SPORT_GROUPS.map((g) => {
            const done = g.events.filter((ev) => store[ev.code]?.colorBracket || store[ev.code]?.unitBracket).length
            const Icon = SPORT_ICON[g.name]
            const pct = g.events.length ? (done / g.events.length) * 100 : 0
            return (
              <Link
                key={g.slug}
                to={`/sport/${g.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    {Icon && <Icon size={22} />}
                  </div>
                  <h3 className="mt-3 font-bold text-ink-900 group-hover:text-brand-600">{g.name}</h3>
                  <p className="text-xs text-ink-400">{GROUP_BLURB[g.name]}</p>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-500">
                    <span>{g.events.length} รายการ</span>
                    <span className={pct === 100 ? 'text-green-600' : ''}>
                      จับคู่แล้ว {done}/{g.events.length}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-brand-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* HOW TO */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
        <p className="font-bold text-ink-900">วิธีใช้งาน</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'ดาวน์โหลดฟอร์ม Excel รวมทุกประเภท — แต่ละชีตมีคอลัมน์แยกตามสีให้แล้ว (ฟ้า/ม่วง/ชมพู/เขียว)',
            'กรอกรายชื่อนักกีฬา/ทีมของแต่ละสีลงคอลัมน์ของสีนั้น แล้วอัปโหลดไฟล์กลับเข้าระบบ',
            'เข้าไปที่แต่ละประเภทกีฬา กด “สุ่มจับคู่แข่งขัน” ให้ระบบสุ่มคู่ต่อสู้รอบแรกอย่างเป็นธรรม',
            'ได้สายการแข่งขันรอบแรก (Seed 1) ทันที ส่งออกผลเป็น Excel ได้เลย',
          ].map((text, i) => (
            <div key={i} className="relative rounded-xl border border-ink-100 bg-ink-50/60 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button onClick={() => exportAllResults(store)} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline">
            <DownloadIcon size={14} /> ส่งออกสรุปผลทั้งหมดตอนนี้
          </button>
        </div>
      </section>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <div
        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${
          accent ? 'bg-green-50 text-green-600' : 'bg-ink-100 text-ink-500'
        }`}
      >
        {icon}
      </div>
      <p className="text-[11px] font-semibold text-ink-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-extrabold ${accent ? 'text-green-600' : 'text-ink-900'}`}>
        {value.toLocaleString('th-TH')}
        {suffix && <span className="ml-1 text-xs font-semibold text-ink-400">{suffix}</span>}
      </p>
    </div>
  )
}
