import { COLOR_THEME, type BracketPair, type ColorName } from '../types'
import { ColorDot } from './ColorBadge'
import { TrophyIcon } from './Icons'

function ColorMatchBox({ color, compact }: { color: ColorName; compact?: boolean }) {
  const theme = COLOR_THEME[color]
  return (
    <div
      className={`flex flex-1 items-center gap-2 font-extrabold text-white shadow-sm ${
        compact ? 'rounded-lg px-3 py-2 text-sm' : 'rounded-xl px-4 py-3.5'
      }`}
      style={{ background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`, boxShadow: `0 0 18px ${theme.base}44` }}
    >
      <ColorDot color={color} size={compact ? 10 : 13} />
      สี{color}
    </div>
  )
}

function PlaceholderMatchBox({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-surface-borderLight px-3 py-2 text-center text-xs font-semibold text-mist-500">
      {label}
    </div>
  )
}

/**
 * ตารางแข่งขันสำหรับประเภทที่แบ่งทีมตามสี — รอบแบ่งกลุ่มแบบพบกันหมด (ทุกสีเจอกันอย่างน้อย 1 ครั้ง รวม 6 คู่)
 * ตามด้วยรอบชิงอันดับ 3 และชิงชนะเลิศ ซึ่งต้องรอผลรอบแบ่งกลุ่มก่อนถึงจะรู้ว่าใครเจอใคร
 */
export function ColorBracketView({ matches }: { matches: [ColorName, ColorName][] }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-mist-500">
          รอบแบ่งกลุ่ม (พบกันหมด) · ทุกสีเจอกันอย่างน้อย 1 ครั้ง
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map(([a, b], i) => (
            <div key={i} className="animate-popIn rounded-xl border border-surface-border bg-surface-card p-3 shadow-soft" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-mist-500">นัดที่ {i + 1}</p>
              <div className="flex items-center gap-2">
                <ColorMatchBox color={a} compact />
                <span className="shrink-0 text-[11px] font-extrabold text-mist-600">VS</span>
                <ColorMatchBox color={b} compact />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-mist-500">
          <TrophyIcon size={13} className="text-accent" /> รอบชิงอันดับ (รอผลรอบแบ่งกลุ่ม)
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-soft">
            <p className="mb-2.5 text-[11px] font-bold text-mist-400">ชิงอันดับ 3</p>
            <div className="flex items-center gap-2.5">
              <PlaceholderMatchBox label="อันดับ 3 กลุ่ม" />
              <span className="shrink-0 text-xs font-extrabold text-mist-600">VS</span>
              <PlaceholderMatchBox label="อันดับ 4 กลุ่ม" />
            </div>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-soft">
            <p className="mb-2.5 text-[11px] font-bold text-mist-400">ชิงชนะเลิศ</p>
            <div className="flex items-center gap-2.5">
              <PlaceholderMatchBox label="อันดับ 1 กลุ่ม" />
              <span className="shrink-0 text-xs font-extrabold text-mist-600">VS</span>
              <PlaceholderMatchBox label="อันดับ 2 กลุ่ม" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** ตารางแข่งรอบแรกสำหรับประเภทเดี่ยว/คู่/ทีม 3 คน — สุ่มจับคู่ระหว่างหน่วยแข่งขัน */
export function UnitBracketView({ pairs }: { pairs: BracketPair[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {pairs.map((p, i) => (
        <div
          key={i}
          className="animate-popIn rounded-xl border border-surface-border bg-surface-card p-3 shadow-soft"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-mist-500">คู่ที่ {i + 1}</p>
          <Side label={p.a.label} color={p.a.color} />
          {p.b ? (
            <>
              <div className="my-1 text-center text-[10px] font-extrabold text-mist-600">VS</div>
              <Side label={p.b.label} color={p.b.color} />
            </>
          ) : (
            <div className="mt-1 rounded-lg bg-surface-raised px-2 py-1.5 text-center text-xs font-medium text-mist-500">
              ผ่านเข้ารอบถัดไปอัตโนมัติ (บาย)
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Side({ label, color }: { label: string; color: ColorName }) {
  const theme = COLOR_THEME[color]
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ backgroundColor: theme.light }}>
      <ColorDot color={color} size={9} />
      <span className="truncate text-sm font-medium" style={{ color: theme.dark }}>
        {label}
      </span>
    </div>
  )
}
