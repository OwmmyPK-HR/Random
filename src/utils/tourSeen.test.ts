import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hasSeenTour, markTourSeen } from './tourSeen'

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

describe('tourSeen', () => {
  const originalLocalStorage = (globalThis as unknown as { localStorage?: Storage }).localStorage

  beforeEach(() => {
    installFakeLocalStorage()
  })

  afterEach(() => {
    ;(globalThis as unknown as { localStorage?: Storage }).localStorage = originalLocalStorage
  })

  it('reports unseen for a page that has never been marked', () => {
    expect(hasSeenTour('home')).toBe(false)
  })

  it('remembers a page as seen once marked, without affecting other pages', () => {
    markTourSeen('home')
    expect(hasSeenTour('home')).toBe(true)
    expect(hasSeenTour('event')).toBe(false)
  })

  it('marking the same page twice is idempotent', () => {
    markTourSeen('summary')
    markTourSeen('summary')
    expect(hasSeenTour('summary')).toBe(true)
  })
})
