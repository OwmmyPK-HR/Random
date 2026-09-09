import { describe, expect, it } from 'vitest'
import {
  EVENT_PERIOD_START,
  getCandidateDates,
  getMasterVenue,
  isWeekend,
  MASTER_SCHEDULE_ROWS,
  scheduleCellToIso,
} from './masterSchedule'
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

  it('isWeekend correctly identifies Saturday/Sunday in Oct-Nov 2026', () => {
    // ตรวจกับปฏิทินจริง: 3 ต.ค. 2569 = วันเสาร์, 4 ต.ค. 2569 = วันอาทิตย์, 13 ต.ค. 2569 = วันอังคาร
    expect(isWeekend(10, 3)).toBe(true)
    expect(isWeekend(10, 4)).toBe(true)
    expect(isWeekend(10, 13)).toBe(false)
    expect(isWeekend(10, 23)).toBe(false)
  })

  it('getCandidateDates never returns a Saturday or Sunday date, for every sport in the table', () => {
    for (const row of MASTER_SCHEDULE_ROWS) {
      const dates = getCandidateDates(row.sport)
      expect(dates.length).toBeGreaterThan(0)
      for (const d of dates) {
        const [y, m, day] = d.iso.split('-').map(Number)
        expect(isWeekend(m as 10 | 11, day)).toBe(false)
        expect(y).toBe(2026)
      }
    }
  })

  it('the whole competition period starts 1 ตุลาคม 2569, matching the source CSV\'s first day column', () => {
    expect(EVENT_PERIOD_START).toEqual({ month: 10, day: 1 })
    // ไม่มีวันไหนในตารางที่อยู่ก่อนวันเริ่มต้นนี้
    for (const row of MASTER_SCHEDULE_ROWS) {
      for (const cell of row.cells) {
        const before = cell.month < EVENT_PERIOD_START.month || (cell.month === EVENT_PERIOD_START.month && cell.day < EVENT_PERIOD_START.day)
        expect(before).toBe(false)
      }
    }
  })
})
