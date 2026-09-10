import type { SportEvent } from '../types'

export interface EventSection {
  heading?: string
  events: SportEvent[]
}

/**
 * จัดกลุ่มการ์ดประเภทกีฬาตาม `category` (ถ้ามี) สำหรับแสดงผลในหน้าประเภทกีฬา
 * เก็บลำดับการปรากฏครั้งแรกของแต่ละหมวดไว้ (การ์ดที่มี category เดียวกันภายหลังจะถูกดึงมารวมในตำแหน่งนั้น)
 * รายการที่ไม่มี category จะได้ section เดี่ยว ๆ ของตัวเอง ไม่มีหัวข้อ
 */
export function groupEventsByCategory(events: SportEvent[]): EventSection[] {
  const sections: EventSection[] = []
  const indexByCategory = new Map<string, number>()
  for (const ev of events) {
    if (!ev.category) {
      sections.push({ events: [ev] })
      continue
    }
    const existingIndex = indexByCategory.get(ev.category)
    if (existingIndex !== undefined) {
      sections[existingIndex].events.push(ev)
    } else {
      indexByCategory.set(ev.category, sections.length)
      sections.push({ heading: ev.category, events: [ev] })
    }
  }
  return sections
}
