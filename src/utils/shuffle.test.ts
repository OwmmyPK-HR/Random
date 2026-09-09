import { describe, expect, it } from 'vitest'
import { COLORS, type ColorName, type ResultMap, type RosterEntry } from '../types'
import { drawRoundRobin, drawUnitBracket, entryLabel, groupRosterByColor } from './shuffle'

function entry(color: ColorName, name1: string): RosterEntry {
  return { id: `${color}-${name1}`, color, name1 }
}

describe('groupRosterByColor', () => {
  it('places every entry under its own color, and only that color', () => {
    const roster = [entry('ฟ้า', 'A'), entry('ม่วง', 'B'), entry('ฟ้า', 'C')]
    const grouped = groupRosterByColor(roster)
    expect(grouped.ฟ้า.map((e) => e.name1)).toEqual(['A', 'C'])
    expect(grouped.ม่วง.map((e) => e.name1)).toEqual(['B'])
    expect(grouped.ชมพู).toHaveLength(0)
    expect(grouped.เขียว).toHaveLength(0)
  })

  it('returns all 4 color keys even for an empty roster', () => {
    const grouped = groupRosterByColor([])
    expect(Object.keys(grouped).sort()).toEqual([...COLORS].sort())
  })
})

describe('drawRoundRobin', () => {
  it('produces exactly the 6 unique color pairs, every color meeting every other exactly once', () => {
    const matches = drawRoundRobin()
    expect(matches).toHaveLength(6)

    const seen = new Set<string>()
    const playedAgainst: Record<ColorName, Set<ColorName>> = {
      ฟ้า: new Set(),
      ม่วง: new Set(),
      ชมพู: new Set(),
      เขียว: new Set(),
    }
    for (const [a, b] of matches) {
      expect(a).not.toBe(b)
      const key = [a, b].sort().join('-')
      expect(seen.has(key)).toBe(false) // ไม่มีคู่ซ้ำ
      seen.add(key)
      playedAgainst[a].add(b)
      playedAgainst[b].add(a)
    }

    // ทุกสีต้องเจอกับอีก 3 สีที่เหลือครบ (พบกันหมดจริง)
    for (const c of COLORS) {
      expect(playedAgainst[c].size).toBe(3)
    }
  })

  it('randomizes the fixture order across calls (not always the same sequence)', () => {
    const orders = new Set<string>()
    for (let i = 0; i < 20; i++) {
      orders.add(drawRoundRobin().map(([a, b]) => `${a}${b}`).join('|'))
    }
    // ด้วยการสุ่มจริง ไม่ควรได้ลำดับเดียวกันทุกครั้งจาก 20 รอบ
    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('drawUnitBracket', () => {
  it('pairs every entry exactly once, and gives the last one a bye when the count is odd', () => {
    const result: ResultMap = {
      ฟ้า: [entry('ฟ้า', 'A1'), entry('ฟ้า', 'A2')],
      ม่วง: [entry('ม่วง', 'B1')],
      ชมพู: [],
      เขียว: [entry('เขียว', 'D1'), entry('เขียว', 'D2')],
    }
    const pairs = drawUnitBracket(result)
    const totalUnits = 5
    expect(pairs).toHaveLength(Math.ceil(totalUnits / 2))

    const labelsSeen: string[] = []
    let byes = 0
    for (const p of pairs) {
      labelsSeen.push(p.a.label)
      if (p.b) labelsSeen.push(p.b.label)
      else byes++
    }
    expect(byes).toBe(1) // จำนวนคี่ (5 คน) ต้องมี 1 บาย
    expect(labelsSeen.sort()).toEqual(['A1', 'A2', 'B1', 'D1', 'D2'].sort())
  })

  it('returns no matches for an empty result map', () => {
    const empty: ResultMap = { ฟ้า: [], ม่วง: [], ชมพู: [], เขียว: [] }
    expect(drawUnitBracket(empty)).toEqual([])
  })
})

describe('entryLabel', () => {
  it('prefers the team name, falling back to joined member names', () => {
    expect(entryLabel({ id: '1', color: 'ฟ้า', name1: 'สมชาย', name2: 'สมหญิง' })).toBe('สมชาย - สมหญิง')
    expect(entryLabel({ id: '2', color: 'ฟ้า', name1: 'ก', name2: 'ข', name3: 'ค', teamName: 'ทีมเทพ' })).toBe('ทีมเทพ')
  })
})
