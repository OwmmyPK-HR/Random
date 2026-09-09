import { COLOR_THEME, type BracketPair, type ColorName, type MatchOutcome } from '../types'
import { computeStandings, isRoundRobinComplete, matchKey } from '../utils/standings'
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

function OutcomePicker({
  a,
  b,
  outcome,
  onPick,
}: {
  a: ColorName
  b: ColorName
  outcome?: MatchOutcome
  onPick: (outcome: MatchOutcome | null) => void
}) {
  const pill = (active: boolean, activeBg?: string) =>
    `rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
      active ? 'text-white' : 'bg-surface-raised text-mist-400 hover:text-mist-200'
    }`

  return (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPick(outcome === a ? null : a)}
        className={pill(outcome === a)}
        style={outcome === a ? { backgroundColor: COLOR_THEME[a].base } : undefined}
      >
        สี{a} ชนะ
      </button>
      <button
        onClick={() => onPick(outcome === 'draw' ? null : 'draw')}
        className={pill(outcome === 'draw')}
        style={outcome === 'draw' ? { backgroundColor: 'rgb(var(--mist-500))' } : undefined}
      >
        เสมอ
      </button>
      <button
        onClick={() => onPick(outcome === b ? null : b)}
        className={pill(outcome === b)}
        style={outcome === b ? { backgroundColor: COLOR_THEME[b].base } : undefined}
      >
        สี{b} ชนะ
      </button>
    </div>
  )
}

/**
 * ตารางแข่งขันสำหรับประเภทที่แบ่งทีมตามสี — รอบแบ่งกลุ่มแบบพบกันหมด (ทุกสีเจอกันอย่างน้อย 1 ครั้ง รวม 6 คู่)
 * กรอกผลแต่ละนัดได้ทันที (ชนะ/เสมอ) พอครบ 6 นัด ระบบจะจัดอันดับและเติมคู่ชิงที่ 3 + ชิงชนะเลิศให้อัตโนมัติ
 */
export function ColorBracketView({
  matches,
  results,
  onSetResult,
}: {
  matches: [ColorName, ColorName][]
  results: Record<string, MatchOutcome>
  onSetResult: (a: ColorName, b: ColorName, outcome: MatchOutcome | null) => void
}) {
  const standings = computeStandings(matches, results)
  const complete = isRoundRobinComplete(matches, results)
  const playedCount = matches.filter(([a, b]) => !!results[matchKey(a, b)]).length

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-mist-500">
            รอบแบ่งกลุ่ม (พบกันหมด) · ทุกสีเจอกันอย่างน้อย 1 ครั้ง
          </p>
          <p className="text-[11px] font-semibold text-mist-500">กรอกผลแล้ว {playedCount}/{matches.length} นัด</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map(([a, b], i) => {
            const outcome = results[matchKey(a, b)]
            return (
              <div
                key={i}
                className="animate-popIn rounded-xl border border-surface-border bg-surface-card p-3 shadow-soft"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-mist-500">นัดที่ {i + 1}</p>
                <div className="flex items-center gap-2">
                  <ColorMatchBox color={a} compact />
                  <span className="shrink-0 text-[11px] font-extrabold text-mist-600">VS</span>
                  <ColorMatchBox color={b} compact />
                </div>
                <OutcomePicker a={a} b={b} outcome={outcome} onPick={(o) => onSetResult(a, b, o)} />
              </div>
            )
          })}
        </div>
      </div>

      {playedCount > 0 && (
        <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-card p-3 shadow-soft">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-mist-500">ตารางคะแนน</p>
          <table className="w-full min-w-[360px] text-xs">
            <thead>
              <tr className="text-left text-mist-500">
                <th className="py-1 pr-2 font-semibold">สี</th>
                <th className="px-2 py-1 text-center font-semibold">แข่ง</th>
                <th className="px-2 py-1 text-center font-semibold">ชนะ</th>
                <th className="px-2 py-1 text-center font-semibold">เสมอ</th>
                <th className="px-2 py-1 text-center font-semibold">แพ้</th>
                <th className="py-1 pl-2 text-right font-semibold">คะแนน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {standings.map((s, i) => (
                <tr key={s.color} className={i < 2 && complete ? 'font-bold text-mist-100' : 'text-mist-300'}>
                  <td className="py-1.5 pr-2">
                    <span className="inline-flex items-center gap-1.5">
                      <ColorDot color={s.color} size={9} />
                      สี{s.color}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center [font-variant-numeric:tabular-nums]">{s.played}</td>
                  <td className="px-2 py-1.5 text-center [font-variant-numeric:tabular-nums]">{s.won}</td>
                  <td className="px-2 py-1.5 text-center [font-variant-numeric:tabular-nums]">{s.drawn}</td>
                  <td className="px-2 py-1.5 text-center [font-variant-numeric:tabular-nums]">{s.lost}</td>
                  <td className="py-1.5 pl-2 text-right [font-variant-numeric:tabular-nums]">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!complete && (
            <p className="mt-2 text-[11px] text-mist-500">กรอกผลให้ครบทุกนัดก่อน ระบบถึงจะจัดอันดับสุดท้ายและเติมคู่ชิงให้อัตโนมัติ</p>
          )}
        </div>
      )}

      <div>
        <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-mist-500">
          <TrophyIcon size={13} className="text-accent" /> รอบชิงอันดับ{!complete && ' (รอผลรอบแบ่งกลุ่ม)'}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-soft">
            <p className="mb-2.5 text-[11px] font-bold text-mist-400">ชิงอันดับ 3</p>
            <div className="flex items-center gap-2.5">
              {complete ? <ColorMatchBox color={standings[2].color} compact /> : <PlaceholderMatchBox label="อันดับ 3 กลุ่ม" />}
              <span className="shrink-0 text-xs font-extrabold text-mist-600">VS</span>
              {complete ? <ColorMatchBox color={standings[3].color} compact /> : <PlaceholderMatchBox label="อันดับ 4 กลุ่ม" />}
            </div>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-soft">
            <p className="mb-2.5 text-[11px] font-bold text-mist-400">ชิงชนะเลิศ</p>
            <div className="flex items-center gap-2.5">
              {complete ? <ColorMatchBox color={standings[0].color} compact /> : <PlaceholderMatchBox label="อันดับ 1 กลุ่ม" />}
              <span className="shrink-0 text-xs font-extrabold text-mist-600">VS</span>
              {complete ? <ColorMatchBox color={standings[1].color} compact /> : <PlaceholderMatchBox label="อันดับ 2 กลุ่ม" />}
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
