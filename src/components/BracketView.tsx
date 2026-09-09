import { COLOR_THEME, type BracketPair, type ColorName } from '../types'
import { ColorDot } from './ColorBadge'

function ColorMatchBox({ color }: { color: ColorName }) {
  const theme = COLOR_THEME[color]
  return (
    <div
      className="flex items-center gap-2 rounded-xl border-2 px-4 py-3 font-bold shadow-sm"
      style={{ borderColor: theme.base, color: theme.dark, backgroundColor: theme.light }}
    >
      <ColorDot color={color} size={12} />
      สี{color}
    </div>
  )
}

/** ตารางแข่งรอบแรกสำหรับประเภทที่แบ่งทีมตามสี (4 สี = 4 ทีม แข่ง 2 คู่) */
export function ColorBracketView({ colors }: { colors: ColorName[] }) {
  const [c0, c1, c2, c3] = colors
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {[
        [c0, c1],
        [c2, c3],
      ].map(([a, b], i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">คู่ที่ {i + 1}</p>
          <div className="flex items-center justify-center gap-3">
            <ColorMatchBox color={a} />
            <span className="text-sm font-semibold text-slate-400">VS</span>
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
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 shadow-soft">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">คู่ที่ {i + 1}</p>
          <Side label={p.a.label} color={p.a.color} />
          {p.b ? (
            <>
              <div className="my-1 text-center text-xs font-bold text-slate-300">VS</div>
              <Side label={p.b.label} color={p.b.color} />
            </>
          ) : (
            <div className="mt-1 rounded-lg bg-slate-50 px-2 py-1.5 text-center text-xs font-medium text-slate-400">
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
