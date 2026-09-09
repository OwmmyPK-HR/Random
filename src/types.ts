// ----- สี (คงที่ 4 สี ตามที่กำหนด) -----
export const COLORS = ['ฟ้า', 'ม่วง', 'ชมพู', 'เขียว'] as const
export type ColorName = (typeof COLORS)[number]

// สีผ่านการตรวจสอบด้วย dataviz palette validator (CVD deutan/tritan separation +
// normal-vision floor) ในลำดับคงที่ ฟ้า→ม่วง→ชมพู→เขียว — ดู palette validation ในบันทึกงาน
export const COLOR_THEME: Record<
  ColorName,
  { base: string; soft: string; light: string; dark: string; text: string; ring: string }
> = {
  ฟ้า: { base: '#0284C7', soft: '#38BDF8', light: '#E0F2FE', dark: '#075985', text: '#075985', ring: '#7DD3FC' },
  ม่วง: { base: '#9333EA', soft: '#C084FC', light: '#F3E8FF', dark: '#6B21A8', text: '#6B21A8', ring: '#D8B4FE' },
  ชมพู: { base: '#DB2777', soft: '#F472B6', light: '#FCE7F3', dark: '#9D174D', text: '#9D174D', ring: '#F9A8D4' },
  เขียว: { base: '#16A34A', soft: '#4ADE80', light: '#DCFCE7', dark: '#166534', text: '#166534', ring: '#86EFAC' },
}

// ----- รูปแบบข้อมูลผู้สมัคร (ตามชนิดของประเภทกีฬา) -----
export type EntryShape = 'individual' | 'pair' | 'pairMixed' | 'team3'

// colorTeam = นักกีฬาทั้งหมดถูกแบ่งกระจายเข้า 4 สี เพื่อประกอบเป็นทีมของแต่ละสี (เช่น ฟุตบอล วอลเลย์บอล)
// bracket   = แต่ละหน่วย (คน/คู่/ทีม 3 คน) ถูกสุ่มเข้าสีใดสีหนึ่ง แล้วจับสายแข่งรอบแรกระหว่างหน่วยด้วยกันเอง
export type CompetitionMode = 'colorTeam' | 'bracket'

export interface SportEvent {
  code: string // ใช้ภายในเท่านั้น (อ้างอิงชีต Excel) ไม่แสดงในหน้าจอ
  sportGroup: string
  groupSlug: string
  name: string
  genderLabel: 'ชาย' | 'หญิง' | 'ผสม'
  ageLabel?: string
  entryShape: EntryShape
  mode: CompetitionMode
}

// ----- ผู้สมัคร/หน่วยแข่งขัน 1 รายการในฟอร์ม -----
export interface RosterEntry {
  id: string
  name1: string
  name2?: string
  name3?: string
  teamName?: string
  note?: string
}

export type ResultMap = Record<ColorName, RosterEntry[]>

export interface BracketPair {
  a: { label: string; color: ColorName }
  b?: { label: string; color: ColorName } // ไม่มี = bye (ผ่านเข้ารอบถัดไปฟรี)
}

export interface EventState {
  roster: RosterEntry[]
  result?: ResultMap
  colorBracket?: ColorName[] // ลำดับสีที่สุ่มจับคู่รอบแรก (สำหรับ colorTeam)
  unitBracket?: BracketPair[] // คู่แข่งรอบแรก (สำหรับ bracket mode)
  shuffledAt?: string
}

export type StoreShape = Record<string, EventState>
