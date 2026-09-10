// จำว่าผู้ใช้เคยดูทัวร์สอนใช้งานของแต่ละหน้าไปแล้วหรือยัง (แยกเก็บเป็นรายหน้า) — กันไม่ให้ทัวร์เด้งซ้ำทุกครั้งที่เข้าหน้าเดิม
// ผู้ใช้ยังกดปุ่ม "?" เพื่อเรียกดูซ้ำเองได้เสมอ ไม่ว่าจะเคยดูแล้วหรือไม่
const KEY = 'tu-sportday-tour-seen-v1'

function readSeenSet(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr.filter((x): x is string => typeof x === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

function writeSeenSet(set: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(set)))
  } catch {
    // ignore
  }
}

export function hasSeenTour(pageKey: string): boolean {
  return readSeenSet().has(pageKey)
}

export function markTourSeen(pageKey: string) {
  const set = readSeenSet()
  set.add(pageKey)
  writeSeenSet(set)
}
