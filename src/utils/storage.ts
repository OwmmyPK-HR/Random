import {
  COLORS,
  type ColorName,
  type EventState,
  type MatchOutcome,
  type NumberDrawState,
  type RosterEntry,
  type StoreShape,
} from '../types'

// เพิ่มเลขเวอร์ชันทุกครั้งที่โครงสร้างข้อมูลเปลี่ยนแบบไม่เข้ากันย้อนหลัง (เช่นเปลี่ยนรูปแบบ colorBracket/unitBracket)
// เพื่อไม่ให้ข้อมูลเก่าที่ค้างอยู่ในเบราว์เซอร์ทำให้แอปพังตอนโหลด
export const STORE_KEY = 'tu-sportday-random-v3'
const KEY = STORE_KEY

function isColorName(v: unknown): v is ColorName {
  return typeof v === 'string' && (COLORS as readonly string[]).includes(v)
}

function isMatchOutcome(v: unknown): v is MatchOutcome {
  return v === 'draw' || isColorName(v)
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

function sanitizeMatchResults(v: unknown): Record<string, MatchOutcome> | undefined {
  if (!v || typeof v !== 'object') return undefined
  const out: Record<string, MatchOutcome> = {}
  for (const [key, val] of Object.entries(v as Record<string, unknown>)) {
    if (isMatchOutcome(val)) out[key] = val
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function isValidBracketPair(p: unknown): boolean {
  if (!p || typeof p !== 'object') return false
  const pair = p as Record<string, unknown>
  const a = pair.a as Record<string, unknown> | undefined
  if (!a || typeof a.label !== 'string' || !isColorName(a.color)) return false
  if (pair.b !== undefined) {
    const b = pair.b as Record<string, unknown>
    if (!b || typeof b.label !== 'string' || !isColorName(b.color)) return false
  }
  return true
}

function isValidUnitBracket(v: unknown): v is NonNullable<EventState['unitBracket']> {
  if (!Array.isArray(v)) return false
  return v.every((g) => {
    if (!g || typeof g !== 'object') return false
    const group = g as Record<string, unknown>
    if (group.sai !== 'A' && group.sai !== 'B') return false
    return Array.isArray(group.pairs) && group.pairs.every(isValidBracketPair)
  })
}

/** ตรวจรูปแบบข้อมูลของแต่ละประเภทกีฬาก่อนใช้งาน — ถ้าโครงสร้างไม่ตรง (เช่นข้อมูลเก่าจากเวอร์ชันก่อนหน้า หรือไฟล์สำรองที่แก้ไขมือ) จะตัดทิ้งเฉพาะส่วนนั้นแทนที่จะทำให้ทั้งแอปพัง */
function sanitizeEventState(raw: unknown): EventState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  return {
    roster: sanitizeRoster(r.roster),
    colorBracket: isValidColorBracket(r.colorBracket) ? r.colorBracket : undefined,
    matchResults: sanitizeMatchResults(r.matchResults),
    unitBracket: isValidUnitBracket(r.unitBracket) ? r.unitBracket : undefined,
    drawnAt: typeof r.drawnAt === 'string' ? r.drawnAt : undefined,
  }
}

/** ตรวจและทำความสะอาดข้อมูลทั้งชุด — ใช้ทั้งตอนโหลดจาก localStorage และตอนนำเข้าไฟล์สำรอง (JSON) ที่ผู้ใช้อัปโหลดเอง */
export function sanitizeStoreShape(parsed: unknown): StoreShape {
  if (!parsed || typeof parsed !== 'object') return {}
  const result: StoreShape = {}
  for (const [code, state] of Object.entries(parsed as Record<string, unknown>)) {
    const clean = sanitizeEventState(state)
    if (clean) result[code] = clean
  }
  return result
}

export function loadStore(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return sanitizeStoreShape(JSON.parse(raw))
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

// ----- จับฉลากเบอร์ประจำสี — สถานะแยกต่างหาก ไม่ผูกกับ store รายประเภทกีฬาด้านบน (คนละ key ใน localStorage) -----
export const NUMBER_DRAW_KEY = 'tu-sportday-numberdraw-v1'

/** ต้องเป็นเบอร์ 1-4 ครบทุกสี ไม่ซ้ำกันเลย (การเรียงสับเปลี่ยนของ 1-4 เท่านั้น) — กันข้อมูลเพี้ยนจากไฟล์ที่แก้เอง */
function isValidNumberAssignment(v: unknown): v is Record<ColorName, number> {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  const numbers = COLORS.map((c) => r[c])
  if (!numbers.every((n) => typeof n === 'number' && Number.isInteger(n))) return false
  const sorted = [...(numbers as number[])].sort((a, b) => a - b)
  return sorted.length === 4 && sorted.every((n, i) => n === i + 1)
}

/** ตรวจรูปแบบข้อมูลจับฉลากเบอร์ก่อนใช้งาน — ใช้ทั้งตอนโหลดจาก localStorage และตอนนำเข้าไฟล์สำรอง */
export function sanitizeNumberDrawState(raw: unknown): NumberDrawState {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  return {
    assignment: isValidNumberAssignment(r.assignment) ? r.assignment : undefined,
    drawnAt: typeof r.drawnAt === 'string' ? r.drawnAt : undefined,
  }
}

export function loadNumberDraw(): NumberDrawState {
  try {
    const raw = localStorage.getItem(NUMBER_DRAW_KEY)
    if (!raw) return {}
    return sanitizeNumberDrawState(JSON.parse(raw))
  } catch {
    return {}
  }
}

export function saveNumberDraw(state: NumberDrawState) {
  try {
    localStorage.setItem(NUMBER_DRAW_KEY, JSON.stringify(state))
  } catch {
    // เก็บข้อมูลไม่สำเร็จ (เช่น พื้นที่เต็ม) — ปล่อยผ่าน
  }
}

export function clearNumberDraw() {
  try {
    localStorage.removeItem(NUMBER_DRAW_KEY)
  } catch {
    // ignore
  }
}

// ----- เวลาที่สำรองข้อมูลล่าสุด — ใช้เตือนถ้ามีข้อมูลแล้วแต่ยังไม่เคยกด "สำรองข้อมูล (JSON)" เลย -----
const LAST_BACKUP_KEY = 'tu-sportday-lastbackup-v1'

/** บันทึกเวลาปัจจุบันเป็น "สำรองข้อมูลล่าสุด" — เรียกทุกครั้งที่ผู้ใช้กดดาวน์โหลดไฟล์สำรองสำเร็จ */
export function markBackupTaken() {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
  } catch {
    // ignore
  }
}

/** เวลาที่สำรองข้อมูลล่าสุด (ISO string) หรือ null ถ้ายังไม่เคยสำรองเลยบนเครื่อง/เบราว์เซอร์นี้ */
export function getLastBackupAt(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY)
  } catch {
    return null
  }
}
