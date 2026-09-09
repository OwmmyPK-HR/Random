// ----- สี (คงที่ 4 สี ตามที่กำหนด) -----
export const COLORS = ['ฟ้า', 'ม่วง', 'ชมพู', 'เขียว'] as const
export type ColorName = (typeof COLORS)[number]

// สีผ่านการตรวจสอบด้วย dataviz palette validator (CVD deutan/tritan separation +
// normal-vision floor) ในลำดับคงที่ ฟ้า→ม่วง→ชมพู→เขียว
// base/soft = สีหลัก/สีสว่างสำหรับปุ่ม-ไล่เฉด (ตัวหนังสือขาวทับได้เสมอ)
// light/dark = คู่ป้าย/การ์ดพื้นพาสเทล+ตัวอักษรเข้ม — ตั้งใจให้เป็นคู่สีคงที่ ไม่ขึ้นกับโหมดมืด/ขาว
// (ป้ายสีอ่อนแบบนี้อ่านได้ทั้งบนพื้นขาวและพื้นมืด เหมือน badge สีของ GitHub/Discord)
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

// colorTeam = แต่ละสีมีทีม/นักกีฬาของตัวเองอยู่แล้ว สุ่มแค่ "คู่แข่งขัน" ว่า 4 สีจะพบกันคู่ไหนก่อน (เช่น ฟุตบอล วอลเลย์บอล)
// bracket   = แต่ละหน่วย (คน/คู่/ทีม 3 คน) มีสีของตัวเองอยู่แล้ว สุ่มจับคู่แข่งขันรอบแรกระหว่างหน่วยด้วยกันเอง
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

// ----- ผู้สมัคร/หน่วยแข่งขัน 1 รายการในฟอร์ม — สีของแต่ละคนถูกกำหนดไว้แล้วตั้งแต่ตอนกรอกข้อมูล -----
export interface RosterEntry {
  id: string
  color: ColorName
  name1: string
  name2?: string
  name3?: string
  teamName?: string
}

export type ResultMap = Record<ColorName, RosterEntry[]>

export interface BracketPair {
  a: { label: string; color: ColorName }
  b?: { label: string; color: ColorName } // ไม่มี = bye (ผ่านเข้ารอบถัดไปฟรี)
}

export interface EventState {
  roster: RosterEntry[]
  colorBracket?: ColorName[] // ลำดับสีที่สุ่มจับคู่รอบแรก (สำหรับ colorTeam)
  unitBracket?: BracketPair[] // คู่แข่งขันรอบแรกที่สุ่มได้ (สำหรับ bracket mode)
  drawnAt?: string
}

export type StoreShape = Record<string, EventState>
