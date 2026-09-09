import {
  MASTER_SCHEDULE_FOOTNOTES,
  MASTER_SCHEDULE_NOTE,
  MASTER_SCHEDULE_ROWS,
  type ScheduleCellType,
} from '../data/masterSchedule'
import { thaiWeekdayAbbr } from '../utils/date'
import { InfoIcon } from './Icons'

const CELL_STYLE: Record<ScheduleCellType, string> = {
  compete: 'bg-team-green/70',
  third: 'bg-gold-400',
  final: 'bg-team-blue/80',
  finalAlert: 'bg-orange-400',
}

const CELL_LABEL: Record<ScheduleCellType, string> = {
  compete: '',
  third: '3rd',
  final: 'F',
  finalAlert: 'F',
}

// คอลัมน์วัน: ตุลาคม 1-31 ตามด้วยพฤศจิกายน 1-15 (ตรงกับช่วงที่ตารางต้นฉบับระบุไว้)
const OCT_DAYS = Array.from({ length: 31 }, (_, i) => ({ month: 10 as const, day: i + 1 }))
const NOV_DAYS = Array.from({ length: 15 }, (_, i) => ({ month: 11 as const, day: i + 1 }))
const ALL_DAYS = [...OCT_DAYS, ...NOV_DAYS]

function DayCell({ type }: { type?: ScheduleCellType }) {
  if (!type) return <td className="h-8 w-6 border border-surface-border bg-surface-raised/50" />
  return (
    <td className={`h-8 w-6 border border-surface-border text-center text-[9px] font-extrabold text-white ${CELL_STYLE[type]}`}>
      {CELL_LABEL[type]}
    </td>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${swatch}`} />
      {label}
    </span>
  )
}

/**
 * ตารางการแข่งขันหลัก (ทางการ) — ถอดความจากไฟล์ CSV ต้นฉบับที่ได้รับ ครอบคลุมเฉพาะ 7 ประเภทกีฬาที่ระบบนี้จับสลากให้
 * ช่องที่ทำเครื่องหมายคือวันที่ "มีสิทธิ์แข่งได้" ตามตารางจอง ไม่ใช่ทุกวันจะมีการแข่งจริงเสมอไป
 */
export function MasterScheduleGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-gold-500/30 bg-gold-400/10 p-3 text-xs text-mist-300">
        <InfoIcon size={15} className="mt-0.5 shrink-0 text-accent" />
        <p>{MASTER_SCHEDULE_NOTE}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card shadow-soft">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[56px] border border-surface-border bg-surface-sunken px-2 py-1.5 text-left text-[10px] text-mist-400">
                ลำดับ
              </th>
              <th className="sticky left-[56px] z-10 min-w-[130px] border border-surface-border bg-surface-sunken px-2 py-1.5 text-left text-[10px] text-mist-400">
                กีฬา
              </th>
              <th className="min-w-[170px] border border-surface-border bg-surface-sunken px-2 py-1.5 text-left text-[10px] text-mist-400">
                สถานที่แข่งขัน
              </th>
              {ALL_DAYS.map(({ month, day }, i) => (
                <th
                  key={`${month}-${day}`}
                  className={`w-6 border border-surface-border bg-surface-sunken px-0 py-1 text-center ${
                    i > 0 && ALL_DAYS[i - 1].month !== month ? 'border-l-2 border-l-accent/40' : ''
                  }`}
                >
                  <div className="text-[8px] leading-none text-mist-500">{thaiWeekdayAbbr(new Date(2026, month - 1, day))}</div>
                  <div className="text-[10px] font-bold leading-tight text-mist-200">{day}</div>
                </th>
              ))}
            </tr>
            <tr>
              <th colSpan={3} className="sticky left-0 z-10 border border-surface-border bg-surface-sunken">
                <span className="sr-only">รายละเอียดประเภทกีฬา</span>
              </th>
              <th colSpan={31} className="border border-surface-border bg-surface-sunken py-0.5 text-[9px] font-bold text-mist-400">
                ตุลาคม 2569
              </th>
              <th colSpan={15} className="border border-surface-border bg-surface-sunken py-0.5 text-[9px] font-bold text-mist-400">
                พฤศจิกายน 2569
              </th>
            </tr>
          </thead>
          <tbody>
            {MASTER_SCHEDULE_ROWS.map((row) => {
              const cellMap = new Map(row.cells.map((c) => [`${c.month}-${c.day}`, c.type]))
              return (
                <tr key={row.no}>
                  <td className="sticky left-0 z-10 border border-surface-border bg-surface-card px-2 py-1 text-[10px] text-mist-500">
                    {row.no}
                  </td>
                  <td className="sticky left-[56px] z-10 border border-surface-border bg-surface-card px-2 py-1 font-semibold text-mist-100">
                    {row.sport}
                  </td>
                  <td className="border border-surface-border px-2 py-1 text-mist-400">{row.venue}</td>
                  {ALL_DAYS.map(({ month, day }) => (
                    <DayCell key={`${month}-${day}`} type={cellMap.get(`${month}-${day}`)} />
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-mist-500">
        <Legend swatch="bg-team-green/70" label="วันที่มีสิทธิ์แข่งได้" />
        <Legend swatch="bg-gold-400" label='ชิงอันดับ 3 ("3rd")' />
        <Legend swatch="bg-team-blue/80" label='รอบชิงชนะเลิศ ("F")' />
        <Legend swatch="bg-orange-400" label="รอบชิงฟุตซอล (อาจเปลี่ยนวัน)" />
      </div>
      <ul className="list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-mist-500">
        {MASTER_SCHEDULE_FOOTNOTES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  )
}
