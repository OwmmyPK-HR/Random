// ----- สี (คงที่ 4 สี ตามที่กำหนด) -----
export const COLORS = ['ฟ้า', 'ม่วง', 'ชมพู', 'เขียว'] as const
export type ColorName = (typeof COLORS)[number]

export const COLOR_THEME: Record<
  ColorName,
  { base: string; light: string; dark: string; text: string }
> = {
  ฟ้า: { base: '#2563EB', light: '#DBEAFE', dark: '#1E3A8A', text: '#1E3A8A' },
  ม่วง: { base: '#7C3AED', light: '#EDE3FE', dark: '#4C1D95', text: '#4C1D95' },
  ชมพู: { base: '#DB2777', light: '#FCE3EF', dark: '#831843', text: '#831843' },
  เขียว: { base: '#16A34A', light: '#DCFCE7', dark: '#14532D', text: '#14532D' },
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
