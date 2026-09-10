import { COLORS, type BracketPair, type ColorName, type ResultMap, type RosterEntry, type SaiBracket } from '../types'

/** สุ่มลำดับด้วย Fisher–Yates */
function fisherYates<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** จับฉลากเบอร์ 1-4 ให้แต่ละสี (คนละเบอร์ ไม่ซ้ำกัน) — ใช้สำหรับลำดับเดินขบวน/พิธีเปิด ฯลฯ ไม่ผูกกับประเภทกีฬาใดโดยเฉพาะ */
export function drawColorNumbers(): Record<ColorName, number> {
  const numbers = fisherYates([1, 2, 3, 4])
  return Object.fromEntries(COLORS.map((c, i) => [c, numbers[i]])) as Record<ColorName, number>
}

/** จัดกลุ่มรายชื่อ/หน่วยแข่งขันตามสีที่กำหนดไว้แล้ว (ไม่มีการสุ่ม — แค่จัดเรียงตามข้อมูลจริง) */
export function groupRosterByColor(roster: RosterEntry[]): ResultMap {
  const result: ResultMap = { ฟ้า: [], ม่วง: [], ชมพู: [], เขียว: [] }
  for (const entry of roster) {
    result[entry.color].push(entry)
  }
  return result
}

/**
 * จับสลากตารางแข่งขันแบบพบกันหมด (Round Robin) ระหว่าง 4 สี — ทุกสีเจอกันอย่างน้อย 1 ครั้ง (รวม 6 คู่)
 * ใช้กับประเภททีมที่แต่ละสีมีทีมของตัวเองอยู่แล้ว (เช่น ฟุตบอล วอลเลย์บอล) โดยไม่ต้องมีรายชื่อนักกีฬา
 * สุ่มแค่ "ลำดับการแข่งขัน" ของ 6 คู่นี้เท่านั้น (คู่ใครคู่มันครบทุกคู่อยู่แล้วโดยธรรมชาติของพบกันหมด)
 */
export function drawRoundRobin(): [ColorName, ColorName][] {
  const pairs: [ColorName, ColorName][] = []
  for (let i = 0; i < COLORS.length; i++) {
    for (let j = i + 1; j < COLORS.length; j++) {
      pairs.push([COLORS[i], COLORS[j]])
    }
  }
  return fisherYates(pairs)
}

export function entryLabel(entry: RosterEntry): string {
  if (entry.teamName) return entry.teamName
  return [entry.name1, entry.name2, entry.name3].filter(Boolean).join(' - ')
}

type Unit = { label: string; color: ColorName }

/** จับคู่หน่วยแข่งขันรอบแรกภายใน 1 กลุ่ม โดยพยายามเลี่ยงไม่ให้คู่แข่งอยู่สีเดียวกัน (ลองสุ่มใหม่สูงสุด 60 ครั้ง) ถ้าจำนวนเป็นเลขคี่ รายการสุดท้ายจะได้ "บาย" ผ่านเข้ารอบถัดไปฟรี */
function pairUpUnits(units: Unit[]): BracketPair[] {
  let best: BracketPair[] | null = null
  let bestConflicts = Infinity

  for (let attempt = 0; attempt < 60; attempt++) {
    const shuffled = fisherYates(units)
    const pairs: BracketPair[] = []
    let conflicts = 0
    for (let i = 0; i < shuffled.length; i += 2) {
      const a = shuffled[i]
      const b = shuffled[i + 1]
      if (b && a.color === b.color) conflicts++
      pairs.push({ a, b })
    }
    if (conflicts < bestConflicts) {
      best = pairs
      bestConflicts = conflicts
    }
    if (conflicts === 0) break
  }

  return best ?? []
}

/**
 * สุ่มแบ่งหน่วยแข่งขันทั้งหมด (คน/คู่/ทีม 3 คน) ออกเป็น 2 สายแข่งขันแยกอิสระ (สาย A / สาย B) ขนาดใกล้เคียงกัน
 * แล้วสุ่มจับคู่แข่งขันรอบแรกแยกภายในแต่ละสาย (พยายามเลี่ยงคู่สีเดียวกันเหมือนเดิม) — ใช้กับเทนนิส/แบดมินตัน/เปตอง (bracket mode)
 */
export function drawUnitBracketBySai(result: ResultMap): SaiBracket[] {
  const units: Unit[] = COLORS.flatMap((color) => result[color].map((entry) => ({ label: entryLabel(entry), color })))
  const shuffled = fisherYates(units)
  const mid = Math.ceil(shuffled.length / 2)
  return [
    { sai: 'A', pairs: pairUpUnits(shuffled.slice(0, mid)) },
    { sai: 'B', pairs: pairUpUnits(shuffled.slice(mid)) },
  ]
}
