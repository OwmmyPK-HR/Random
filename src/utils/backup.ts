import type { StoreShape } from '../types'
import { sanitizeStoreShape } from './storage'

const BACKUP_FORMAT = 'tu-sportday-backup'
const BACKUP_VERSION = 2 // ตรงกับเลขเวอร์ชันโครงสร้างข้อมูลใน storage.ts (v2)

interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  data: StoreShape
}

/**
 * สำรองข้อมูลทั้งหมด (รายชื่อ + ผลจับสลาก + ผลแข่งขัน) เป็นไฟล์ .json เดียว ดาวน์โหลดเก็บไว้ได้
 * ต่างจากไฟล์ Excel ตรงที่ไฟล์นี้กู้คืนได้ "ครบ" ทั้งผลจับสลากและผลแข่งขัน ไม่ใช่แค่รายชื่อ
 * ใช้ย้ายข้อมูลข้ามเครื่อง/เบราว์เซอร์ หรือกันเบราว์เซอร์ล้างข้อมูลได้
 */
export function downloadBackupFile(store: StoreShape) {
  const payload: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: store,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `สำรองข้อมูล_TU_Sport_Day_2026_${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface RestoreResult {
  store: StoreShape
  eventCount: number
}

/** อ่านไฟล์สำรองที่ดาวน์โหลดไว้ก่อนหน้า กลับมาเป็นข้อมูลที่ใช้แทนที่ในระบบได้ (ตรวจรูปแบบซ้ำอีกรอบก่อนใช้เสมอ) */
export async function readBackupFile(file: File): Promise<RestoreResult> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('ไฟล์นี้ไม่ใช่ไฟล์ JSON ที่ถูกต้อง')
  }
  const obj = parsed as Partial<BackupFile> | null
  const rawData = obj && typeof obj === 'object' && 'data' in obj ? obj.data : parsed
  const store = sanitizeStoreShape(rawData)
  const eventCount = Object.keys(store).length
  if (eventCount === 0) {
    throw new Error('ไม่พบข้อมูลที่ใช้ได้ในไฟล์นี้ กรุณาใช้ไฟล์สำรองที่ดาวน์โหลดจากระบบนี้เท่านั้น')
  }
  return { store, eventCount }
}
