import { describe, expect, it } from 'vitest'
import { formatThaiDateFull, formatThaiDateShort } from './date'

describe('formatThaiDateFull', () => {
  it('formats an ISO date as a full Thai date with the Buddhist-era year', () => {
    // 2026-10-01 เป็นวันพฤหัสบดี
    expect(formatThaiDateFull('2026-10-01')).toBe('วันพฤหัสบดีที่ 1 ตุลาคม 2569')
  })

  it('returns the input unchanged when it cannot be parsed', () => {
    expect(formatThaiDateFull('not-a-date')).toBe('not-a-date')
  })
})

describe('formatThaiDateShort', () => {
  it('formats with the standard Thai month abbreviation and 2-digit Buddhist year', () => {
    expect(formatThaiDateShort('2026-10-01')).toBe('1 ต.ค. 69')
    expect(formatThaiDateShort('2026-01-05')).toBe('5 ม.ค. 69')
  })
})
