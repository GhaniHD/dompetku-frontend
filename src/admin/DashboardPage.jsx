import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { CountBarChart } from '../components/charts'
import { Empty, ErrorNote, PageHeader, Panel, Skeleton } from '../components/ui'
import { useAdminSummary, useAdminUsers } from '../hooks/queries'
import { timeAgo } from '../lib/format'
import { OnlineDot, Stat } from './shared'

const hourLabel = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
const weekLabel = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

function OnlineList() {
  const { data = [], isLoading } = useAdminUsers({ online: true })
  return (
    <Panel title="Sedang online" action={<Link to="/admin/pengguna?online=1" className="text-sm font-semibold text-violet-ink hover:underline">Lihat semua</Link>}>
      {isLoading ? (
        <Skeleton className="h-24" />
      ) : data.length === 0 ? (
        <p className="text-sm text-muted">Tidak ada pengguna yang online saat ini.</p>
      ) : (
        <ul className="space-y-3">
          {data.slice(0, 6).map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <OnlineDot online />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{u.name}</p>
                <p className="truncate text-xs text-muted">{u.last_login_device || 'Perangkat tidak dikenal'}</p>
              </div>
              <span className="shrink-0 text-xs text-faint">{timeAgo(u.last_seen_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminSummary()
  const online = data?.online_24h || []
  const weeks = data?.registrations || []
  const peak = online.reduce((m, h) => (h.users > m.users ? h : m), { users: 0 })

  return (
    <div>
      <PageHeader title="Dasbor" description="Kondisi akun dan keamanan MyFulus. Admin tidak bisa melihat saldo atau isi transaksi pengguna." />
      <ErrorNote error={error} onRetry={refetch} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label="Online sekarang" value={data?.online_now} dot loading={isLoading} to="/admin/pengguna?online=1" />
        <Stat label="Menunggu persetujuan" value={data?.pending} tone={data?.pending ? 'text-caution' : ''} loading={isLoading} to="/admin/persetujuan" />
        <Stat label="Pengguna aktif" value={data?.active} loading={isLoading} to="/admin/pengguna" />
        <Stat label="Login gagal 24 jam" value={data?.login_failed_24h} tone={data?.login_failed_24h ? 'text-expense' : ''} loading={isLoading} to="/admin/aktivitas?event=login_failed" />
      </div>

      {data?.suspicious?.length > 0 && (
        <section className="mb-5 rounded-2xl border border-expense/30 bg-expense-soft p-5">
          <p className="mb-3 flex items-center gap-2 font-semibold text-expense"><ShieldAlert className="size-5" /> Percobaan login mencurigakan (1 jam terakhir)</p>
          <ul className="space-y-1.5 text-sm">
            {data.suspicious.map((s) => (
              <li key={s.email} className="flex flex-wrap items-center gap-x-3">
                <Link to={`/admin/aktivitas?q=${encodeURIComponent(s.email)}`} className="font-semibold hover:underline">{s.email}</Link>
                <span className="text-muted">{s.attempts} kali gagal dari {s.ips} IP, terakhir {timeAgo(s.last_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Pengguna online per jam" action={peak.users > 0 && <span className="hidden text-xs text-muted sm:inline">Tertinggi {peak.users} orang, pukul {hourLabel(peak.hour)}</span>}>
          {isLoading ? <Skeleton className="h-[220px]" /> : <CountBarChart labels={online.map((h) => hourLabel(h.hour))} data={online.map((h) => h.users)} unit="pengguna" highlightLast />}
          <p className="mt-2 text-xs text-faint">24 jam terakhir. Satu pengguna dihitung sekali per jam.</p>
        </Panel>
        <OnlineList />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Pendaftar baru per minggu">
          {isLoading ? <Skeleton className="h-[200px]" /> : <CountBarChart labels={weeks.map((w) => weekLabel(w.week))} data={weeks.map((w) => w.count)} unit="pendaftar" tone="income" height={200} highlightLast />}
          <p className="mt-2 text-xs text-faint">8 minggu terakhir, minggu dimulai hari Senin.</p>
        </Panel>
        <Panel title="Ringkasan akun">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : !data ? (
            <Empty title="Belum ada data" />
          ) : (
            <dl className="space-y-2.5 text-sm">
              {[
                ['Total akun', data.total_users],
                ['Aktif masuk 30 hari terakhir', data.active_30d],
                ['Daftar 7 hari terakhir', data.new_7d],
                ['Nonaktif', data.suspended],
                ['Ditolak', data.rejected],
                ['Undangan aktif', data.active_invites],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="num font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>
    </div>
  )
}
