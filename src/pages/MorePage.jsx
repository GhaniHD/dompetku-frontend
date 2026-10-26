import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Bell, ChevronRight, LogOut, Moon, PieChart, Settings, ShieldCheck, Sun } from 'lucide-react'
import { useIsAdmin } from '../components/layout/AppShell'
import { SECONDARY_NAV } from '../components/layout/nav'
import { useAuth } from '../context/auth'
import { useTheme } from '../context/theme'

const ITEMS = [
  { to: '/anggaran', label: 'Anggaran', icon: PieChart, hint: 'Batas pengeluaran per periode' },
  { to: '/laporan', label: 'Laporan', icon: BarChart3, hint: 'Bulanan dan tahunan, unduh Excel' },
  ...SECONDARY_NAV,
  { to: '/notifikasi', label: 'Notifikasi', icon: Bell, hint: 'Semua pemberitahuan' },
  { to: '/profil', label: 'Profil & pengaturan', icon: Settings, hint: 'Akun, pemasukan & periode, password' },
]

export default function MorePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const isAdmin = useIsAdmin()
  const items = isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, hint: 'Persetujuan, pengguna, undangan' }, ...ITEMS] : ITEMS
  const row = 'flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-sunken'

  return (
    <div className="pt-2">
      <h1 className="mb-5 text-[28px] font-semibold">Lainnya</h1>
      <nav className="panel divide-y divide-line overflow-hidden">
        {items.map(({ to, label, icon: Icon, hint }) => (
          <Link key={to} to={to} className={row}>
            <span className="grid size-10 place-items-center rounded-2xl bg-violet-soft text-violet-ink"><Icon className="size-[18px]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{label}</span>
              <span className="block truncate text-[13px] text-muted">{hint}</span>
            </span>
            <ChevronRight className="size-4 text-faint" />
          </Link>
        ))}
      </nav>
      <div className="panel mt-4 divide-y divide-line overflow-hidden">
        <button type="button" onClick={toggle} className={row}>
          <span className="grid size-10 place-items-center rounded-2xl bg-sunken text-muted">{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</span>
          <span className="flex-1 font-semibold">{dark ? 'Pakai mode terang' : 'Pakai mode gelap'}</span>
        </button>
        <button type="button" onClick={() => { logout(); navigate('/masuk', { replace: true }) }} className={`${row} text-expense`}>
          <span className="grid size-10 place-items-center rounded-2xl bg-expense-soft"><LogOut className="size-[18px]" /></span>
          <span className="flex-1 font-semibold">Keluar</span>
        </button>
      </div>
    </div>
  )
}
