import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** true ถ้าผู้ใช้ตั้งค่าระบบไว้ว่าอยากให้ลดการเคลื่อนไหว (เช่น กันเวียนหัว) — ใช้ข้ามแอนิเมชันหมุนเร็ว ๆ แล้วเผยผลลัพธ์ตรง ๆ แทน */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(QUERY)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
