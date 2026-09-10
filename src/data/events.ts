import type { SportEvent } from '../types'

// รายการประเภทกีฬาทั้งหมด — รอบซีดแรก (Seed 1) เท่านั้น ตามที่กำหนด
// code ใช้เป็นชื่อชีตภายใน Excel เพื่ออ้างอิงข้อมูล ไม่แสดงผลในหน้าจอ

const e = (
  code: string,
  sportGroup: string,
  name: string,
  genderLabel: SportEvent['genderLabel'],
  entryShape: SportEvent['entryShape'],
  mode: SportEvent['mode'],
  ageLabel?: string,
  category?: string,
): SportEvent => ({
  code,
  sportGroup,
  groupSlug: slugify(sportGroup),
  name,
  genderLabel,
  ageLabel,
  entryShape,
  mode,
  category,
})

export function slugify(text: string): string {
  const map: Record<string, string> = {
    เทนนิส: 'tennis',
    ฟุตบอล: 'football',
    ฟุตซอล: 'futsal',
    วอลเลย์บอล: 'volleyball',
    บาสเกตบอล: 'basketball',
    แบดมินตัน: 'badminton',
    เปตอง: 'petanque',
  }
  return map[text] ?? text
}

export const EVENTS: SportEvent[] = [
  // 1. เทนนิส — ประเภทเดี่ยว/คู่ทั่วไปและรุ่นอายุ 45+ จัดกลุ่มรวมไว้ใต้หัวข้อทีมชาย/ทีมหญิงของรุ่นเดียวกัน (ยังจับสลากแยกอิสระตามเดิม)
  e('1.1', 'เทนนิส', 'ทีมชายทั่วไป', 'ชาย', 'individual', 'colorTeam', undefined, 'ทีมชายทั่วไป'),
  e('1.5', 'เทนนิส', 'ชายเดี่ยวทั่วไป', 'ชาย', 'individual', 'bracket', undefined, 'ทีมชายทั่วไป'),
  e('1.9', 'เทนนิส', 'ชายคู่ทั่วไป', 'ชาย', 'pair', 'bracket', undefined, 'ทีมชายทั่วไป'),

  e('1.2', 'เทนนิส', 'ทีมหญิงทั่วไป', 'หญิง', 'individual', 'colorTeam', undefined, 'ทีมหญิงทั่วไป'),
  e('1.6', 'เทนนิส', 'หญิงเดี่ยวทั่วไป', 'หญิง', 'individual', 'bracket', undefined, 'ทีมหญิงทั่วไป'),
  e('1.10', 'เทนนิส', 'หญิงคู่ทั่วไป', 'หญิง', 'pair', 'bracket', undefined, 'ทีมหญิงทั่วไป'),

  e('1.3', 'เทนนิส', 'ทีมชาย', 'ชาย', 'individual', 'colorTeam', 'อายุ 45 ปีขึ้นไป', 'ทีมชาย · อายุ 45 ปีขึ้นไป'),
  e('1.7', 'เทนนิส', 'ชายเดี่ยว', 'ชาย', 'individual', 'bracket', 'อายุ 45 ปีขึ้นไป', 'ทีมชาย · อายุ 45 ปีขึ้นไป'),

  e('1.4', 'เทนนิส', 'ทีมหญิง', 'หญิง', 'individual', 'colorTeam', 'อายุ 45 ปีขึ้นไป', 'ทีมหญิง · อายุ 45 ปีขึ้นไป'),
  e('1.8', 'เทนนิส', 'หญิงเดี่ยว', 'หญิง', 'individual', 'bracket', 'อายุ 45 ปีขึ้นไป', 'ทีมหญิง · อายุ 45 ปีขึ้นไป'),

  e('1.11', 'เทนนิส', 'คู่ผสมทั่วไป', 'ผสม', 'pairMixed', 'bracket'),

  // 2. ฟุตบอล
  e('2.1', 'ฟุตบอล', 'ทีมชาย แบ่งตามสีทีม', 'ชาย', 'individual', 'colorTeam'),

  // 3. ฟุตซอล
  e('3.1', 'ฟุตซอล', 'ทีมชาย แบ่งตามสีทีม', 'ชาย', 'individual', 'colorTeam'),

  // 4. วอลเลย์บอล
  e('4.1', 'วอลเลย์บอล', 'ทีมชาย แบ่งตามสีทีม', 'ชาย', 'individual', 'colorTeam'),
  e('4.2', 'วอลเลย์บอล', 'ทีมหญิง แบ่งตามสีทีม', 'หญิง', 'individual', 'colorTeam'),

  // 5. บาสเกตบอล
  e('5.1', 'บาสเกตบอล', 'ทีมชาย แบ่งตามสีทีม', 'ชาย', 'individual', 'colorTeam'),
  e('5.2', 'บาสเกตบอล', 'ทีมหญิง แบ่งตามสีทีม', 'หญิง', 'individual', 'colorTeam'),

  // 6. แบดมินตัน — จัดกลุ่มตามรุ่นอายุ (แต่ละรุ่นมีชายคู่/หญิงคู่/คู่ผสมของรุ่นนั้นรวมกัน)
  e('6.1', 'แบดมินตัน', 'ชายคู่ทั่วไป', 'ชาย', 'pair', 'bracket', 'อายุ 20 ปีขึ้นไป', 'รุ่นอายุ 20 ปีขึ้นไป'),
  e('6.2', 'แบดมินตัน', 'หญิงคู่ทั่วไป', 'หญิง', 'pair', 'bracket', 'อายุ 20 ปีขึ้นไป', 'รุ่นอายุ 20 ปีขึ้นไป'),
  e('6.7', 'แบดมินตัน', 'คู่ผสม', 'ผสม', 'pairMixed', 'bracket', 'อายุ 20 ปีขึ้นไป', 'รุ่นอายุ 20 ปีขึ้นไป'),

  e('6.3', 'แบดมินตัน', 'ชายคู่ทั่วไป', 'ชาย', 'pair', 'bracket', 'อายุ 40 ปีขึ้นไป', 'รุ่นอายุ 40 ปีขึ้นไป'),
  e('6.4', 'แบดมินตัน', 'หญิงคู่ทั่วไป', 'หญิง', 'pair', 'bracket', 'อายุ 40 ปีขึ้นไป', 'รุ่นอายุ 40 ปีขึ้นไป'),
  e('6.8', 'แบดมินตัน', 'คู่ผสม', 'ผสม', 'pairMixed', 'bracket', 'อายุ 40 ปีขึ้นไป', 'รุ่นอายุ 40 ปีขึ้นไป'),

  e('6.5', 'แบดมินตัน', 'ชายคู่ทั่วไป', 'ชาย', 'pair', 'bracket', 'อายุ 50 ปีขึ้นไป', 'รุ่นอายุ 50 ปีขึ้นไป'),
  e('6.6', 'แบดมินตัน', 'หญิงคู่ทั่วไป', 'หญิง', 'pair', 'bracket', 'อายุ 50 ปีขึ้นไป', 'รุ่นอายุ 50 ปีขึ้นไป'),
  e('6.9', 'แบดมินตัน', 'คู่ผสม', 'ผสม', 'pairMixed', 'bracket', 'อายุ 50 ปีขึ้นไป', 'รุ่นอายุ 50 ปีขึ้นไป'),

  // 7. เปตอง — จัดกลุ่มตามเพศ (เดี่ยว/คู่/ทีม 3 คน ของเพศเดียวกันรวมกัน) ส่วนคู่ผสมไม่มีคู่ให้รวม จึงอยู่เดี่ยว ๆ
  e('7.1', 'เปตอง', 'ชายเดี่ยวทั่วไป', 'ชาย', 'individual', 'bracket', undefined, 'ประเภทชาย'),
  e('7.3', 'เปตอง', 'ชายคู่ทั่วไป', 'ชาย', 'pair', 'bracket', undefined, 'ประเภทชาย'),
  e('7.6', 'เปตอง', 'ทีมชาย 3 คนทั่วไป', 'ชาย', 'team3', 'bracket', undefined, 'ประเภทชาย'),

  e('7.2', 'เปตอง', 'หญิงเดี่ยวทั่วไป', 'หญิง', 'individual', 'bracket', undefined, 'ประเภทหญิง'),
  e('7.4', 'เปตอง', 'หญิงคู่ทั่วไป', 'หญิง', 'pair', 'bracket', undefined, 'ประเภทหญิง'),
  e('7.7', 'เปตอง', 'ทีมหญิง 3 คนทั่วไป', 'หญิง', 'team3', 'bracket', undefined, 'ประเภทหญิง'),

  e('7.5', 'เปตอง', 'คู่ผสมทั่วไป', 'ผสม', 'pairMixed', 'bracket'),
]

export const SPORT_GROUPS = Array.from(new Set(EVENTS.map((ev) => ev.sportGroup))).map(
  (name) => ({
    name,
    slug: slugify(name),
    events: EVENTS.filter((ev) => ev.sportGroup === name),
  }),
)

export function getEventByCode(code: string): SportEvent | undefined {
  return EVENTS.find((ev) => ev.code === code)
}

export function getGroupBySlug(slug: string) {
  return SPORT_GROUPS.find((g) => g.slug === slug)
}
