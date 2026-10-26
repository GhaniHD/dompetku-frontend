import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Moon, MoreHorizontal, Plus, Settings, ShieldCheck, Sun, UserRound } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { useTheme } from '../../context/theme'
import { useAdminSummary, useProfile } from '../../hooks/queries'
import { cn } from '../../lib/cn'
import { Button, IconButton, Modal } from '../ui'
import IncomeForm from '../forms/IncomeForm'
import Avatar from './Avatar'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import Popover from './Popover'
import { PRIMARY_NAV, SECONDARY_NAV } from './nav'
import { QuickActionsProvider, useQuick } from './QuickActions'

// eslint-disable-next-line react-refresh/only-export-components
export function useIsAdmin() {
  const { user } = useAuth()
  const { data } = useProfile()
  return (data?.role || user?.role) === 'admin'
}

function AdminRailLink() {
  const { data } = useAdminSummary()
  return (
    <div className="relative">
      <RailLink to="/admin" label="Admin" icon={ShieldCheck} />
      {data?.pending > 0 && (
        <span className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-caution px-1 text-center text-[10px] font-bold leading-4 text-white">
          {data.pending > 9 ? '9+' : data.pending}
        </span>
      )}
    </div>
  )
}

function RailLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'group relative grid size-11 place-items-center rounded-full transition-colors',
          isActive ? 'bg-ink text-canvas' : 'text-muted hover:bg-sunken hover:text-ink'
        )
      }
    >
      <Icon className="size-[19px]" strokeWidth={2} />
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-canvas opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </NavLink>
  )
}

function Rail({ onLogout }) {
  const { dark, toggle } = useTheme()
  const isAdmin = useIsAdmin()
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col items-center py-5 lg:flex">
      <Link to="/" aria-label="DompetKu" className="mb-6">
        <Logo className="size-11" />
      </Link>
      <nav className="flex flex-col items-center gap-1.5 rounded-full border border-line bg-surface px-1.5 py-2">
        {SECONDARY_NAV.map((item) => (
          <RailLink key={item.to} {...item} />
        ))}
        {isAdmin && <AdminRailLink />}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-1.5 rounded-full border border-line bg-surface px-1.5 py-2">
        <IconButton icon={dark ? Sun : Moon} label={dark ? 'Mode terang' : 'Mode gelap'} onClick={toggle} className="size-11" />
        <RailLink to="/profil" label="Profil & pengaturan" icon={Settings} />
        <IconButton icon={LogOut} label="Keluar" onClick={onLogout} className="size-11" />
      </div>
    </aside>
  )
}

function TopBar({ onLogout }) {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const quick = useQuick()
  const navigate = useNavigate()
  const name = profile?.name || user?.name || ''

  return (
    <header className="sticky top-0 z-20 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 lg:hidden">
          <Logo className="size-9" />
          <span className="font-display text-lg font-semibold">DompetKu</span>
        </Link>
        <span className="hidden font-display text-xl font-semibold xl:block">DompetKu</span>

        <nav className="hidden items-center gap-1 rounded-full border border-line bg-surface p-1 lg:flex xl:ml-4">
          {PRIMARY_NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors xl:px-4', isActive ? 'bg-ink text-canvas' : 'text-muted hover:text-ink')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button size="sm" icon={Plus} className="hidden xl:inline-flex" onClick={() => quick.openTransaction()}>
            Catat transaksi
          </Button>
          <IconButton icon={Plus} label="Catat transaksi" onClick={() => quick.openTransaction()} className="hidden bg-violet text-white hover:bg-violet-deep hover:text-white lg:inline-flex xl:hidden" />
          <NotificationBell />
          <Popover
            className="w-60 p-1.5"
            trigger={({ toggle }) => (
              <button type="button" onClick={toggle} className="flex items-center gap-2.5 rounded-full p-1 pr-1 hover:bg-sunken sm:pr-3 lg:pr-1 xl:pr-3" aria-label="Menu akun">
                <Avatar name={name} src={profile?.avatar_url} />
                <span className="hidden max-w-[140px] truncate text-sm font-semibold sm:block lg:hidden xl:block">{name}</span>
              </button>
            )}
          >
            {(close) => (
              <div>
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold">{name}</p>
                  <p className="truncate text-xs text-muted">{profile?.email || user?.email}</p>
                </div>
                <button type="button" onClick={() => { close(); navigate('/profil') }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sunken">
                  <UserRound className="size-4 text-muted" /> Profil & pengaturan
                </button>
                <button type="button" onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-expense hover:bg-expense-soft">
                  <LogOut className="size-4" /> Keluar
                </button>
              </div>
            )}
          </Popover>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  const quick = useQuick()
  const items = [PRIMARY_NAV[0], PRIMARY_NAV[1], null, PRIMARY_NAV[2], { to: '/lainnya', label: 'Lainnya', icon: MoreHorizontal }]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
        {items.map((item) =>
          item ? (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-[11px] font-semibold', isActive ? 'text-violet-ink' : 'text-faint')}
            >
              <item.icon className="size-[21px]" strokeWidth={2} />
              {item.label}
            </NavLink>
          ) : (
            <button
              key="add"
              type="button"
              onClick={() => quick.openTransaction()}
              aria-label="Catat transaksi"
              className="mx-auto grid size-12 -translate-y-3 place-items-center rounded-full bg-violet text-white shadow-[0_10px_24px_-8px_rgb(var(--violet)/0.7)]"
            >
              <Plus className="size-6" strokeWidth={2.4} />
            </button>
          )
        )}
      </div>
    </nav>
  )
}

function IncomeSetup() {
  const { data } = useProfile()
  const [later, setLater] = useState(false)
  if (!data || data.income_setup_done || later) return null
  return (
    <Modal open onClose={() => setLater(true)} title="Bagaimana kamu menerima pemasukan?" description="Supaya periode anggaran dan jatah harian sesuai. Bisa diubah kapan saja di Profil.">
      <IncomeForm profile={data} submitLabel="Mulai pakai DompetKu" />
    </Modal>
  )
}

export default function AppShell() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const onLogout = () => {
    logout()
    navigate('/masuk', { replace: true })
  }

  return (
    <QuickActionsProvider>
      <div className="min-h-dvh lg:pl-[88px]">
        <Rail onLogout={onLogout} />
        <TopBar onLogout={onLogout} />
        <main className="mx-auto max-w-[1320px] px-4 pb-28 pt-2 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
        <BottomNav />
        <IncomeSetup />
      </div>
    </QuickActionsProvider>
  )
}
