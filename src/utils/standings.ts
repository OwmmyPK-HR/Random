import { COLORS, type ColorName, type MatchOutcome } from '../types'

/** คีย์คงที่ของคู่แข่งขัน ไม่ว่าจะส่ง (a,b) หรือ (b,a) เข้ามาก็ได้คีย์เดียวกันเสมอ */
export function matchKey(a: ColorName, b: ColorName): string {
  return COLORS.indexOf(a) < COLORS.indexOf(b) ? `${a}-${b}` : `${b}-${a}`
}

export interface Standing {
  color: ColorName
  played: number
  won: number
  drawn: number
  lost: number
  points: number
}

/** ตารางคะแนนรอบพบกันหมด (ชนะ 3 แต้ม เสมอ 1 แต้ม) เรียงจากคะแนนมากไปน้อย */
export function computeStandings(matches: [ColorName, ColorName][], results: Record<string, MatchOutcome>): Standing[] {
  const table = Object.fromEntries(
    COLORS.map((c) => [c, { color: c, played: 0, won: 0, drawn: 0, lost: 0, points: 0 } satisfies Standing]),
  ) as Record<ColorName, Standing>

  for (const [a, b] of matches) {
    const outcome = results[matchKey(a, b)]
    if (!outcome) continue
    table[a].played++
    table[b].played++
    if (outcome === 'draw') {
      table[a].drawn++
      table[b].drawn++
      table[a].points += 1
      table[b].points += 1
    } else {
      const loser = outcome === a ? b : a
      table[outcome].won++
      table[outcome].points += 3
      table[loser].lost++
    }
  }

  return COLORS.map((c) => table[c]).sort((x, y) => y.points - x.points)
}

/** ครบทุกนัด (6 คู่) แล้วหรือยัง — ครบแล้วถึงจะเติมคู่ชิงอันดับ/ชิงชนะเลิศให้อัตโนมัติได้ */
export function isRoundRobinComplete(matches: [ColorName, ColorName][], results: Record<string, MatchOutcome>): boolean {
  return matches.length > 0 && matches.every(([a, b]) => !!results[matchKey(a, b)])
}
