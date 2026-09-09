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
      <section className="corner-cut relative overflow-hidden bg-gradient-to-br from-brand-700 via-surface-sunken to-surface-canvas p-6 shadow-pop ring-1 ring-surface-border sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-24 h-80 w-80 animate-drift rounded-full bg-gold-500 opacity-[.16] blur-3xl" />
          <div className="absolute -bottom-28 left-4 h-72 w-72 animate-drift rounded-full bg-team-blue opacity-[.14] blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-stripe opacity-70" />
        </div>
        <div className="relative">
          <span className="eyebrow inline-flex items-center gap-1.5 bg-gold-400 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-surface-canvas">
            <TrophyIcon size={13} /> TU Sport Day 2026
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl">
            สุ่มจับคู่<span className="text-gold-400">แข่งขัน</span>กีฬาสี
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist-300 sm:text-[15px]">
            แต่ละสี — <b className="text-team-blue-soft">ฟ้า</b> <b className="text-team-purple-soft">ม่วง</b>{' '}
            <b className="text-team-pink-soft">ชมพู</b> <b className="text-team-green-soft">เขียว</b> — มีนักกีฬาและทีมของตัวเองอยู่แล้ว
            กรอกรายชื่อแยกตามสี แล้วให้ระบบ<strong className="font-bold text-white">สุ่มจับคู่แข่งขันรอบแรก (Seed 1)</strong>ให้อย่างเป็นธรรม
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => downloadAllTemplates(store)}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-bold text-surface-canvas shadow-glowGold transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              <DownloadIcon size={16} /> ดาวน์โหลดฟอร์ม Excel (ทุกประเภท)
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-borderLight bg-surface-card/80 px-4 py-2.5 text-sm font-bold text-mist-100 transition hover:border-gold-400/50 hover:text-gold-300"
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
              className="inline-flex items-center gap-2 rounded-xl border border-surface-borderLight bg-surface-card/80 px-4 py-2.5 text-sm font-bold text-mist-100 transition hover:border-gold-400/50 hover:text-gold-300"
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
        <section className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-soft">
          <h2 className="text-sm font-bold uppercase tracking-wide text-mist-300">สัดส่วนนักกีฬาแต่ละสี (รวมทุกประเภทที่มีข้อมูลแล้ว)</h2>
          <div className="mt-4">
            <ColorDistributionBar counts={colorCounts} />
          </div>
        </section>
      )}

      {/* SPORT GROUPS */}
      <section>
        <h2 className="mb-3 text-lg font-extrabold uppercase tracking-wide text-mist-100">ประเภทกีฬา</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SPORT_GROUPS.map((g) => {
            const done = g.events.filter((ev) => store[ev.code]?.colorBracket || store[ev.code]?.unitBracket).length
            const Icon = SPORT_ICON[g.name]
            const pct = g.events.length ? (done / g.events.length) * 100 : 0
            return (
              <Link
                key={g.slug}
                to={`/sport/${g.slug}`}
                className="group corner-cut-sm flex flex-col justify-between border border-surface-border bg-surface-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-gold-400/40 hover:shadow-glowGold"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-raised text-gold-400 transition-colors group-hover:bg-gold-400 group-hover:text-surface-canvas">
                    {Icon && <Icon size={22} />}
                  </div>
                  <h3 className="mt-3 font-bold text-mist-100 group-hover:text-gold-300">{g.name}</h3>
                  <p className="text-xs text-mist-500">{GROUP_BLURB[g.name]}</p>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-mist-400">
                    <span>{g.events.length} รายการ</span>
                    <span className={pct === 100 ? 'text-team-green-soft' : ''}>
                      จับคู่แล้ว {done}/{g.events.length}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-team-green shadow-glowGreen' : 'bg-gold-400'}`}
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
      <section className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-soft sm:p-6">
        <p className="font-extrabold uppercase tracking-wide text-mist-100">วิธีใช้งาน</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'ดาวน์โหลดฟอร์ม Excel รวมทุกประเภท — แต่ละชีตมีคอลัมน์แยกตามสีให้แล้ว (ฟ้า/ม่วง/ชมพู/เขียว)',
            'กรอกรายชื่อนักกีฬา/ทีมของแต่ละสีลงคอลัมน์ของสีนั้น แล้วอัปโหลดไฟล์กลับเข้าระบบ',
            'เข้าไปที่แต่ละประเภทกีฬา กด “สุ่มจับคู่แข่งขัน” ให้ระบบสุ่มคู่ต่อสู้รอบแรกอย่างเป็นธรรม',
            'ได้สายการแข่งขันรอบแรก (Seed 1) ทันที ส่งออกผลเป็น Excel ได้เลย',
          ].map((text, i) => (
            <div key={i} className="relative rounded-xl border border-surface-border bg-surface-sunken p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-xs font-extrabold text-surface-canvas">
                {i + 1}
              </span>
              <p className="mt-2.5 text-xs leading-relaxed text-mist-400">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button onClick={() => exportAllResults(store)} className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:underline">
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
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4 shadow-soft">
      <div
        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${
          accent ? 'bg-team-green/15 text-team-green-soft' : 'bg-surface-raised text-mist-400'
        }`}
      >
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-mist-500">{label}</p>
      <p
        className={`mt-0.5 text-2xl font-extrabold [font-variant-numeric:tabular-nums] ${accent ? 'text-team-green-soft' : 'text-mist-100'}`}
      >
        {value.toLocaleString('th-TH')}
        {suffix && <span className="ml-1 text-xs font-semibold text-mist-600">{suffix}</span>}
      </p>
    </div>
  )
}
