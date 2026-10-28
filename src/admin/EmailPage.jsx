import { MailX } from 'lucide-react'
import { CountBarChart } from '../components/charts'
import { ErrorNote, PageHeader, Panel, Progress, Skeleton } from '../components/ui'
import { useAdminEmailStats } from '../hooks/queries'
import { Stat } from './shared'

const KINDS = {
  code: 'Kode verifikasi',
  reset: 'Atur ulang password',
  approved: 'Akun disetujui',
  email_changed: 'Email diganti',
  login_alert: 'Login perangkat baru',
  reminder: 'Pengingat jatuh tempo',
  weekly: 'Ringkasan mingguan',
  new_signup: 'Pendaftar baru (ke admin)',
}

const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

function lastDays(daily, n = 14) {
  const map = new Map(daily.map((d) => [d.date, d]))
  const out = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push(map.get(key) || { date: key, sent: 0, failed: 0 })
  }
  return out
}

export default function EmailPage() {
  const { data, isLoading, error, refetch } = useAdminEmailStats()
  const days = lastDays(data?.daily || [])
  const used = data ? Math.min(100, Math.round((data.sent_today / data.daily_cap) * 100)) : 0

  return (
    <div>
      <PageHeader title="Email" description="Jumlah email yang dikirim MyFulus. Isi email dan alamat penerima tidak ditampilkan." />
      <ErrorNote error={error} onRetry={refetch} />

      {data && !data.enabled && (
        <section className="mb-5 flex gap-3 rounded-2xl border border-caution/30 bg-caution-soft p-5 text-sm">
          <MailX className="mt-0.5 size-5 shrink-0 text-caution" />
          <div>
            <p className="font-semibold">Pengiriman email belum aktif</p>
            <p className="mt-1 text-muted">Isi SMTP_HOST, SMTP_USER, dan SMTP_PASS di environment server. Selama belum aktif, verifikasi email tidak diwajibkan.</p>
          </div>
        </section>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label="Terkirim hari ini" value={data?.sent_today} loading={isLoading} />
        <Stat label="Dalam antrean" value={data?.pending} loading={isLoading} />
        <Stat label="Email terverifikasi" value={data?.verified} tone="text-income" loading={isLoading} to="/admin/pengguna" />
        <Stat label="Email terpental" value={data?.bounced} tone={data?.bounced ? 'text-expense' : ''} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Kiriman 14 hari terakhir">
          {isLoading ? <Skeleton className="h-[220px]" /> : <CountBarChart labels={days.map((d) => dayLabel(d.date))} data={days.map((d) => d.sent)} unit="email" highlightLast />}
        </Panel>
        <div className="space-y-5">
          <Panel title="Jatah harian">
            {isLoading || !data ? (
              <Skeleton className="h-16" />
            ) : (
              <>
                <p className="num text-2xl font-semibold">
                  {data.sent_today} <span className="text-base font-normal text-muted">/ {data.daily_cap} email</span>
                </p>
                <Progress value={used} tone={used >= 90 ? 'expense' : used >= 70 ? 'caution' : 'violet'} className="mt-3" />
                <p className="mt-2 text-[13px] text-muted">
                  Batas Brevo gratis {data.provider_limit} email per hari. Setelah {data.daily_cap}, hanya kode verifikasi dan atur ulang password yang dikirim.
                </p>
              </>
            )}
          </Panel>
          <Panel title="Verifikasi pengguna">
            {isLoading || !data ? (
              <Skeleton className="h-24" />
            ) : (
              <dl className="space-y-2 text-sm">
                {[
                  ['Sudah terverifikasi', data.verified],
                  ['Belum terverifikasi', data.unverified],
                  ['Lewat masa tenggang', data.overdue],
                  ['Sedang ganti email', data.pending_change],
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

      <Panel title="Per jenis, 7 hari terakhir" className="mt-5">
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : !data?.by_kind?.length ? (
          <p className="text-sm text-muted">Belum ada email dalam 7 hari terakhir.</p>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-[13px] text-muted">
                  <th className="px-1 py-2 font-semibold">Jenis</th>
                  <th className="px-1 py-2 text-right font-semibold">Terkirim</th>
                  <th className="px-1 py-2 text-right font-semibold">Antre</th>
                  <th className="px-1 py-2 text-right font-semibold">Gagal</th>
                  <th className="px-1 py-2 text-right font-semibold">Dilewati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.by_kind.map((k) => (
                  <tr key={k.kind}>
                    <td className="px-1 py-2.5 font-semibold">{KINDS[k.kind] || k.kind}</td>
                    <td className="num px-1 py-2.5 text-right">{k.sent}</td>
                    <td className="num px-1 py-2.5 text-right">{k.pending}</td>
                    <td className={`num px-1 py-2.5 text-right ${k.failed ? 'font-semibold text-expense' : ''}`}>{k.failed}</td>
                    <td className="num px-1 py-2.5 text-right text-muted">{k.skipped}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
