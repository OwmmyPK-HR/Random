// ตารางการแข่งขันกีฬาสีบุคลากรมหาวิทยาลัยธรรมศาสตร์ "TU Sport Day 2026"
// ถอดความจากไฟล์ CSV ต้นฉบับ "Final (แก้ไขร่าง) ตารางแข่งขัน TU Sport 2026 re1 14.7.69"
// ไฟล์นี้ให้มาเฉพาะ 7 ประเภทกีฬาที่ระบบนี้จับสลากให้ (เทนนิส/ฟุตซอล/แบดมินตัน/วอลเลย์บอล/บาสเกตบอล/เปตอง/ฟุตบอล)
// ชื่อ "sport" ในไฟล์นี้ตรงกับ SportEvent.sportGroup ในระบบเป๊ะ ๆ ใช้จับคู่ข้อมูล (venue/วันที่ผู้สมัคร) กันได้โดยตรง

export type ScheduleCellType = 'compete' | 'third' | 'final' | 'finalAlert'

export interface ScheduleCell {
  month: 10 | 11 // ตุลาคม / พฤศจิกายน 2569
  day: number
  type: ScheduleCellType
}

export interface MasterScheduleRow {
  no: string
  sport: string // ตรงกับ SportEvent.sportGroup
  venue: string
  days: number // จำนวนวันแข่งที่ต้องใช้จริง (คอลัมน์ที่ทำเครื่องหมายไว้คือ "วันที่เป็นไปได้" ซึ่งอาจมากกว่านี้ เพราะสนาม/ยิมมีจำกัด)
  cells: ScheduleCell[]
}

function compete(entries: [number, number][], month: 10 | 11 = 10): ScheduleCell[] {
  return entries.map(([m, d]) => ({ month: m as 10 | 11, day: d, type: 'compete' as const }))
}

// วันที่ "เป็นไปได้" ชุดเดียวกัน ใช้ซ้ำกับหลายประเภทกีฬาที่ใช้สนามลักษณะเดียวกัน (เทนนิส/แบดมินตัน/เปตอง/ฟุตบอล/ฟุตซอล)
const STANDARD_CANDIDATE_DAYS: [number, number][] = [
  [10, 3],
  [10, 4],
  [10, 10],
  [10, 11],
  [10, 13],
  [10, 17],
  [10, 18],
  [10, 23],
  [10, 24],
  [10, 25],
  [10, 31],
  [11, 1],
  [11, 7],
  [11, 8],
  [11, 14],
  [11, 15],
]

// เกม 2 นัด/วันแบบยิม (วอลเลย์บอล/บาสเกตบอล) มีวันแข่งถี่กว่า
const GYM_CANDIDATE_DAYS: [number, number][] = [
  [10, 3],
  [10, 4],
  [10, 7],
  [10, 8],
  [10, 9],
  [10, 10],
  [10, 11],
  [10, 13],
  [10, 14],
  [10, 15],
  [10, 16],
  [10, 17],
  [10, 18],
  [10, 23],
  [10, 24],
  [10, 25],
  [10, 31],
  [11, 1],
  [11, 7],
  [11, 8],
  [11, 14],
  [11, 15],
]

