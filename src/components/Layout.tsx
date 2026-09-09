import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { SPORT_GROUPS } from '../data/events'
import { COLORS } from '../types'
import { useTheme } from '../store/ThemeContext'
import { ColorDot } from './ColorBadge'
import { ChartIcon, CloseIcon, HomeIcon, MenuIcon, MoonIcon, SPORT_ICON, SunIcon } from './Icons'

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      <NavLink to="/" end onClick={onNavigate} className={({ isActive }) => navClass(isActive)}>
        <HomeIcon size={17} className="shrink-0" />
        <span>ภาพรวม</span>
      </NavLink>

      <p className="mb-1 mt-4 px-3 text-[11px] font-bold uppercase tracking-wider text-mist-600">ประเภทกีฬา</p>
      {SPORT_GROUPS.map((g) => {
        const Icon = SPORT_ICON[g.name]
        return (
          <NavLink key={g.slug} to={`/sport/${g.slug}`} onClick={onNavigate} className={({ isActive }) => navClass(isActive)}>
            {Icon && <Icon size={17} className="shrink-0" />}
            <span className="flex-1">{g.name}</span>
            <span className="text-[11px] font-semibold text-mist-700">{g.events.length}</span>
          </NavLink>
        )
      })}

      <div className="mt-4 flex flex-col gap-0.5 border-t border-surface-border pt-3">
        <NavLink to="/summary" onClick={onNavigate} className={({ isActive }) => navClass(isActive)}>
          <ChartIcon size={17} className="shrink-0" />
          <span>สรุปผล &amp; ส่งออก</span>
        </NavLink>
      </div>
    </nav>
  )
}

function SidebarTagline() {
  return (
    <p className="mt-6 border-t border-surface-border px-3 pt-4 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-mist-600">
      Play Together
      <br />A Brighter Tomorrow
    </p>
  )
}

function navClass(active: boolean) {
  return `group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
    active
      ? 'bg-accent text-accent-contrast shadow-glowAccent'
      : 'text-mist-400 hover:bg-surface-raised hover:text-mist-100'
  }`
}

function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border text-mist-300 transition-colors hover:border-accent/50 hover:text-accent-soft ${className}`}
      aria-label={isDark ? 'สลับเป็นโหมดสีขาว' : 'สลับเป็นโหมดมืด'}
      title={isDark ? 'โหมดสีขาว' : 'โหมดมืด'}
    >
      {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="./tu-logo.png" alt="TU" className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_10px_rgba(242,179,61,0.35)]" />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-extrabold text-mist-100">TU Sport Day 2026</p>
        <p className="truncate text-[11px] text-mist-500">ระบบสุ่มจับคู่แข่งขันกีฬาสี</p>
      </div>
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-surface-canvas bg-hud">
      <div className="h-1 bg-stripe" />
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/">
            <Brand />
          </NavLink>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <p className="hidden text-right text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-mist-500 xl:block">
              More Than A Game
              <br />We Grow Together
            </p>

            <div className="hidden items-center gap-3 rounded-full border border-surface-border bg-surface-card px-3 py-1.5 sm:flex">
              {COLORS.map((c) => (
                <span key={c} className="flex items-center gap-1.5 text-xs font-semibold text-mist-400">
                  <ColorDot color={c} size={9} />
                  {c}
                </span>
              ))}
            </div>

            <ThemeToggle />

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-surface-border p-2 text-mist-300 lg:hidden"
              aria-label="เปิดเมนู"
            >
              <MenuIcon size={19} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-popIn border-r border-surface-border bg-surface-sunken p-4 shadow-pop">
            <div className="mb-4 flex items-center justify-between">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-mist-500 hover:bg-surface-raised" aria-label="ปิดเมนู">
                <CloseIcon size={18} />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-surface-border bg-surface-sunken p-3 shadow-soft">
            <NavItems />
            <SidebarTagline />
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>

      <footer className="border-t border-surface-border bg-surface-sunken py-6 text-center text-xs text-mist-600">
        TU Sport Day 2026
      </footer>
    </div>
  )
}
