import type { StoreShape } from '../types'

const KEY = 'tu-sportday-random-v1'

export function loadStore(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoreShape) : {}
  } catch {
    return {}
  }
}

export function saveStore(store: StoreShape) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // เก็บข้อมูลไม่สำเร็จ (เช่น พื้นที่เต็ม) — ปล่อยผ่าน ผู้ใช้ยังใช้งานหน้าปัจจุบันได้
  }
}

export function clearStore() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
