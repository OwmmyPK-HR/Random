import { describe, expect, it } from 'vitest'
import { sanitizeStoreShape } from './storage'

describe('sanitizeStoreShape', () => {
  it('passes through a well-formed store unchanged', () => {
    const good = {
      '1.9': {
        roster: [{ id: 'a', color: 'ฟ้า', name1: 'สมชาย', name2: 'วิชัย' }],
        colorBracket: undefined,
        unitBracket: [{ a: { label: 'สมชาย - วิชัย', color: 'ฟ้า' } }],
        matchResults: undefined,
        drawnAt: '2026-01-01T00:00:00.000Z',
      },
    }
    const clean = sanitizeStoreShape(good)
    expect(clean['1.9'].roster).toHaveLength(1)
    expect(clean['1.9'].unitBracket).toHaveLength(1)
    expect(clean['1.9'].drawnAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('drops roster entries with an invalid or missing color instead of throwing', () => {
    const bad = {
      '2.1': {
        roster: [
          { id: 'a', color: 'ฟ้า', name1: 'ok' },
          { id: 'b', name1: 'no color field' },
          { id: 'c', color: 'ม่วงสด', name1: 'invalid color value' },
        ],
      },
    }
    const clean = sanitizeStoreShape(bad)
    expect(clean['2.1'].roster).toHaveLength(1)
    expect(clean['2.1'].roster[0].id).toBe('a')
  })

  it('drops a colorBracket saved in the old flat-array shape instead of crashing downstream code', () => {
    // รูปแบบเก่า (ก่อนเปลี่ยนเป็นพบกันหมด): ColorName[] ธรรมดา ไม่ใช่คู่ [ColorName, ColorName][]
    const oldShape = {
      '2.1': {
        roster: [],
        colorBracket: ['ฟ้า', 'ม่วง', 'ชมพู', 'เขียว'],
      },
    }
    const clean = sanitizeStoreShape(oldShape)
    expect(clean['2.1'].colorBracket).toBeUndefined()
  })

  it('keeps only valid match outcomes and drops the field entirely when empty', () => {
    const withResults = {
      '2.1': {
        roster: [],
        matchResults: { 'ฟ้า-ม่วง': 'ฟ้า', 'ชมพู-เขียว': 'draw', 'bad-key': 'not-a-color' },
      },
    }
    const clean = sanitizeStoreShape(withResults)
    expect(clean['2.1'].matchResults).toEqual({ 'ฟ้า-ม่วง': 'ฟ้า', 'ชมพู-เขียว': 'draw' })

    const empty = { '2.1': { roster: [], matchResults: { 'bad-key': 'not-a-color' } } }
    expect(sanitizeStoreShape(empty)['2.1'].matchResults).toBeUndefined()
  })

  it('ignores garbage top-level input without throwing', () => {
    expect(sanitizeStoreShape(null)).toEqual({})
    expect(sanitizeStoreShape('not an object')).toEqual({})
    expect(sanitizeStoreShape({ '2.1': 'also not an object' })).toEqual({})
  })
})
