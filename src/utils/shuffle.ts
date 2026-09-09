import { COLORS, type BracketPair, type ColorName, type ResultMap, type RosterEntry } from '../types'

/** สุ่มลำดับด้วย Fisher–Yates */
function fisherYates<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
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

/**
 * สุ่มจับคู่แข่งขันรอบแรก (Seed 1) ระหว่างหน่วยแข่งขันทั้งหมด (คน/คู่/ทีม 3 คน) ที่มีสีกำหนดไว้แล้ว
 * โดยพยายามเลี่ยงไม่ให้คู่แข่งอยู่สีเดียวกัน ถ้าจำนวนเป็นเลขคี่ รายการสุดท้ายจะได้ "บาย" ผ่านเข้ารอบถัดไปฟรี
 */
export function drawUnitBracket(result: ResultMap): BracketPair[] {
  const units = COLORS.flatMap((color) =>
    result[color].map((entry) => ({ label: entryLabel(entry), color })),
  )

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
