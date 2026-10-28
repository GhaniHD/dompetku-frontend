import { useCallback, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Activity, KeyRound, LayoutDashboard, Link2, LogOut, Mail, Megaphone, Moon, ScrollText, ShieldCheck, Sun, UserCheck, Users } from 'lucide-react'
import { logoutNotice } from '../api/client'
import Logo from '../components/layout/Logo'
import NotificationBell from '../components/layout/NotificationBell'
import { useAuth } from '../context/auth'
import { useTheme } from '../context/theme'
import { useAdminSummary } from '../hooks/queries'
import { cn } from '../lib/cn'

const NAV = [
  { to: '/admin', label: 'Dasbor', icon: LayoutDashboard, end: true },
  { to: '/admin/persetujuan', label: 'Persetujuan', icon: UserCheck, badge: 'pending' },
  { to: '/admin/pengguna', label: 'Pengguna', icon: Users },
  { to: '/admin/aktivitas', label: 'Aktivitas login', icon: Activity },
  { to: '/admin/undangan', label: 'Undangan', icon: Link2 },
  { to: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone },
  { to: '/admin/email', label: 'Email', icon: Mail },
  { to: '/admin/log', label: 'Log admin', icon: ScrollText },
]

const IDLE_MS = 30 * 60 * 1000

// Admin keluar otomatis setelah 30 menit tanpa sentuhan, ketikan, atau gerakan mouse.
function useIdleLogout(onIdle) {
  const timer = useRef(null)
  useEffect(() => {
    const reset = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(onIdle, IDLE_MS)
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'visibilitychange']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [onIdle])
}

function Badge({ count }) {
  if (!count) return null
  return <span className="ml-auto min-w-5 rounded-full bg-caution px-1.5 text-center text-[11px] font-bold leading-5 text-white">{count > 99 ? '99+' : count}</span>
}

function SideNav({ pending }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors', isActive ? 'bg-white/[0.12] text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white')
          }
        >
          <Icon className="size-[18px]" strokeWidth={2} />
          {label}
          {badge && <Badge count={pending} />}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminShell() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const { data: summary } = useAdminSummary()
  const pending = summary?.pending || 0

  const signOut = () => {
    logout()
    navigate('/masuk', { replace: true })
  }
  const onIdle = useCallback(() => {
    logoutNotice.set('Sesi admin berakhir karena tidak aktif 30 menit. Silakan masuk lagi.')
    logout()
    navigate('/masuk', { replace: true })
  }, [logout, navigate])
  useIdleLogout(onIdle)

  const footBtn = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white'

  return (
    <div className="min-h-dvh bg-canvas lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#17122B] px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <Logo className="size-10" />
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-white">MyFulus</p>
            <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#C38BFF]"><ShieldCheck className="size-3" /> Super Admin</p>
          </div>
        </div>
        <SideNav pending={pending} />
        <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
          <NavLink to="/admin/akun" className={({ isActive }) => cn(footBtn, isActive && 'bg-white/[0.12] text-white')}><KeyRound className="size-[18px]" /> Akun admin</NavLink>
          <button type="button" onClick={toggle} className={footBtn}>{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />} {dark ? 'Mode terang' : 'Mode gelap'}</button>
          <button type="button" onClick={signOut} className={footBtn}><LogOut className="size-[18px]" /> Keluar</button>
          <p className="truncate px-3 pt-2 text-xs text-white/40">{user?.email}</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 bg-[#17122B] text-white lg:hidden">
        <div className="flex h-16 items-center gap-3 px-4">
          <Logo className="size-9" />
          <div className="min-w-0">
            <p className="font-display font-semibold leading-tight">MyFulus</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C38BFF]">Super Admin</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={toggle} aria-label={dark ? 'Mode terang' : 'Mode gelap'} className="rounded-full p-2.5 text-white/70 hover:bg-white/10">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
            <NavLink to="/admin/akun" aria-label="Akun admin" className="rounded-full p-2.5 text-white/70 hover:bg-white/10"><KeyRound className="size-[18px]" /></NavLink>
            <button type="button" onClick={signOut} aria-label="Keluar" className="rounded-full p-2.5 text-white/70 hover:bg-white/10"><LogOut className="size-[18px]" /></button>
          </div>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
          {NAV.map(({ to, label, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn('flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold', isActive ? 'bg-white text-[#17122B]' : 'bg-white/[0.08] text-white/75')}
            >
              {label}
              {badge && pending > 0 && <span className="rounded-full bg-caution px-1.5 text-[10px] font-bold leading-4 text-white">{pending}</span>}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mb-2 hidden justify-end lg:flex"><NotificationBell /></div>
        <Outlet />
      </div>
    </div>
  )
}
