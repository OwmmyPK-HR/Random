import { matchPath } from 'react-router-dom'
import type { TourStep } from '../components/Tour'

// เนื้อหาทัวร์สอนใช้งานของแต่ละหน้า รวมไว้ที่เดียว — ปุ่ม "?" อยู่แถบบนจุดเดียว (Layout.tsx)
// แล้วสลับเนื้อหาไปตาม pageKey ของหน้าปัจจุบัน (data-tour ของ element เป้าหมายยังคงติดอยู่ที่แต่ละหน้าตามเดิม)
export const TOUR_STEPS: Record<string, TourStep[]> = {
  home: [
    {
      target: 'home-excel',
      title: 'เริ่มต้นที่นี่',
      body: 'ดาวน์โหลดฟอร์ม Excel ไปกรอกรายชื่อนักกีฬาแยกตามสี แล้วอัปโหลดไฟล์เดิมกลับเข้าระบบ ไม่ต้องพิมพ์ชื่อสีเอง',
    },
    {
      target: 'home-sportgroups',
      title: 'เลือกประเภทกีฬา',
      body: 'กดเข้าไปที่ประเภทกีฬาที่ต้องการ จะเห็นรายชื่อที่จัดกลุ่มตามสีให้แล้ว กดปุ่มสุ่มจับคู่แข่งขันได้เลย',
    },
    {
      target: 'home-numberdraw',
      title: 'จับฉลากเบอร์ประจำสี',
      body: 'ทอยลูกเต๋าสุ่มเบอร์ 1-4 ให้แต่ละสี ใช้จัดลำดับเดินขบวน/พิธีเปิด แยกต่างหากจากการจับคู่แข่งขัน',
    },
    {
      target: 'home-summary',
      title: 'สรุปผล & ส่งออก',
      body: 'ดูภาพรวมทุกประเภทกีฬา ส่งออกผลเป็น Excel และสำรอง/กู้คืนข้อมูลได้ในหน้านี้',
    },
  ],
  sportgroup: [
    {
      target: 'sportgroup-header',
      title: 'ประเภทกีฬานี้คืออะไร',
      body: 'ชื่อประเภทกีฬาและจำนวนรายการแข่งขันทั้งหมด พร้อมสถานะว่าจับคู่ไปแล้วกี่รายการ',
    },
    {
      target: 'sportgroup-cards',
      title: 'รายการแข่งขัน',
      body: 'แต่ละการ์ดคือ 1 รายการแข่งขัน กดเข้าไปเพื่อกรอกรายชื่อและสุ่มจับคู่แข่งขันของรายการนั้น',
    },
  ],
  event: [
    {
      target: 'event-roster',
      title: 'รายชื่อนักกีฬา',
      body: 'อัปโหลดไฟล์ Excel หรือกด "พิมพ์รายชื่อเอง" ก็ได้ แยกตามสีให้ถูกต้อง (ถ้าเป็นประเภทแบ่งตามสีทีมข้ามขั้นตอนนี้ได้เลย)',
    },
    {
      target: 'event-draw',
      title: 'สุ่มจับคู่แข่งขัน',
      body: 'กดปุ่มนี้เพื่อสุ่มจับคู่แข่งขันรอบแรกอย่างเป็นธรรม ระบบจะมีแอนิเมชันเผยผลให้ดูก่อนแสดงผลจริง',
    },
    {
      target: 'event-result',
      title: 'ผลการจับสลาก',
      body: 'ผลลัพธ์จะแสดงที่นี่ — ถ้าเป็นแบบพบกันหมดกรอกผลการแข่งขันจริงได้เลย ระบบจะจัดอันดับและเติมคู่ชิงให้อัตโนมัติ',
    },
  ],
  numberdraw: [
    {
      target: 'numberdraw-button',
      title: 'เริ่มจับฉลาก',
      body: 'กดปุ่มนี้เพื่อทอยลูกเต๋าสุ่มเบอร์ 1-4 ให้ครบทั้ง 4 สีแบบไม่ซ้ำกัน จะมีแอนิเมชันทอยเต๋าให้ดูก่อนเผยผล',
    },
    {
      target: 'numberdraw-result',
      title: 'ผลจับฉลาก',
      body: 'เบอร์ของแต่ละสีจะแสดงที่นี่ กดพิมพ์ผลไปติดประกาศได้ หรือจับฉลากใหม่ถ้าต้องการเปลี่ยน',
    },
  ],
  summary: [
    {
      target: 'summary-export',
      title: 'ส่งออกสรุปผล',
      body: 'ส่งออกสรุปผลทุกประเภทกีฬาเป็นไฟล์ Excel เดียว (ชีตสรุป + รายละเอียดแต่ละประเภทที่มีข้อมูลแล้ว)',
    },
    {
      target: 'summary-backup',
      title: 'สำรอง / กู้คืนข้อมูล',
      body: 'สำรองข้อมูลทั้งหมด (รายชื่อ ผลจับสลาก ผลแข่งขัน เบอร์ประจำสี) เป็นไฟล์ JSON เก็บไว้ หรือย้ายไปเครื่องอื่นได้',
    },
    {
      target: 'summary-search',
      title: 'ค้นหา',
      body: 'พิมพ์ค้นหาประเภทกีฬา/รายการที่ต้องการได้ทันที',
    },
    {
      target: 'summary-table',
      title: 'ตารางสรุป',
      body: 'ดูสถานะทุกรายการในที่เดียว จำนวนนักกีฬาแยกตามสี และกดชื่อรายการเพื่อเข้าไปดูรายละเอียดได้เลย',
    },
  ],
}

const ROUTE_TO_PAGEKEY: { pattern: string; key: string }[] = [
  { pattern: '/', key: 'home' },
  { pattern: '/sport/:slug', key: 'sportgroup' },
  { pattern: '/event/:code', key: 'event' },
  { pattern: '/number-draw', key: 'numberdraw' },
  { pattern: '/summary', key: 'summary' },
]

/** หา pageKey (ตรงกับ key ใน TOUR_STEPS) จาก path ปัจจุบัน — path ที่ไม่รู้จัก (catch-all) ถือเป็นหน้าแรก */
export function getPageKeyFromPath(pathname: string): string {
  for (const { pattern, key } of ROUTE_TO_PAGEKEY) {
    if (matchPath({ path: pattern, end: true }, pathname)) return key
  }
  return 'home'
}
