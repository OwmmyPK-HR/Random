// ตารางการแข่งขันกีฬาสีบุคลากรมหาวิทยาลัยธรรมศาสตร์ "TU Sport Day 2026"
// ถอดความจากตารางต้นฉบับ (ภาพ) ที่ได้รับมา — ครอบคลุมกีฬาทุกประเภทของงาน ไม่ใช่แค่ 33 รายการที่ระบบนี้จับสลากให้
// ข้อมูลระดับวันที่ในตารางนี้เป็นการถอดความจากภาพ อาจมีความคลาดเคลื่อนในบางวัน โปรดตรวจสอบกับประกาศทางการอีกครั้ง

export type ScheduleCellType = 'compete' | 'third' | 'final' | 'finalAlert'

export interface MasterScheduleRow {
  no: string
  sport: string
  venue: string
  days: number
  cells: Partial<Record<number, ScheduleCellType>> // key = วันที่ในเดือนตุลาคม 2569 (1-31)
  dec?: { type: ScheduleCellType; label: string } // คอลัมน์ ธ.ค. 2569
}

export interface MasterScheduleGroup {
  title: string
  rows: MasterScheduleRow[]
}

function fill(daysList: number[], type: ScheduleCellType = 'compete'): Partial<Record<number, ScheduleCellType>> {
  const out: Partial<Record<number, ScheduleCellType>> = {}
  for (const d of daysList) out[d] = type
  return out
}

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let d = start; d <= end; d++) out.push(d)
  return out
}

export const MASTER_SCHEDULE_NOTE =
  'ถอดความจากตารางต้นฉบับที่ได้รับ — ข้อมูลระดับวันที่อาจคลาดเคลื่อนในบางจุด โปรดตรวจสอบวันแข่งจริงกับประกาศทางการอีกครั้งก่อนใช้งานจริง'

export const MASTER_SCHEDULE_FOOTNOTES = [
  'ยิม 6 รอบชิงชนะเลิศฟุตซอล อาจมีการเปลี่ยนแปลงวันตามความเหมาะสม',
  '"3rd" = รอบชิงที่ 3',
  '"F" = รอบชิง (Final) ที่ 1',
  'กำหนดการแข่งขันกีฬาสากล วันที่ 28 กันยายน - 30 ตุลาคม 2569',
  'กำหนดการแข่งขันกีฬาพื้นบ้าน อาเซ และผู้บริหาร และงานจัดเลี้ยงขอบคุณและปีใหม่ วันที่ 18 ธันวาคม 2569',
]

export const MASTER_SCHEDULE_GROUPS: MasterScheduleGroup[] = [
  {
    title: '1. กีฬาสากล',
    rows: [
      { no: '1.1', sport: 'ว่ายน้ำ', venue: 'ศูนย์กีฬาทางน้ำ', days: 2, cells: { 1: 'compete', 2: 'final' } },
      { no: '1.2', sport: 'กรีฑา', venue: 'ลู่วิ่งสนามมินิ', days: 2, cells: { 1: 'compete', 2: 'final' } },
      {
        no: '1.3',
        sport: 'เทนนิส',
        venue: 'สนามเทนนิส 2 คอร์ท',
        days: 5,
        cells: fill([1, 2, 6, 7, 8]),
      },
      {
        no: '1.4',
        sport: 'ฟุตซอล',
        venue: 'แข่งสนามฟุตซอลยิม 7 / ชิงชนะเลิศยิม 6',
        days: 5,
        cells: { ...fill([1]), 7: 'third', 9: 'finalAlert' },
      },
      { no: '1.5', sport: 'เทเบิลเทนนิส', venue: 'ยิม 5', days: 5, cells: fill([3, 4, 7, 8, 9]) },
      { no: '1.6', sport: 'แบดมินตัน', venue: 'ยิม 4', days: 5, cells: fill([3, 4, 7, 8, 9]) },
      {
        no: '1.7',
        sport: 'วอลเลย์บอล',
        venue: 'แข่งยิม 7 / ชิงชนะเลิศยิม 5',
        days: 8,
        cells: { ...fill([6, 7, 8, 10, ...range(13, 16)]), 19: 'third', 20: 'final' },
      },
      {
        no: '1.8',
        sport: 'บาสเกตบอล',
        venue: 'ยิม 7',
        days: 8,
        cells: { ...fill([6, 7, 8, 10, ...range(13, 16)]), 19: 'third', 21: 'final' },
      },
      { no: '1.9', sport: 'เปตอง', venue: 'ลานจอดหลังสนามฟุตซอลยิม 7', days: 5, cells: fill(range(10, 14)) },
      { no: '1.10', sport: 'เซปักตะกร้อ', venue: 'สนามอเนกประสงค์ ยิม 7', days: 4, cells: fill(range(13, 16)) },
      { no: '1.11', sport: 'หมากกระดาน', venue: 'ห้อง VIP สระว่ายน้ำ', days: 3, cells: fill(range(21, 23)) },
      { no: '1.12', sport: 'อีสปอร์ต', venue: 'ห้อง VIP สระว่ายน้ำ', days: 2, cells: { 24: 'compete', 26: 'final' } },
      {
        no: '1.13',
        sport: 'ฟุตบอล',
        venue: 'สนามมินิสเตเดียม',
        days: 5,
        cells: { ...fill([17, 18]), 28: 'third', 29: 'final' },
      },
    ],
  },
  {
    title: '2. กีฬาพื้นบ้าน อาเซ ผู้บริหาร',
    rows: [
      { no: '2.1', sport: 'วิ่ง 5 ขา', venue: '', days: 0, cells: {}, dec: { type: 'compete', label: 'ช' } },
      { no: '2.2', sport: 'ชักเย่อ', venue: '', days: 0, cells: {}, dec: { type: 'compete', label: 'ช' } },
      { no: '2.3', sport: '—', venue: '', days: 0, cells: {}, dec: { type: 'compete', label: 'ช' } },
      { no: '2.4', sport: 'กีฬาผู้บริหาร', venue: '', days: 0, cells: {}, dec: { type: 'compete', label: 'ช' } },
    ],
  },
  {
    title: '3. งานเลี้ยงขอบคุณและงานเลี้ยงปีใหม่',
    rows: [{ no: '3.1', sport: 'งานเลี้ยงขอบคุณและงานเลี้ยงปีใหม่', venue: '', days: 0, cells: {}, dec: { type: 'compete', label: 'บ' } }],
  },
]

export const MASTER_SCHEDULE_OCT_DAYS = range(1, 31)
