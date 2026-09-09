const THAI_WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]
const THAI_MONTHS_ABBR = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

function parseIsoDate(iso: string): Date | null {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "วันพฤหัสบดีที่ 1 ตุลาคม 2569" — วันที่แบบไทยเต็ม (พ.ศ.) จาก yyyy-mm-dd */
export function formatThaiDateFull(iso: string): string {
  const d = parseIsoDate(iso)
  if (!d) return iso
  const be = d.getFullYear() + 543
  return `วัน${THAI_WEEKDAYS[d.getDay()]}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${be}`
}

/** "1 ต.ค. 69" — วันที่แบบไทยย่อ ใช้ในตารางที่พื้นที่จำกัด */
export function formatThaiDateShort(iso: string): string {
  const d = parseIsoDate(iso)
  if (!d) return iso
  const be = (d.getFullYear() + 543) % 100
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${be}`
}
