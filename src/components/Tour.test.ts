import { describe, expect, it } from 'vitest'
import { computeTooltipPosition } from './Tour'

const VIEWPORT_H = 800

describe('computeTooltipPosition', () => {
  it('places the tooltip below a small target near the top of the viewport', () => {
    const pos = computeTooltipPosition({ top: 50, bottom: 100 }, VIEWPORT_H)
    expect(pos.top).toBeDefined()
    expect(pos.bottom).toBeUndefined()
    expect(pos.top).toBeGreaterThan(100) // ใต้ rect.bottom
  })

  it('places the tooltip above a small target near the bottom of the viewport', () => {
    const pos = computeTooltipPosition({ top: 720, bottom: 780 }, VIEWPORT_H)
    expect(pos.bottom).toBeDefined()
    expect(pos.top).toBeUndefined()
  })

  it('falls back to a centered tooltip when the target is taller than the viewport (no room above or below)', () => {
    // เป้าหมายสูงเกินจอ: บนติดลบ ล่างเลยขอบจอ — บั๊กเดิมจะคำนวณตำแหน่งหลุดจอไปเลย
    const pos = computeTooltipPosition({ top: -400, bottom: 1200 }, VIEWPORT_H)
    expect(pos.top).toBe(VIEWPORT_H / 2)
    expect(pos.transform).toBe('translateY(-50%)')
    expect(pos.bottom).toBeUndefined()
  })

  it('never computes an off-screen top/bottom even when the target rect itself is far outside the viewport', () => {
    for (const rect of [
      { top: -2000, bottom: -1900 }, // เลื่อนผ่านจุดไฮไลต์ไปไกลด้านบนแล้ว
      { top: 5000, bottom: 5100 }, // ยังไม่ได้เลื่อนลงไปถึง
      { top: -50, bottom: 900 }, // ใหญ่กว่าจอเล็กน้อย ขอบทั้งสองด้านเลยจอ
    ]) {
      const pos = computeTooltipPosition(rect, VIEWPORT_H)
      if (pos.top !== undefined) expect(pos.top).toBeGreaterThanOrEqual(0)
      if (pos.bottom !== undefined) expect(pos.bottom).toBeGreaterThanOrEqual(0)
    }
  })
})
