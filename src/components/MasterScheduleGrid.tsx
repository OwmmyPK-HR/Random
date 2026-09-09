import { Fragment } from 'react'
import {
  MASTER_SCHEDULE_FOOTNOTES,
  MASTER_SCHEDULE_GROUPS,
  MASTER_SCHEDULE_NOTE,
  MASTER_SCHEDULE_OCT_DAYS,
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
 * ตารางการแข่งขันหลัก (ทางการ) — ถอดความจากตารางต้นฉบับที่ได้รับ ครอบคลุมกีฬาทุกประเภทของงาน
 * (ไม่ใช่แค่ 33 รายการที่ระบบนี้จับสลากให้) เป็นข้อมูลอ้างอิงสำหรับดูภาพรวมทั้งงานเท่านั้น
 */
export function MasterScheduleGrid() {
  const octDates = MASTER_SCHEDULE_OCT_DAYS.map((d) => new Date(2026, 9, d))

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
              <th className="sticky left-[56px] z-10 min-w-[150px] border border-surface-border bg-surface-sunken px-2 py-1.5 text-left text-[10px] text-mist-400">
                กีฬา
              </th>
              <th className="min-w-[170px] border border-surface-border bg-surface-sunken px-2 py-1.5 text-left text-[10px] text-mist-400">
                สถานที่แข่งขัน
              </th>
              {octDates.map((d) => (
                <th key={d.getDate()} className="w-6 border border-surface-border bg-surface-sunken px-0 py-1 text-center">
                  <div className="text-[8px] leading-none text-mist-500">{thaiWeekdayAbbr(d)}</div>
                  <div className="text-[10px] font-bold leading-tight text-mist-200">{d.getDate()}</div>
                </th>
              ))}
              <th className="min-w-[52px] border border-surface-border bg-surface-sunken px-1 py-1 text-center text-[9px] text-mist-400">
                ธ.ค.-69
              </th>
            </tr>
          </thead>
          <tbody>
            {MASTER_SCHEDULE_GROUPS.map((group) => (
              <Fragment key={group.title}>
                <tr>
                  <td
                    colSpan={MASTER_SCHEDULE_OCT_DAYS.length + 4}
                    className="border border-surface-border bg-surface-raised px-2 py-1 text-[11px] font-bold text-mist-200"
                  >
                    {group.title}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.no}>
                    <td className="sticky left-0 z-10 border border-surface-border bg-surface-card px-2 py-1 text-[10px] text-mist-500">
                      {row.no}
                    </td>
                    <td className="sticky left-[56px] z-10 border border-surface-border bg-surface-card px-2 py-1 font-semibold text-mist-100">
                      {row.sport}
                    </td>
                    <td className="border border-surface-border px-2 py-1 text-mist-400">{row.venue || '—'}</td>
                    {MASTER_SCHEDULE_OCT_DAYS.map((d) => (
                      <DayCell key={d} type={row.cells[d]} />
                    ))}
                    <td
                      className={`h-8 w-[52px] border border-surface-border text-center text-[10px] font-extrabold ${
                        row.dec ? 'bg-[#F4E7C8] text-[#6B4E0E]' : 'bg-surface-raised/50'
                      }`}
                    >
                      {row.dec?.label ?? ''}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-mist-500">
        <Legend swatch="bg-team-green/70" label="วันแข่งขัน" />
        <Legend swatch="bg-gold-400" label='ชิงอันดับ 3 ("3rd")' />
        <Legend swatch="bg-team-blue/80" label='รอบชิงชนะเลิศ ("F")' />
        <Legend swatch="bg-orange-400" label="รอบชิงฟุตซอล (อาจเปลี่ยนวัน)" />
        <Legend swatch="bg-[#F4E7C8]" label="กีฬาพื้นบ้าน/งานเลี้ยง (18 ธ.ค.)" />
      </div>
      <ul className="list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-mist-500">
        {MASTER_SCHEDULE_FOOTNOTES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  )
}
