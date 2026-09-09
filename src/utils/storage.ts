import { COLORS, type ColorName, type EventState, type RosterEntry, type StoreShape } from '../types'

// เพิ่มเลขเวอร์ชันทุกครั้งที่โครงสร้างข้อมูลเปลี่ยนแบบไม่เข้ากันย้อนหลัง (เช่นเปลี่ยนรูปแบบ colorBracket)
// เพื่อไม่ให้ข้อมูลเก่าที่ค้างอยู่ในเบราว์เซอร์ทำให้แอปพังตอนโหลด
const KEY = 'tu-sportday-random-v2'

function isColorName(v: unknown): v is ColorName {
  return typeof v === 'string' && (COLORS as readonly string[]).includes(v)
}

function sanitizeRoster(raw: unknown): RosterEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((e): e is RosterEntry => {
    if (!e || typeof e !== 'object') return false
    const r = e as Record<string, unknown>
    return typeof r.id === 'string' && isColorName(r.color) && typeof r.name1 === 'string'
  })
}

function isValidColorBracket(v: unknown): v is [ColorName, ColorName][] {
  return (
    Array.isArray(v) &&
    v.every((pair) => Array.isArray(pair) && pair.length === 2 && isColorName(pair[0]) && isColorName(pair[1]))
  )
}

function isValidUnitBracket(v: unknown): v is NonNullable<EventState['unitBracket']> {
  if (!Array.isArray(v)) return false
  return v.every((p) => {
    if (!p || typeof p !== 'object') return false
    const pair = p as Record<string, unknown>
    const a = pair.a as Record<string, unknown> | undefined
    if (!a || typeof a.label !== 'string' || !isColorName(a.color)) return false
    if (pair.b !== undefined) {
      const b = pair.b as Record<string, unknown>
      if (!b || typeof b.label !== 'string' || !isColorName(b.color)) return false
    }
    return true
  })
}

/** ตรวจรูปแบบข้อมูลของแต่ละประเภทกีฬาก่อนใช้งาน — ถ้าโครงสร้างไม่ตรง (เช่นข้อมูลเก่าจากเวอร์ชันก่อนหน้า) จะตัดทิ้งเฉพาะส่วนนั้นแทนที่จะทำให้ทั้งแอปพัง */
function sanitizeEventState(raw: unknown): EventState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  return {
    roster: sanitizeRoster(r.roster),
    colorBracket: isValidColorBracket(r.colorBracket) ? r.colorBracket : undefined,
    unitBracket: isValidUnitBracket(r.unitBracket) ? r.unitBracket : undefined,
    drawnAt: typeof r.drawnAt === 'string' ? r.drawnAt : undefined,
  }
}

export function loadStore(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const result: StoreShape = {}
    for (const [code, state] of Object.entries(parsed as Record<string, unknown>)) {
      const clean = sanitizeEventState(state)
      if (clean) result[code] = clean
    }
    return result
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