export const MASTER_SCHEDULE_ROWS: MasterScheduleRow[] = [
  {
    no: '1.3',
    sport: 'เทนนิส',
    venue: 'สนามเทนนิส 2 คอร์ท',
    days: 5,
    cells: compete(STANDARD_CANDIDATE_DAYS),
  },
  {
    no: '1.4',
    sport: 'ฟุตซอล',
    venue: 'แข่งสนามฟุตซอลยิม 7 / ชิงชนะเลิศยิม 6',
    days: 5,
    cells: [
      ...compete(STANDARD_CANDIDATE_DAYS),
      { month: 10, day: 7, type: 'third' },
      { month: 10, day: 9, type: 'finalAlert' },
    ],
  },
  {
    no: '1.6',
    sport: 'แบดมินตัน',
    venue: 'ยิม 4',
    days: 5,
    cells: compete(STANDARD_CANDIDATE_DAYS),
  },
  {
    no: '1.7',
    sport: 'วอลเลย์บอล',
    venue: 'แข่งยิม 7 / ชิงชนะเลิศยิม 5',
    days: 8,
    cells: [
      ...compete(GYM_CANDIDATE_DAYS),
      { month: 10, day: 19, type: 'third' },
      { month: 10, day: 20, type: 'final' },
    ],
  },
  {
    no: '1.8',
    sport: 'บาสเกตบอล',
    venue: 'ยิม 7',
    days: 8,
    cells: [
      ...compete(GYM_CANDIDATE_DAYS),
      { month: 10, day: 19, type: 'third' },
      { month: 10, day: 21, type: 'final' },
    ],
  },
  {
    no: '1.9',
    sport: 'เปตอง',
    venue: 'ลานจอดหลังสนามฟุตซอลยิม 7',
    days: 5,
    cells: compete(STANDARD_CANDIDATE_DAYS),
  },
  {
    no: '1.13',
    sport: 'ฟุตบอล',
    venue: 'สนามมินิสเตเดียม',
    days: 5,
    cells: [
      ...compete(STANDARD_CANDIDATE_DAYS),
      { month: 10, day: 28, type: 'third' },
      { month: 10, day: 29, type: 'final' },
    ],
  },
]

export const MASTER_SCHEDULE_NOTE =
  'ถอดความจากไฟล์ CSV ต้นฉบับ "Final (แก้ไขร่าง) ตารางแข่งขัน TU Sport 2026 re1 14.7.69" — ครอบคลุมเฉพาะ 7 ประเภทกีฬาที่ระบบนี้จับสลากให้ ' +
  'ช่องที่ทำเครื่องหมายคือ "วันที่มีสิทธิ์แข่งได้" (ตามความพร้อมของสนาม/ยิม) ไม่ใช่ทุกวันจะมีการแข่งจริง — ผู้จัดยังต้องเลือกวันจริงเองอีกทีสำหรับแต่ละรายการย่อย'

export const MASTER_SCHEDULE_FOOTNOTES = [
  'ยิม 6 รอบชิงชนะเลิศฟุตซอล อาจมีการเปลี่ยนแปลงวันตามความเหมาะสม',
  '"3rd" = รอบชิงที่ 3',
  '"F" = รอบชิง (Final) ที่ 1',
  'กำหนดการแข่งขันกีฬาสากล วันที่ 28 กันยายน - 30 ตุลาคม 2569',
]

/** ปีที่ใช้จริงของงาน (พ.ศ. 2569 = ค.ศ. 2026) — ใช้แปลงเป็น ISO date */
const EVENT_YEAR_AD = 2026

export function scheduleCellToIso(cell: ScheduleCell): string {
  const mm = String(cell.month).padStart(2, '0')
  const dd = String(cell.day).padStart(2, '0')
  return `${EVENT_YEAR_AD}-${mm}-${dd}`
}

/** วันที่ (ISO) ที่ "มีสิทธิ์แข่งได้" ของประเภทกีฬานี้ ตามตารางหลัก — คืนค่าว่างถ้าไม่มีข้อมูล */
export function getCandidateDates(sportGroup: string): { iso: string; type: ScheduleCellType }[] {
  const row = MASTER_SCHEDULE_ROWS.find((r) => r.sport === sportGroup)
  if (!row) return []
  return row.cells
    .slice()
    .sort((a, b) => a.month - b.month || a.day - b.day)
    .map((c) => ({ iso: scheduleCellToIso(c), type: c.type }))
}

/** สถานที่แข่งขันตามตารางหลัก สำหรับกีฬากลุ่มนี้ */
export function getMasterVenue(sportGroup: string): string | undefined {
  return MASTER_SCHEDULE_ROWS.find((r) => r.sport === sportGroup)?.venue
}
