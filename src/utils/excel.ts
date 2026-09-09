import * as XLSX from 'xlsx'
import { EVENTS, getEventByCode } from '../data/events'
import { COLORS } from '../types'
import type { BracketPair, EntryShape, EventState, ResultMap, RosterEntry, SportEvent, StoreShape } from '../types'
import { groupRosterByColor } from './shuffle'
import { computeStandings, isRoundRobinComplete, matchKey } from './standings'

// แต่ละสีมีคอลัมน์ของตัวเอง เรียงติดกัน 4 บล็อก (ฟ้า | ม่วง | ชมพู | เขียว)
// ผู้ใช้กรอกรายชื่อของสีไหนก็ลงคอลัมน์ของสีนั้นโดยตรง ไม่ต้องพิมพ์ชื่อสีเอง — จำนวนแต่ละสีไม่ต้องเท่ากัน
const BLOCK_FIELDS: Record<EntryShape, string[]> = {
  individual: ['ชื่อ-นามสกุล'],
  pair: ['ชื่อคนที่ 1', 'ชื่อคนที่ 2'],
  pairMixed: ['ชื่อฝ่ายชาย', 'ชื่อฝ่ายหญิง'],
  team3: ['ชื่อทีม (ถ้ามี)', 'สมาชิกคนที่ 1', 'สมาชิกคนที่ 2', 'สมาชิกคนที่ 3'],
}

// แถวแรกของแต่ละบล็อก ใช้เป็นจุดสังเกตหาตำแหน่งหัวตารางตอนอ่านไฟล์กลับ
const FIRST_FIELD_MARKERS = Array.from(new Set(Object.values(BLOCK_FIELDS).map((f) => f[0])))

