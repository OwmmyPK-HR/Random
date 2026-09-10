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
  // ป้ายหมวดหมู่ไว้จัดกลุ่มการ์ดในหน้าประเภทกีฬา (เช่น รวมประเภทเดี่ยว/คู่เข้าไว้ใต้หัวข้อทีมเดียวกัน) — ไม่มี = ไม่จัดกลุ่ม แสดงเดี่ยว ๆ ตามปกติ
  category?: string
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

// ประเภทเดี่ยว/คู่/ทีม 3 คน (เทนนิส/แบดมินตัน/เปตอง) แบ่งผู้เข้าแข่งขันเป็น 2 สายแข่งขันแยกอิสระ
// สุ่มแบ่งให้อัตโนมัติตอนจับสลาก แล้วจับคู่รอบแรกแยกภายในแต่ละสาย
export type SaiLabel = 'A' | 'B'

export interface SaiBracket {
  sai: SaiLabel
  pairs: BracketPair[]
}

// ผลนัดพบกันหมด 1 คู่ — สีที่ชนะ หรือ 'draw' ถ้าเสมอ (กรอกเองหลังแข่งจริงจบ)
export type MatchOutcome = ColorName | 'draw'

export interface EventState {
  roster: RosterEntry[]
  colorBracket?: [ColorName, ColorName][] // ตารางพบกันหมด 6 คู่ (สำหรับ colorTeam) — ที่เหลืออีก 2 นัด (ชิงที่ 3 + ชิงชนะเลิศ) รอผลรอบนี้ก่อน
  matchResults?: Record<string, MatchOutcome> // ผลแต่ละนัดพบกันหมด key = matchKey(a,b) — กรอกครบ 6 นัดแล้วระบบจะจัดอันดับ/เติมคู่ชิงให้อัตโนมัติ
  unitBracket?: SaiBracket[] // สาย A / สาย B + คู่แข่งขันรอบแรกของแต่ละสาย (สำหรับ bracket mode)
  drawnAt?: string
}

export type StoreShape = Record<string, EventState>

// ----- จับฉลากเบอร์ประจำสี (1-4) — ใช้สำหรับลำดับเดินขบวน/พิธีเปิด ฯลฯ ไม่ผูกกับประเภทกีฬาใดโดยเฉพาะ -----
export interface NumberDrawState {
  assignment?: Record<ColorName, number> // แต่ละสีได้เบอร์อะไร (1-4 ไม่ซ้ำกัน)
  drawnAt?: string
}
