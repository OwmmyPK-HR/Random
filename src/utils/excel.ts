import * as XLSX from 'xlsx'
import { EVENTS, getEventByCode } from '../data/events'
import { COLORS } from '../types'
import type { BracketPair, ColorName, EntryShape, EventState, ResultMap, RosterEntry, SportEvent, StoreShape } from '../types'

const HEADERS: Record<EntryShape, string[]> = {
  individual: ['ลำดับ', 'ชื่อ-นามสกุล', 'หมายเหตุ'],
  pair: ['ลำดับ', 'ชื่อคู่ที่ 1', 'ชื่อคู่ที่ 2', 'หมายเหตุ'],
  pairMixed: ['ลำดับ', 'ชื่อ (ฝ่ายชาย)', 'ชื่อ (ฝ่ายหญิง)', 'หมายเหตุ'],
  team3: ['ลำดับ', 'ชื่อทีม (ถ้ามี)', 'สมาชิกคนที่ 1', 'สมาชิกคนที่ 2', 'สมาชิกคนที่ 3', 'หมายเหตุ'],
}

function eventTitle(ev: SportEvent): string {
  const parts = [ev.sportGroup, ev.name, ev.genderLabel === 'ผสม' ? 'ประเภทผสม' : `ประเภท${ev.genderLabel}`]
  if (ev.ageLabel) parts.push(ev.ageLabel)
  return `แบบฟอร์มลงทะเบียน: ${parts.join(' | ')}`
}

/** ชื่อชีตใน Excel: "<code> <ชื่อรายการย่อ>" — โค้ดใช้จับคู่ข้อมูลตอนอัปโหลด (ไม่แสดงในหน้าเว็บ) */
export function sheetNameForEvent(ev: SportEvent): string {
  const ageShort = ev.ageLabel ? ' ' + ev.ageLabel.replace('อายุ ', '').replace(' ปีขึ้นไป', '+') : ''
  const raw = `${ev.code} ${ev.name}${ageShort}`
  const safe = raw.replace(/[[\]*?/\\:]/g, '')
  return safe.length > 31 ? safe.slice(0, 31) : safe
}

function rowFromEntry(shape: EntryShape, idx: number, r: RosterEntry): (string | number)[] {
  switch (shape) {
    case 'individual':
      return [idx, r.name1 ?? '', r.note ?? '']
    case 'pair':
    case 'pairMixed':
      return [idx, r.name1 ?? '', r.name2 ?? '', r.note ?? '']
    case 'team3':
      return [idx, r.teamName ?? '', r.name1 ?? '', r.name2 ?? '', r.name3 ?? '', r.note ?? '']
  }
}

function sheetForEvent(ev: SportEvent, rows: RosterEntry[] = []): XLSX.WorkSheet {
  const headers = HEADERS[ev.entryShape]
  const aoa: (string | number)[][] = [[eventTitle(ev)], [], headers]
  rows.forEach((r, i) => aoa.push(rowFromEntry(ev.entryShape, i + 1, r)))
  if (rows.length === 0) {
    for (let i = 1; i <= 24; i++) aoa.push([i])
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = headers.map((h) => ({ wch: h === 'ลำดับ' ? 8 : h.includes('หมายเหตุ') ? 22 : 26 }))
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]
  return ws
}

/** ดาวน์โหลดฟอร์ม Excel สำหรับ 1 ประเภทกีฬา */
export function downloadSingleTemplate(ev: SportEvent, existing: RosterEntry[] = []) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheetForEvent(ev, existing), sheetNameForEvent(ev).replace(/^\S+\s/, '') || 'Sheet1')
  const filename = `แบบฟอร์ม_${ev.sportGroup}_${ev.name}${ev.ageLabel ? '_' + ev.ageLabel : ''}.xlsx`
  XLSX.writeFile(wb, sanitizeFilename(filename))
}

/** ดาวน์โหลดฟอร์ม Excel รวมทุกประเภทกีฬา (33 ชีต) ในไฟล์เดียว สำหรับกรอกครั้งเดียวแล้วอัปโหลดทีเดียว */
export function downloadAllTemplates(existingByCode?: StoreShape) {
  const wb = XLSX.utils.book_new()
  for (const ev of EVENTS) {
    const rows = existingByCode?.[ev.code]?.roster ?? []
    XLSX.utils.book_append_sheet(wb, sheetForEvent(ev, rows), sheetNameForEvent(ev))
  }
  XLSX.writeFile(wb, 'แบบฟอร์มลงทะเบียน_TU_Sport_Day_2026_ทุกประเภท.xlsx')
}

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '-')
}

