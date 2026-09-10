import { describe, expect, it } from 'vitest'
import type { SportEvent } from '../types'
import { groupEventsByCategory } from './eventGroups'

function ev(code: string, category?: string): SportEvent {
  return {
    code,
    sportGroup: 'เทนนิส',
    groupSlug: 'tennis',
    name: code,
    genderLabel: 'ชาย',
    entryShape: 'individual',
    mode: 'bracket',
    category,
  }
}

describe('groupEventsByCategory', () => {
  it('keeps events without a category as their own single-item, headingless section', () => {
    const sections = groupEventsByCategory([ev('a'), ev('b')])
    expect(sections).toEqual([
      { events: [ev('a')] },
      { events: [ev('b')] },
    ])
  })

  it('groups events sharing a category into one headed section, at the position of its first occurrence', () => {
    const a = ev('a', 'ทีมชายทั่วไป')
    const b = ev('b') // ไม่มีหมวด อยู่คั่นกลาง
    const c = ev('c', 'ทีมชายทั่วไป') // หมวดเดียวกับ a แต่มาทีหลัง (และไม่ได้อยู่ติดกัน)
    const sections = groupEventsByCategory([a, b, c])
    expect(sections).toEqual([
      { heading: 'ทีมชายทั่วไป', events: [a, c] },
      { events: [b] },
    ])
  })

  it('preserves the first-appearance order across multiple distinct categories', () => {
    const a = ev('a', 'X')
    const b = ev('b', 'Y')
    const c = ev('c', 'X')
    const d = ev('d', 'Y')
    const sections = groupEventsByCategory([a, b, c, d])
    expect(sections.map((s) => s.heading)).toEqual(['X', 'Y'])
    expect(sections[0].events).toEqual([a, c])
    expect(sections[1].events).toEqual([b, d])
  })

  it('returns an empty array for an empty input', () => {
    expect(groupEventsByCategory([])).toEqual([])
  })
})