function blockWidth(shape: EntryShape): number {
  return BLOCK_FIELDS[shape].length
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

function entryFields(shape: EntryShape, r: RosterEntry): (string | number)[] {
  switch (shape) {
    case 'individual':
      return [r.name1 ?? '']
    case 'pair':
    case 'pairMixed':
      return [r.name1 ?? '', r.name2 ?? '']
    case 'team3':
      return [r.teamName ?? '', r.name1 ?? '', r.name2 ?? '', r.name3 ?? '']
  }
}

function sheetForEvent(ev: SportEvent, roster: RosterEntry[] = []): XLSX.WorkSheet {
  const width = blockWidth(ev.entryShape)
  const totalCols = width * COLORS.length
  const grouped = groupRosterByColor(roster)

  const aoa: (string | number)[][] = [[eventTitle(ev)], ['กรอกรายชื่อของแต่ละสีลงในคอลัมน์ของสีนั้นโดยตรง (จำนวนแต่ละสีไม่ต้องเท่ากัน ไม่ต้องเรียงแถวให้ตรงกัน)']]

  // แถวหัวกลุ่มสี (merge ทับความกว้างของบล็อกนั้น)
  const groupRow: (string | number)[] = new Array(totalCols).fill('')
  COLORS.forEach((c, i) => (groupRow[i * width] = `สี${c}`))
  aoa.push(groupRow)

  // แถวหัวคอลัมน์ย่อย (ซ้ำกันทุกบล็อกสี)
  aoa.push(COLORS.flatMap(() => BLOCK_FIELDS[ev.entryShape]))

  const maxLen = Math.max(...COLORS.map((c) => grouped[c].length), 0)
  const fillRows = Math.max(maxLen, 10)
  for (let i = 0; i < fillRows; i++) {
    aoa.push(COLORS.flatMap((c) => (grouped[c][i] ? entryFields(ev.entryShape, grouped[c][i]) : new Array(width).fill(''))))
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = new Array(totalCols).fill(0).map((_, i) => ({ wch: i % width === 0 && ev.entryShape === 'team3' ? 20 : 18 }))
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    ...(width > 1 ? COLORS.map((_, i) => ({ s: { r: 2, c: i * width }, e: { r: 2, c: i * width + width - 1 } })) : []),
  ]
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

function findHeaderRow(aoa: unknown[][]): number {
  for (let i = 0; i < aoa.length; i++) {
    const first = cell(aoa[i]?.[0])
    if (FIRST_FIELD_MARKERS.includes(first)) return i
  }
  return 3 // โครงสร้างมาตรฐานที่สร้างเอง: 0=หัวข้อ, 1=คำอธิบาย, 2=หัวกลุ่มสี, 3=หัวคอลัมน์ย่อย
}

function parseRowsGroupedByColor(shape: EntryShape, aoa: unknown[][], headerRowIdx: number): RosterEntry[] {
  const width = blockWidth(shape)
  const out: RosterEntry[] = []
  for (let r = headerRowIdx + 1; r < aoa.length; r++) {
    const row = aoa[r] ?? []
    COLORS.forEach((color, ci) => {
      const base = ci * width
      if (shape === 'individual') {
        const name1 = cell(row[base])
        if (!name1) return
        out.push({ id: crypto.randomUUID(), color, name1 })
      } else if (shape === 'pair' || shape === 'pairMixed') {
        const name1 = cell(row[base])
        const name2 = cell(row[base + 1])
        if (!name1 && !name2) return
        out.push({ id: crypto.randomUUID(), color, name1, name2 })
      } else if (shape === 'team3') {
        const teamName = cell(row[base])
        const name1 = cell(row[base + 1])
        const name2 = cell(row[base + 2])
        const name3 = cell(row[base + 3])
        if (!teamName && !name1 && !name2 && !name3) return
        out.push({ id: crypto.randomUUID(), color, teamName: teamName || undefined, name1, name2, name3 })
      }
    })
  }
  return out
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
      if (wb.SheetNames.length > 1) unmatchedSheets.push(sheetName)
      continue
    }
    const headerRowIdx = findHeaderRow(aoa)
    const rows = parseRowsGroupedByColor(ev.entryShape, aoa, headerRowIdx)
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
  return parseRowsGroupedByColor(ev.entryShape, aoa, headerRowIdx)
}

function entryLabel(entry: RosterEntry): string {
  if (entry.teamName) return `${entry.teamName} (${[entry.name1, entry.name2, entry.name3].filter(Boolean).join(', ')})`
  return [entry.name1, entry.name2, entry.name3].filter(Boolean).join(' - ')
}

function colorResultSheet(result: ResultMap): XLSX.WorkSheet {
  const maxLen = Math.max(...COLORS.map((c) => result[c].length), 0)
  const aoa: (string | number)[][] = [COLORS.map((c) => `สี${c} (${result[c].length} คน/หน่วย)`)]
  for (let i = 0; i < maxLen; i++) {
    aoa.push(COLORS.map((c) => (result[c][i] ? entryLabel(result[c][i]) : '')))
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = COLORS.map(() => ({ wch: 30 }))
  return ws
}

function bracketSheet(ev: SportEvent, state: EventState): XLSX.WorkSheet {
  const aoa: (string | number)[][] = [['ผลการจับสลาก']]
  aoa.push([])
  if (ev.mode === 'colorTeam' && state.colorBracket) {
    const results = state.matchResults ?? {}
    aoa.push(['รอบแบ่งกลุ่ม (พบกันหมด) — ทุกสีเจอกันอย่างน้อย 1 ครั้ง'])
    aoa.push(['นัดที่', 'ทีมสี 1', '', 'ทีมสี 2', 'ผล'])
    state.colorBracket.forEach(([a, b], i) => {
      const outcome = results[matchKey(a, b)]
      const outcomeLabel = !outcome ? 'ยังไม่แข่ง' : outcome === 'draw' ? 'เสมอ' : `สี${outcome} ชนะ`
      aoa.push([i + 1, `สี${a}`, 'vs', `สี${b}`, outcomeLabel])
    })

    const complete = isRoundRobinComplete(state.colorBracket, results)
    const standings = computeStandings(state.colorBracket, results)
    if (Object.keys(results).length > 0) {
      aoa.push([])
      aoa.push(['ตารางคะแนน', '', 'แข่ง', 'ชนะ', 'เสมอ', 'แพ้', 'คะแนน'])
      standings.forEach((s) => aoa.push([`สี${s.color}`, '', s.played, s.won, s.drawn, s.lost, s.points]))
    }

    aoa.push([])
    aoa.push(['รอบชิงอันดับ' + (complete ? '' : ' (รอผลรอบแบ่งกลุ่มก่อนถึงจะรู้คู่แข่ง)')])
    aoa.push([
      'ชิงอันดับ 3',
      complete ? `สี${standings[2].color}` : 'อันดับ 3 กลุ่ม',
      'vs',
      complete ? `สี${standings[3].color}` : 'อันดับ 4 กลุ่ม',
    ])
    aoa.push([
      'ชิงชนะเลิศ',
      complete ? `สี${standings[0].color}` : 'อันดับ 1 กลุ่ม',
      'vs',
      complete ? `สี${standings[1].color}` : 'อันดับ 2 กลุ่ม',
    ])
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

/** ส่งออกรายชื่อแยกตามสี + สายการแข่งขันรอบแรก ของ 1 ประเภทกีฬา เป็น Excel */
export function exportEventResult(ev: SportEvent, state: EventState) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, colorResultSheet(groupRosterByColor(state.roster)), 'รายชื่อแยกตามสี')
  if (state.colorBracket || state.unitBracket) {
    XLSX.utils.book_append_sheet(wb, bracketSheet(ev, state), 'ผลการจับสลาก')
  }
  const filename = `ผลจับคู่_${ev.sportGroup}_${ev.name}${ev.ageLabel ? '_' + ev.ageLabel : ''}.xlsx`
  XLSX.writeFile(wb, sanitizeFilename(filename))
}

/** ส่งออกสรุปทุกประเภทกีฬาที่มีข้อมูลแล้ว เป็นไฟล์ Excel เดียว (ชีตสรุป + ชีตรายละเอียดของแต่ละประเภท) */
export function exportAllResults(store: StoreShape) {
  const wb = XLSX.utils.book_new()

  const summaryAoa: (string | number)[][] = [
    ['หมวดกีฬา', 'รายการ', 'ประเภท', 'รุ่นอายุ', 'สีฟ้า', 'สีม่วง', 'สีชมพู', 'สีเขียว', 'รวม', 'สถานะ'],
  ]

  let anyData = false
  for (const ev of EVENTS) {
    const state = store[ev.code]
    const roster = state?.roster ?? []
    const grouped = groupRosterByColor(roster)
    const counts = COLORS.map((c) => grouped[c].length)
    const total = counts.reduce((a, b) => a + b, 0)
    const drawn = !!(state?.colorBracket || state?.unitBracket)
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
      total === 0 ? 'ไม่มีข้อมูล' : drawn ? 'จับคู่แล้ว' : 'รอจับคู่',
    ])
    if (total > 0) anyData = true
  }
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryAoa)
  summaryWs['!cols'] = [
    { wch: 14 }, { wch: 26 }, { wch: 8 }, { wch: 14 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
  ]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'สรุปทุกประเภท')

  if (anyData) {
    for (const ev of EVENTS) {
      const state = store[ev.code]
      if (!state?.roster?.length) continue
      const sheetName = sheetNameForEvent(ev)
      XLSX.utils.book_append_sheet(wb, colorResultSheet(groupRosterByColor(state.roster)), sheetName)
    }
  }

  XLSX.writeFile(wb, 'สรุปรายชื่อและผลจับคู่_TU_Sport_Day_2026.xlsx')
}