function cell(v: unknown): string {
  if (v === undefined || v === null) return ''
  return String(v).trim()
}

function parseRowsForShape(shape: EntryShape, aoa: unknown[][], headerRowIdx: number): RosterEntry[] {
  const out: RosterEntry[] = []
  for (let r = headerRowIdx + 1; r < aoa.length; r++) {
    const row = aoa[r] ?? []
    if (shape === 'individual') {
      const name1 = cell(row[1])
      if (!name1) continue
      out.push({ id: crypto.randomUUID(), name1, note: cell(row[2]) || undefined })
    } else if (shape === 'pair' || shape === 'pairMixed') {
      const name1 = cell(row[1])
      const name2 = cell(row[2])
      if (!name1 && !name2) continue
      out.push({ id: crypto.randomUUID(), name1, name2, note: cell(row[3]) || undefined })
    } else if (shape === 'team3') {
      const teamName = cell(row[1])
      const name1 = cell(row[2])
      const name2 = cell(row[3])
      const name3 = cell(row[4])
      if (!teamName && !name1 && !name2 && !name3) continue
      out.push({ id: crypto.randomUUID(), teamName: teamName || undefined, name1, name2, name3, note: cell(row[5]) || undefined })
    }
  }
  return out
}

function findHeaderRow(aoa: unknown[][]): number {
  for (let i = 0; i < aoa.length; i++) {
    const first = cell(aoa[i]?.[0])
    if (first === 'ลำดับ') return i
  }
  return 2 // โครงสร้างมาตรฐานที่สร้างเอง: แถว 0 = หัวข้อ, 1 = ว่าง, 2 = หัวตาราง
}

export interface ParseResult {
  parsed: Record<string, RosterEntry[]> // key = event code
  unmatchedSheets: string[]
}

/** อ่านไฟล์ Excel ที่อัปโหลด (รองรับทั้งไฟล์รวมทุกประเภท และไฟล์รายประเภทเดียว) */
export async function parseWorkbookFile(file: File): Promise<ParseResult> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const parsed: Record<string, RosterEntry[]> = {}
  const unmatchedSheets: string[] = []

  for (const sheetName of wb.SheetNames) {
    const code = sheetName.split(' ')[0].trim()
    const ev = getEventByCode(code)
    const ws = wb.Sheets[sheetName]
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '' })
    if (!ev) {
      // ไฟล์เดี่ยว: ถ้ามีชีตเดียวและไม่ match code ให้ข้ามแบบเงียบ ๆ ไม่ต้องแจ้งเตือน (มักเกิดจากเปลี่ยนชื่อชีต)
      if (wb.SheetNames.length > 1) unmatchedSheets.push(sheetName)
      continue
    }
    const headerRowIdx = findHeaderRow(aoa)
    const rows = parseRowsForShape(ev.entryShape, aoa, headerRowIdx)
    if (rows.length > 0) parsed[ev.code] = rows
  }

  return { parsed, unmatchedSheets }
}

/**
 * อ่านไฟล์ Excel รายประเภทเดียว โดยไม่สนใจว่าชื่อชีตจะตรง code หรือไม่
 * (ใช้กับปุ่ม "อัปโหลด" ในหน้ารายการย่อยแต่ละประเภท ที่ผู้ใช้ตั้งใจอัปโหลดให้ประเภทนี้อยู่แล้ว)
 */
export async function parseWorkbookFileForEvent(file: File, ev: SportEvent): Promise<RosterEntry[]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheetName = wb.SheetNames.find((n) => n.split(' ')[0].trim() === ev.code) ?? wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '' })
  const headerRowIdx = findHeaderRow(aoa)
  return parseRowsForShape(ev.entryShape, aoa, headerRowIdx)
}

function entryLabel(entry: RosterEntry): string {
  if (entry.teamName) return `${entry.teamName} (${[entry.name1, entry.name2, entry.name3].filter(Boolean).join(', ')})`
  return [entry.name1, entry.name2, entry.name3].filter(Boolean).join(' - ')
}

