import { describe, expect, it } from 'vitest'
import { getCandidateDates, getMasterVenue, MASTER_SCHEDULE_ROWS, scheduleCellToIso } from './masterSchedule'
import { SPORT_GROUPS } from './events'

describe('masterSchedule', () => {
  it('every row\'s sport name matches a real sportGroup used by events.ts', () => {
    const groupNames = new Set(SPORT_GROUPS.map((g) => g.name))
    for (const row of MASTER_SCHEDULE_ROWS) {
      expect(groupNames.has(row.sport)).toBe(true)
    }
  })

  it('scheduleCellToIso pads month/day and uses the 2026 event year', () => {
    expect(scheduleCellToIso({ month: 10, day: 3, type: 'compete' })).toBe('2026-10-03')
    expect(scheduleCellToIso({ month: 11, day: 15, type: 'compete' })).toBe('2026-11-15')
  })

  it('getCandidateDates returns the known 3rd-place and final dates for ฟุตบอล in order', () => {
    const dates = getCandidateDates('ฟุตบอล')
    const third = dates.find((d) => d.type === 'third')
    const final = dates.find((d) => d.type === 'final')
    expect(third?.iso).toBe('2026-10-28')
    expect(final?.iso).toBe('2026-10-29')
    // เรียงจากวันที่น้อยไปมากเสมอ
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1].iso <= dates[i].iso).toBe(true)
    }
  })

  it('getMasterVenue returns undefined for a sport not in the source file', () => {
    expect(getMasterVenue('ว่ายน้ำ')).toBeUndefined()
    expect(getMasterVenue('ฟุตบอล')).toBe('สนามมินิสเตเดียม')
  })
})
