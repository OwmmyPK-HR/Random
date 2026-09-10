import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getLastBackupAt, markBackupTaken, sanitizeNumberDrawState, sanitizeStoreShape } from './storage'

/** จำลอง localStorage แบบง่าย ๆ ในหน่วยความจำ — สภาพแวดล้อมทดสอบเป็น Node ล้วน ไม่มี localStorage จริงให้ใช้ */
function installFakeLocalStorage() {
  const data = new Map<string, string>()
  const fake: Storage = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: (i) => Array.from(data.keys())[i] ?? null,
    get length() {
      return data.size
    },
  }
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = fake
}

describe('sanitizeStoreShape', () => {
  it('passes through a well-formed store unchanged', () => {
    const good = {
      '1.9': {
        roster: [{ id: 'a', color: 'ฟ้า', name1: 'สมชาย', name2: 'วิชัย' }],
        colorBracket: undefined,
        unitBracket: [
          { sai: 'A', pairs: [{ a: { label: 'สมชาย - วิชัย', color: 'ฟ้า' } }] },
          { sai: 'B', pairs: [] },
        ],
        matchResults: undefined,
        drawnAt: '2026-01-01T00:00:00.000Z',
      },
    }
    const clean = sanitizeStoreShape(good)
    expect(clean['1.9'].roster).toHaveLength(1)
    expect(clean['1.9'].unitBracket).toHaveLength(2)
    expect(clean['1.9'].unitBracket?.[0].pairs).toHaveLength(1)
    expect(clean['1.9'].drawnAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('drops a unitBracket saved in the old flat-pairs shape instead of crashing downstream code', () => {
    // รูปแบบเก่า (ก่อนแบ่งสาย A/B): BracketPair[] ธรรมดา ไม่ใช่ { sai, pairs }[]
    const oldShape = {
      '1.9': {
        roster: [],
        unitBracket: [{ a: { label: 'สมชาย - วิชัย', color: 'ฟ้า' } }],
      },
    }
    const clean = sanitizeStoreShape(oldShape)
    expect(clean['1.9'].unitBracket).toBeUndefined()
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

describe('sanitizeNumberDrawState', () => {
  it('passes through a well-formed assignment (a permutation of 1-4) unchanged', () => {
    const good = { assignment: { ฟ้า: 2, ม่วง: 4, ชมพู: 1, เขียว: 3 }, drawnAt: '2026-01-01T00:00:00.000Z' }
    expect(sanitizeNumberDrawState(good)).toEqual(good)
  })

  it('drops an assignment with a duplicate or out-of-range number instead of crashing', () => {
    const duplicate = { assignment: { ฟ้า: 1, ม่วง: 1, ชมพู: 2, เขียว: 3 } }
    expect(sanitizeNumberDrawState(duplicate).assignment).toBeUndefined()

    const outOfRange = { assignment: { ฟ้า: 5, ม่วง: 2, ชมพู: 3, เขียว: 4 } }
    expect(sanitizeNumberDrawState(outOfRange).assignment).toBeUndefined()
  })

  it('drops an assignment missing a color, and ignores garbage input', () => {
    const missing = { assignment: { ฟ้า: 1, ม่วง: 2, ชมพู: 3 } }
    expect(sanitizeNumberDrawState(missing).assignment).toBeUndefined()

    expect(sanitizeNumberDrawState(null)).toEqual({})
    expect(sanitizeNumberDrawState('not an object')).toEqual({})
  })
})

describe('backup reminder tracking', () => {
  const originalLocalStorage = (globalThis as unknown as { localStorage?: Storage }).localStorage

  beforeEach(() => {
    installFakeLocalStorage()
  })

  afterEach(() => {
    ;(globalThis as unknown as { localStorage?: Storage }).localStorage = originalLocalStorage
  })

  it('returns null before any backup has ever been taken', () => {
    expect(getLastBackupAt()).toBeNull()
  })

  it('records a timestamp when a backup is taken, retrievable afterwards', () => {
    markBackupTaken()
    const at = getLastBackupAt()
    expect(at).not.toBeNull()
    expect(Number.isNaN(new Date(at!).getTime())).toBe(false)
  })
})