function colorResultSheet(result: ResultMap): XLSX.WorkSheet {
  const maxLen = Math.max(...COLORS.map((c) => result[c].length), 0)
  const aoa: (string | number)[][] = [['สี ' + COLORS.join(' | จำนวน / สี '), '', '', '']]
  aoa[0] = COLORS.map((c) => `สี${c} (${result[c].length} คน/หน่วย)`)
  for (let i = 0; i < maxLen; i++) {
    aoa.push(COLORS.map((c) => (result[c][i] ? entryLabel(result[c][i]) : '')))
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = COLORS.map(() => ({ wch: 30 }))
  return ws
}

function bracketSheet(ev: SportEvent, state: EventState): XLSX.WorkSheet {
  const aoa: (string | number)[][] = [['คู่แข่งขันรอบแรก (Seed 1)']]
  aoa.push([])
  if (ev.mode === 'colorTeam' && state.colorBracket) {
    const [c0, c1, c2, c3] = state.colorBracket
    aoa.push(['คู่ที่ 1', `สี${c0}`, 'vs', `สี${c1}`])
    aoa.push(['คู่ที่ 2', `สี${c2}`, 'vs', `สี${c3}`])
  } else if (state.unitBracket) {
    aoa.push(['คู่ที่', 'ผู้แข่งขัน / ทีม 1', 'สี', '', 'ผู้แข่งขัน / ทีม 2', 'สี'])
    state.unitBracket.forEach((p: BracketPair, i: number) => {
      aoa.push([
        i + 1,
        p.a.label,
        `สี${p.a.color}`,
        p.b ? 'vs' : '',
        p.b ? p.b.label : 'ผ่านเข้ารอบถัดไป (บาย)',
        p.b ? `สี${p.b.color}` : '',
      ])
    })
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 10 }, { wch: 28 }, { wch: 10 }, { wch: 6 }, { wch: 28 }, { wch: 10 }]
  return ws
}

/** ส่งออกผลการสุ่ม + สายการแข่งขันรอบแรก ของ 1 ประเภทกีฬา เป็น Excel */
export function exportEventResult(ev: SportEvent, state: EventState) {
  if (!state.result) return
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, colorResultSheet(state.result), 'ผลการแบ่งสี')
  XLSX.utils.book_append_sheet(wb, bracketSheet(ev, state), 'รอบแรก (Seed 1)')
  const filename = `ผลสุ่ม_${ev.sportGroup}_${ev.name}${ev.ageLabel ? '_' + ev.ageLabel : ''}.xlsx`
  XLSX.writeFile(wb, sanitizeFilename(filename))
}

/** ส่งออกสรุปผลทุกประเภทกีฬาที่สุ่มแล้ว เป็นไฟล์ Excel เดียว (ชีตสรุป + ชีตรายละเอียดของแต่ละประเภท) */
export function exportAllResults(store: StoreShape) {
  const wb = XLSX.utils.book_new()

  const summaryAoa: (string | number)[][] = [
    ['หมวดกีฬา', 'รายการ', 'ประเภท', 'รุ่นอายุ', 'สีฟ้า', 'สีม่วง', 'สีชมพู', 'สีเขียว', 'รวม', 'สถานะ'],
  ]

  let anyResult = false
  for (const ev of EVENTS) {
    const state = store[ev.code]
    const result = state?.result
    const counts = COLORS.map((c) => result?.[c]?.length ?? 0)
    const total = counts.reduce((a, b) => a + b, 0)
    summaryAoa.push([
      ev.sportGroup,
      ev.name,
      ev.genderLabel,
      ev.ageLabel ?? '-',
      counts[0],
      counts[1],
      counts[2],
      counts[3],
      total,
      result ? 'สุ่มแล้ว' : 'ยังไม่สุ่ม',
    ])
    if (result) anyResult = true
  }
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryAoa)
  summaryWs['!cols'] = [
    { wch: 14 }, { wch: 26 }, { wch: 8 }, { wch: 14 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
  ]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'สรุปทุกประเภท')

  if (anyResult) {
    for (const ev of EVENTS) {
      const state = store[ev.code]
      if (!state?.result) continue
      const sheetName = sheetNameForEvent(ev)
      XLSX.utils.book_append_sheet(wb, colorResultSheet(state.result), sheetName)
    }
  }

  XLSX.writeFile(wb, 'สรุปผลสุ่มสายกีฬาสี_TU_Sport_Day_2026.xlsx')
}
