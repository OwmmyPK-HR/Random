import { describe, expect, it } from 'vitest'
import { EVENTS, getGroupBySlug } from './events'
import { groupEventsByCategory } from '../utils/eventGroups'

describe('เทนนิส category grouping', () => {
  const tennis = getGroupBySlug('tennis')!

  it('still has all 11 seed-1 tennis events, untouched by the regrouping', () => {
    expect(tennis.events).toHaveLength(11)
    expect(tennis.events.map((ev) => ev.code).sort()).toEqual(
      ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11'].sort(),
    )
  })

  it('folds ชายเดี่ยวทั่วไป/ชายคู่ทั่วไป into the ทีมชายทั่วไป category, and the หญิง equivalents likewise', () => {
    const byCode = Object.fromEntries(tennis.events.map((ev) => [ev.code, ev]))
    expect(byCode['1.1'].category).toBe('ทีมชายทั่วไป') // ทีมชายทั่วไป
    expect(byCode['1.5'].category).toBe('ทีมชายทั่วไป') // ชายเดี่ยวทั่วไป
    expect(byCode['1.9'].category).toBe('ทีมชายทั่วไป') // ชายคู่ทั่วไป

    expect(byCode['1.2'].category).toBe('ทีมหญิงทั่วไป') // ทีมหญิงทั่วไป
    expect(byCode['1.6'].category).toBe('ทีมหญิงทั่วไป') // หญิงเดี่ยวทั่วไป
    expect(byCode['1.10'].category).toBe('ทีมหญิงทั่วไป') // หญิงคู่ทั่วไป
  })

  it('folds the 45+ เดี่ยว events into their matching 45+ ทีม category', () => {
    const byCode = Object.fromEntries(tennis.events.map((ev) => [ev.code, ev]))
    expect(byCode['1.3'].category).toBe(byCode['1.7'].category) // ทีมชาย 45+ กับ ชายเดี่ยว 45+ หมวดเดียวกัน
    expect(byCode['1.4'].category).toBe(byCode['1.8'].category) // ทีมหญิง 45+ กับ หญิงเดี่ยว 45+ หมวดเดียวกัน
    expect(byCode['1.3'].category).not.toBe(byCode['1.1'].category) // ไม่ปนกับรุ่นทั่วไป
  })

  it('leaves คู่ผสมทั่วไป uncategorized (no team-event counterpart to fold into)', () => {
    const mixed = tennis.events.find((ev) => ev.code === '1.11')!
    expect(mixed.category).toBeUndefined()
  })

  it('produces exactly 5 grouped sections on the group page (4 headed team categories + 1 standalone คู่ผสม)', () => {
    const sections = groupEventsByCategory(tennis.events)
    expect(sections).toHaveLength(5)
    expect(sections.filter((s) => s.heading).map((s) => s.heading)).toEqual([
      'ทีมชายทั่วไป',
      'ทีมหญิงทั่วไป',
      'ทีมชาย · อายุ 45 ปีขึ้นไป',
      'ทีมหญิง · อายุ 45 ปีขึ้นไป',
    ])
    const standalone = sections.find((s) => !s.heading)!
    expect(standalone.events.map((ev) => ev.code)).toEqual(['1.11'])
  })

  it('does not leak a category onto events from other sports', () => {
    const others = EVENTS.filter((ev) => !['เทนนิส', 'แบดมินตัน', 'เปตอง'].includes(ev.sportGroup))
    for (const ev of others) {
      expect(ev.category).toBeUndefined()
    }
  })
})

describe('แบดมินตัน category grouping', () => {
  const badminton = getGroupBySlug('badminton')!

  it('still has all 9 seed-1 badminton events, untouched by the regrouping', () => {
    expect(badminton.events).toHaveLength(9)
  })

  it('groups ชายคู่/หญิงคู่/คู่ผสม of the same age bracket under one heading', () => {
    const byCode = Object.fromEntries(badminton.events.map((ev) => [ev.code, ev]))
    expect(byCode['6.1'].category).toBe('รุ่นอายุ 20 ปีขึ้นไป')
    expect(byCode['6.2'].category).toBe('รุ่นอายุ 20 ปีขึ้นไป')
    expect(byCode['6.7'].category).toBe('รุ่นอายุ 20 ปีขึ้นไป')
    expect(byCode['6.3'].category).toBe('รุ่นอายุ 40 ปีขึ้นไป')
    expect(byCode['6.5'].category).toBe('รุ่นอายุ 50 ปีขึ้นไป')
  })

  it('produces exactly 3 headed sections, 3 events each', () => {
    const sections = groupEventsByCategory(badminton.events)
    expect(sections).toHaveLength(3)
    expect(sections.every((s) => s.heading && s.events.length === 3)).toBe(true)
    expect(sections.map((s) => s.heading)).toEqual(['รุ่นอายุ 20 ปีขึ้นไป', 'รุ่นอายุ 40 ปีขึ้นไป', 'รุ่นอายุ 50 ปีขึ้นไป'])
  })
})

describe('เปตอง category grouping', () => {
  const petanque = getGroupBySlug('petanque')!

  it('still has all 7 seed-1 petanque events, untouched by the regrouping', () => {
    expect(petanque.events).toHaveLength(7)
  })

  it('groups เดี่ยว/คู่/ทีม 3 คน of the same gender under one heading', () => {
    const byCode = Object.fromEntries(petanque.events.map((ev) => [ev.code, ev]))
    expect(byCode['7.1'].category).toBe('ประเภทชาย')
    expect(byCode['7.3'].category).toBe('ประเภทชาย')
    expect(byCode['7.6'].category).toBe('ประเภทชาย')
    expect(byCode['7.2'].category).toBe('ประเภทหญิง')
    expect(byCode['7.4'].category).toBe('ประเภทหญิง')
    expect(byCode['7.7'].category).toBe('ประเภทหญิง')
  })

  it('leaves คู่ผสมทั่วไป uncategorized (no matching gender group to fold into)', () => {
    const mixed = petanque.events.find((ev) => ev.code === '7.5')!
    expect(mixed.category).toBeUndefined()
  })

  it('produces exactly 3 sections: ประเภทชาย, ประเภทหญิง, and standalone คู่ผสม', () => {
    const sections = groupEventsByCategory(petanque.events)
    expect(sections).toHaveLength(3)
    expect(sections.filter((s) => s.heading).map((s) => s.heading)).toEqual(['ประเภทชาย', 'ประเภทหญิง'])
    const standalone = sections.find((s) => !s.heading)!
    expect(standalone.events.map((ev) => ev.code)).toEqual(['7.5'])
  })
})
