import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { SPORT_GROUPS } from '../data/events'
import { COLORS } from '../types'
import { ColorDot } from './ColorBadge'

const navLinkClass = (active: boolean) =>
  `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active ? 'bg-tu-maroon/10 text-tu-maroon' : 'text-slate-600 hover:bg-slate-100'
  }`

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      <NavLink to="/" end onClick={onNavigate} className={({ isActive }) => navLinkClass(isActive)}>
        <span>ภาพรวม</span>
      </NavLink>
      <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">ประเภทกีฬา</p>
      {SPORT_GROUPS.map((g) => (
        <NavLink key={g.slug} to={`/sport/${g.slug}`} onClick={onNavigate} className={({ isActive }) => navLinkClass(isActive)}>
          <span>{g.name}</span>
          <span className="text-xs text-slate-400">{g.events.length}</span>
        </NavLink>
      ))}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <NavLink to="/summary" onClick={onNavigate} className={({ isActive }) => navLinkClass(isActive)}>
          <span>สรุปผล &amp; ส่งออก</span>
        </NavLink>
      </div>
    </nav>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <div className="h-1.5 bg-stripe" />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 grid-cols-2 grid-rows-2 overflow-hidden rounded-lg shadow-soft">
              {COLORS.map((c) => (
                <ColorSquare key={c} color={c} />
              ))}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">TU Sport Day 2026</p>
              <p className="text-xs text-slate-500">ระบบสุ่มแบ่งสายกีฬาสี · มหาวิทยาลัยธรรมศาสตร์</p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-2 sm:flex">
            {COLORS.map((c) => (
              <span key={c} className="flex items-center gap-1 text-xs font-medium text-slate-500">
                <ColorDot color={c} size={9} />
                {c}
              </span>
            ))}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
            aria-label="เปิดเมนู"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            <NavItems onNavigate={() => setMobileOpen(false)} />
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
            <NavItems />
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        TU Sport Day 2026 · ระบบสุ่มแบ่งสายกีฬาสีทำงานบนเบราว์เซอร์ทั้งหมด ข้อมูลถูกเก็บไว้ในเครื่องของคุณเท่านั้น
      </footer>
    </div>
  )
}

function ColorSquare({ color }: { color: (typeof COLORS)[number] }) {
  const bg: Record<string, string> = { ฟ้า: '#2563EB', ม่วง: '#7C3AED', ชมพู: '#DB2777', เขียว: '#16A34A' }
  return <span style={{ backgroundColor: bg[color] }} />
}
