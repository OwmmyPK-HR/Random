import { COLOR_THEME, type BracketPair, type ColorName } from '../types'
import { ColorDot } from './ColorBadge'
import { TrophyIcon } from './Icons'

function ColorMatchBox({ color }: { color: ColorName }) {
  const theme = COLOR_THEME[color]
  return (
    <div
      className="flex flex-1 items-center gap-2.5 rounded-xl px-4 py-3.5 font-extrabold text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, ${theme.soft}, ${theme.base})`, boxShadow: `0 0 18px ${theme.base}44` }}
    >
      <ColorDot color={color} size={13} />
      สี{color}
    </div>
  )
}

/** ตารางแข่งรอบแรกสำหรับประเภทที่แบ่งทีมตามสี (4 สี = 4 ทีม แข่ง 2 คู่) */
export function ColorBracketView({ colors }: { colors: ColorName[] }) {
  const [c0, c1, c2, c3] = colors
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {[
        [c0, c1],
        [c2, c3],
      ].map(([a, b], i) => (
        <div key={i} className="rounded-2xl border border-surface-border bg-surface-card p-4 shadow-soft">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-mist-500">
            <TrophyIcon size={13} className="text-accent" /> คู่ที่ {i + 1}
          </p>
          <div className="flex items-center gap-3">
            <ColorMatchBox color={a} />
            <span className="shrink-0 text-xs font-extrabold text-mist-600">VS</span>
            <ColorMatchBox color={b} />
          </div>
        </div>
      ))}
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
