import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVENTS, SPORT_GROUPS } from '../data/events'
import { COLORS } from '../types'
import { useEventStore } from '../store/EventStoreContext'
import { useToast } from '../store/ToastContext'
import { eventsWithDataCount, randomizedCount, totalHeadcount } from '../utils/stats'
import { groupRosterByColor } from '../utils/shuffle'
import { getLastBackupAt } from '../utils/storage'
import { ColorDistributionBar } from '../components/ColorDistributionBar'
import { TeamColorCards } from '../components/TeamColorCards'
import { ShowcasePanel } from '../components/ShowcasePanel'
import { ConfirmDialog } from '../components/ConfirmDialog'
import {
  ChartIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  DiceIcon,
  DownloadIcon,
  InfoIcon,
  TrashIcon,
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

const STEPS = [
  { title: 'ตรวจรายชื่อ', desc: 'ตรวจสอบรายชื่อทีม/นักกีฬาที่เข้าร่วมแยกตามสี' },
  { title: 'ดาวน์โหลด/อัปโหลด', desc: 'กรอกฟอร์ม Excel แล้วอัปโหลดกลับเข้าระบบ' },
  { title: 'จับสลาก', desc: 'เข้าประเภทกีฬา กดสุ่มจับคู่แข่งขันรอบแรก' },
  { title: 'ยืนยันผล', desc: 'ตรวจสอบและส่งออกผลเป็น Excel' },
]

export function HomePage() {
  const { store, bulkSetRoster, resetAll } = useEventStore()
  const { notify } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const totalEvents = EVENTS.length
  const withData = eventsWithDataCount(store)
  const randomized = randomizedCount(store)
  const heads = totalHeadcount(store)
  const neverBackedUp = withData > 0 && !getLastBackupAt()

  const colorCounts = Object.fromEntries(
    COLORS.map((c) => [c, EVENTS.reduce((sum, ev) => sum + groupRosterByColor(store[ev.code]?.roster ?? [])[c].length, 0)]),
  ) as Record<(typeof COLORS)[number], number>

  const handleBulkFile = async (file: File) => {
    try {
      const { parseWorkbookFile } = await import('../utils/excel')
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
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col justify-center rounded-3xl border border-surface-border bg-surface-card p-6 shadow-soft sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-accent">TU Sport Day 2026</p>
          <h1 className="mt-2 max-w-lg text-[26px] font-extrabold leading-tight text-mist-100 sm:text-[32px]">
            สุ่มจับคู่แข่งขันกีฬาสี
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-mist-400">
            กีฬาสร้างคน สร้างมิตรภาพ สร้างธรรมศาสตร์ที่ยิ่งใหญ่กว่าเดิม — แต่ละสีมีนักกีฬาและทีมของตัวเองอยู่แล้ว
            แค่กรอกรายชื่อแยกตามสี แล้วให้ระบบสุ่มจับคู่แข่งขันรอบแรก (Seed 1) ให้อย่างเป็นธรรม
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={async () => {
                const { downloadAllTemplates } = await import('../utils/excel')
                downloadAllTemplates(store)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-contrast shadow-glowAccent transition hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              <DownloadIcon size={16} /> ดาวน์โหลดฟอร์ม Excel
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-borderLight bg-surface-sunken px-4 py-2.5 text-sm font-bold text-mist-200 transition hover:border-accent/50 hover:text-accent"
            >
              <UploadIcon size={16} /> นำเข้า Excel
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
              to="/number-draw"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-borderLight bg-surface-sunken px-4 py-2.5 text-sm font-bold text-mist-200 transition hover:border-accent/50 hover:text-accent"
            >
              <DiceIcon size={16} /> จับฉลากเบอร์ประจำสี
            </Link>
            <Link
              to="/summary"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-borderLight bg-surface-sunken px-4 py-2.5 text-sm font-bold text-mist-200 transition hover:border-accent/50 hover:text-accent"
            >
              <ChartIcon size={16} /> สรุปผล &amp; ส่งออก
            </Link>
            {withData > 0 && (
              <button
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-900/40 px-4 py-2.5 text-sm font-bold text-rose-500 transition hover:bg-rose-500/10"
              >
                <TrashIcon size={16} /> ล้างข้อมูลทั้งหมด
              </button>
            )}
          </div>
        </div>

        <ShowcasePanel />
      </section>

      {/* BACKUP REMINDER */}
      {neverBackedUp && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-400/10 px-4 py-3 text-sm text-mist-300">
          <InfoIcon size={17} className="shrink-0 text-gold-600" />
          <p className="flex-1">
            มีข้อมูลนักกีฬา/ผลจับสลากแล้ว แต่ยังไม่เคย <strong className="font-bold text-mist-100">สำรองข้อมูล</strong> ไว้เลย —
            ถ้าเบราว์เซอร์นี้ล้างข้อมูลหรือเปลี่ยนเครื่อง ข้อมูลทั้งหมดจะหายไป
          </p>
          <Link to="/summary" className="shrink-0 rounded-lg bg-gold-400/20 px-3 py-1.5 text-xs font-bold text-gold-600 hover:bg-gold-400/30">
            ไปสำรองข้อมูลตอนนี้
          </Link>
        </div>
      )}

      {/* TEAM COLOR CARDS */}
      <TeamColorCards />

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
        <h2 className="mb-3 text-lg font-extrabold text-mist-100">ประเภทกีฬา</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SPORT_GROUPS.map((g) => {
            const done = g.events.filter((ev) => store[ev.code]?.colorBracket || store[ev.code]?.unitBracket).length
            const pct = g.events.length ? (done / g.events.length) * 100 : 0
            return (
              <Link
                key={g.slug}
                to={`/sport/${g.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-soft transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
              >
                <div>
                  <div className="relative h-20 w-full overflow-hidden">
                    <img
                      src={`./sports/${g.slug}.png`}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/10 to-transparent" />
                    <img src={`./icons/${g.slug}.png`} alt="" className="absolute bottom-0 left-4 h-9 w-9 translate-y-1/2 drop-shadow-md" />
                  </div>
                  <div className="px-5 pb-1 pt-6">
                    <h3 className="font-bold text-mist-100 group-hover:text-accent">{g.name}</h3>
                    <p className="text-xs text-mist-500">{GROUP_BLURB[g.name]}</p>
                  </div>
                </div>
                <div className="mt-4 px-5 pb-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-mist-400">
                    <span>{g.events.length} รายการ</span>
                    <span className={pct === 100 ? 'text-team-green' : ''}>
                      จับคู่แล้ว {done}/{g.events.length}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-team-green' : 'bg-accent'}`}
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
        <p className="font-extrabold text-mist-100">ขั้นตอนการจับสลาก</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-1 items-center gap-2 sm:gap-0">
              <div className="flex flex-1 items-start gap-3 rounded-xl px-2 py-1 sm:px-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold text-mist-100">{step.title}</span>
                  <span className="block text-xs leading-relaxed text-mist-500">{step.desc}</span>
                </span>
              </div>
              {i < STEPS.length - 1 && <ChevronRightIcon size={16} className="hidden shrink-0 text-mist-600 sm:block" />}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={async () => {
              const { exportAllResults } = await import('../utils/excel')
              exportAllResults(store)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
          >
            <DownloadIcon size={14} /> ส่งออกสรุปผลทั้งหมดตอนนี้
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="ล้างข้อมูลทั้งหมด?"
        message="รายชื่อนักกีฬา ผลการจับสลากของทุกประเภทกีฬา และผลจับฉลากเบอร์ประจำสี จะถูกลบทั้งหมดออกจากเครื่องนี้ การกระทำนี้ย้อนกลับไม่ได้
ถ้าต้องการลบแค่บางประเภท เข้าไปที่หน้าประเภทกีฬานั้นแล้วกด “ลบทั้งหมด” แทนได้"
        confirmLabel="ล้างข้อมูลทั้งหมด"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll()
          setConfirmReset(false)
          notify('ล้างข้อมูลทั้งหมดเรียบร้อย', 'success')
        }}
      />
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
          accent ? 'bg-team-green/15 text-team-green' : 'bg-surface-raised text-mist-400'
        }`}
      >
        {icon}
      </div>
      <p className="text-[11px] font-semibold text-mist-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-extrabold [font-variant-numeric:tabular-nums] ${accent ? 'text-team-green' : 'text-mist-100'}`}>
        {value.toLocaleString('th-TH')}
        {suffix && <span className="ml-1 text-xs font-semibold text-mist-500">{suffix}</span>}
      </p>
    </div>
  )
}
