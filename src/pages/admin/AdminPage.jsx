import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Check, Copy, KeyRound, Link2, MoreVertical, Plus, Search, ShieldCheck, Trash2, UserCheck, UserX, Users } from 'lucide-react'
import { adminApi } from '../../api/endpoints'
import Popover from '../../components/layout/Popover'
import { Badge, Button, Empty, ErrorNote, Field, Input, Modal, PageHeader, Segmented, Select, Skeleton, Textarea } from '../../components/ui'
import { useFeedback } from '../../components/ui/feedback'
import { useAuth } from '../../context/auth'
import { useAction, useAdminInvites, useAdminLogs, useAdminSummary, useAdminUsers, useProfile } from '../../hooks/queries'
import { cn } from '../../lib/cn'
import { dateLabel, timeAgo } from '../../lib/format'

const STATUS = {
  pending: { label: 'Menunggu', tone: 'caution' },
  active: { label: 'Aktif', tone: 'income' },
  suspended: { label: 'Nonaktif', tone: 'expense' },
  rejected: { label: 'Ditolak', tone: 'neutral' },
}

const ACTION_LABEL = {
  approve: 'menyetujui',
  reject: 'menolak',
  suspend: 'menonaktifkan',
  activate: 'mengaktifkan lagi',
  delete: 'menghapus akun',
  reset_link: 'membuat link atur ulang password untuk',
  invite_create: 'membuat undangan',
  invite_revoke: 'membatalkan undangan',
}

function ShareLink({ open, onClose, title, description, url }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            className="mr-auto inline-flex h-11 items-center rounded-full bg-income-soft px-5 text-sm font-semibold text-income hover:bg-income-soft/70"
          >
            Kirim lewat WhatsApp
          </a>
          <Button icon={copied ? Check : Copy} onClick={copy}>{copied ? 'Tersalin' : 'Salin link'}</Button>
        </>
      }
    >
      <div className="break-all rounded-2xl bg-sunken px-4 py-3 font-mono text-[13px] text-ink">{url}</div>
    </Modal>
  )
}

function ReasonDialog({ open, title, description, confirmLabel, danger, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('')
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={() => onConfirm(reason.trim())}>{confirmLabel}</Button>
        </>
      }
    >
      <Field label="Alasan" hint="Opsional, hanya terlihat oleh admin.">
        {(id) => <Textarea id={id} value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />}
      </Field>
    </Modal>
  )
}

function SummaryStrip() {
  const { data, isLoading } = useAdminSummary()
  const cells = [
    ['Menunggu persetujuan', data?.pending, data?.pending ? 'text-caution' : ''],
    ['Pengguna aktif', data?.active, ''],
    ['Masuk 30 hari terakhir', data?.active_30d, ''],
    ['Undangan aktif', data?.active_invites, ''],
  ]
  return (
    <section className="panel mb-5 grid grid-cols-2 lg:grid-cols-4">
      {cells.map(([label, value, tone], i) => (
        <div key={label} className={cn('px-5 py-4 sm:px-6', i % 2 === 0 && 'border-r border-line', i < 2 && 'border-b border-line lg:border-b-0', i === 1 && 'lg:border-r')}>
          <p className="text-[13px] text-muted">{label}</p>
          {isLoading ? <Skeleton className="mt-2 h-8 w-16" /> : <p className={cn('num mt-1 text-[28px] font-semibold', tone)}>{value ?? 0}</p>}
        </div>
      ))}
    </section>
  )
}

function useUserActions() {
  const { toast, confirm } = useFeedback()
  const [reasonFor, setReasonFor] = useState(null)
  const [share, setShare] = useState(null)
  const done = (msg) => ({ onSuccess: () => toast(msg), onError: (e) => toast(e.message, 'error') })

  const approve = useAction(adminApi.approve, done('Pengguna disetujui'))
  const reject = useAction(({ id, reason }) => adminApi.reject(id, reason), { ...done('Pendaftaran ditolak'), onSettled: () => setReasonFor(null) })
  const suspend = useAction(({ id, reason }) => adminApi.suspend(id, reason), { ...done('Akun dinonaktifkan'), onSettled: () => setReasonFor(null) })
  const activate = useAction(adminApi.activate, done('Akun aktif lagi'))
  const remove = useAction(adminApi.remove, done('Akun dihapus'))
  const resetLink = useAction(adminApi.resetLink, {
    onSuccess: (res, id) => setShare({ url: `${window.location.origin}/atur-ulang-password?token=${res.token}`, id }),
    onError: (e) => toast(e.message, 'error'),
  })

  const askRemove = async (u) => {
    if (await confirm({ title: `Hapus akun ${u.name}?`, message: 'Akun dan semua data keuangannya dihapus permanen dan tidak bisa dipulihkan. Email ini bisa dipakai mendaftar lagi sebagai akun baru.', confirmLabel: 'Hapus permanen', danger: true })) remove.mutate(u.id)
  }

  const dialogs = (
    <>
      <ReasonDialog
        key={reasonFor ? reasonFor.kind + reasonFor.user.id : 'none'}
        open={!!reasonFor}
        title={reasonFor?.kind === 'reject' ? `Tolak pendaftaran ${reasonFor?.user.name}?` : `Nonaktifkan ${reasonFor?.user.name}?`}
        description={reasonFor?.kind === 'reject' ? 'Pengguna tidak bisa masuk. Kamu masih bisa menyetujuinya nanti dari tab Pengguna.' : 'Pengguna langsung keluar dari semua perangkat dan tidak bisa masuk sampai diaktifkan lagi.'}
        confirmLabel={reasonFor?.kind === 'reject' ? 'Tolak' : 'Nonaktifkan'}
        danger
        loading={reject.isPending || suspend.isPending}
        onClose={() => setReasonFor(null)}
        onConfirm={(reason) => (reasonFor.kind === 'reject' ? reject : suspend).mutate({ id: reasonFor.user.id, reason })}
      />
      <ShareLink
        open={!!share}
        onClose={() => setShare(null)}
        title="Link atur ulang password"
        description="Kirim link ini langsung ke pemilik akun. Berlaku 24 jam dan hanya bisa dipakai sekali. Link sebelumnya otomatis tidak berlaku."
        url={share?.url || ''}
      />
    </>
  )

  return { approve, activate, resetLink, askRemove, askReject: (user) => setReasonFor({ kind: 'reject', user }), askSuspend: (user) => setReasonFor({ kind: 'suspend', user }), dialogs }
}

function PendingTab() {
  const users = useAdminUsers({ status: 'pending' })
  const actions = useUserActions()
  const list = users.data || []

  return (
    <>
      <ErrorNote error={users.error} onRetry={users.refetch} />
      {users.isLoading ? (
        <Skeleton className="h-48" />
      ) : list.length === 0 ? (
        <section className="panel">
          <Empty icon={UserCheck} title="Tidak ada pendaftar yang menunggu">Pendaftar baru akan muncul di sini. Kamu juga mendapat notifikasi setiap ada yang mendaftar.</Empty>
        </section>
      ) : (
        <section className="panel divide-y divide-line">
          {list.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{u.name}</p>
                <p className="truncate text-sm text-muted">{u.email}</p>
                <p className="text-xs text-faint">Mendaftar {timeAgo(u.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="danger-soft" icon={UserX} onClick={() => actions.askReject(u)}>Tolak</Button>
                <Button icon={UserCheck} loading={actions.approve.isPending && actions.approve.variables === u.id} onClick={() => actions.approve.mutate(u.id)}>Setujui</Button>
              </div>
            </div>
          ))}
        </section>
      )}
      {actions.dialogs}
    </>
  )
}

function UserMenu({ user, actions, self }) {
  const item = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-sunken'
  const protectedUser = user.role === 'admin' || self
  return (
    <Popover
      className="w-60 p-1.5"
      trigger={({ toggle }) => (
        <button type="button" onClick={toggle} aria-label={`Aksi untuk ${user.name}`} className="rounded-full p-2 text-faint hover:bg-sunken hover:text-ink">
          <MoreVertical className="size-4" />
        </button>
      )}
    >
      {(close) => (
        <div>
          {(user.status === 'pending' || user.status === 'rejected') && (
            <button type="button" className={item} onClick={() => { close(); actions.approve.mutate(user.id) }}><UserCheck className="size-4 text-muted" /> Setujui</button>
          )}
          {user.status === 'suspended' && (
            <button type="button" className={item} onClick={() => { close(); actions.activate.mutate(user.id) }}><UserCheck className="size-4 text-muted" /> Aktifkan lagi</button>
          )}
          <button type="button" className={item} onClick={() => { close(); actions.resetLink.mutate(user.id) }}><KeyRound className="size-4 text-muted" /> Buat link atur ulang password</button>
          {!protectedUser && user.status === 'active' && (
            <button type="button" className={cn(item, 'text-expense hover:bg-expense-soft')} onClick={() => { close(); actions.askSuspend(user) }}><UserX className="size-4" /> Nonaktifkan</button>
          )}
          {!protectedUser && user.status === 'pending' && (
            <button type="button" className={cn(item, 'text-expense hover:bg-expense-soft')} onClick={() => { close(); actions.askReject(user) }}><UserX className="size-4" /> Tolak</button>
          )}
          {!protectedUser && (
            <button type="button" className={cn(item, 'text-expense hover:bg-expense-soft')} onClick={() => { close(); actions.askRemove(user) }}><Trash2 className="size-4" /> Hapus akun</button>
          )}
        </div>
      )}
    </Popover>
  )
}

function UsersTab() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const users = useAdminUsers({ status: status || undefined, q: q.trim() || undefined })
  const actions = useUserActions()
  const { data: me } = useProfile()
  const list = users.data || []

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email" className="pl-10" aria-label="Cari pengguna" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Semua status</option>
          {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </Select>
      </div>
      <ErrorNote error={users.error} onRetry={users.refetch} />
      {users.isLoading ? (
        <Skeleton className="h-64" />
      ) : list.length === 0 ? (
        <section className="panel"><Empty icon={Users} title="Tidak ada pengguna yang cocok" /></section>
      ) : (
        <section className={cn('panel divide-y divide-line transition-opacity', users.isFetching && 'opacity-60')}>
          {list.map((u) => {
            const st = STATUS[u.status] || STATUS.active
            return (
              <div key={u.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{u.name}</span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {u.role === 'admin' && <Badge tone="violet"><ShieldCheck className="size-3" /> Admin</Badge>}
                    {u.invite_code && <Badge>Undangan {u.invite_code}</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted">{u.email}</p>
                  <p className="mt-1 text-xs text-faint">
                    Daftar {dateLabel(u.created_at)}, {u.last_login_at ? `terakhir masuk ${timeAgo(u.last_login_at)}` : 'belum pernah masuk'}, {u.wallets} dompet, {u.transactions} transaksi
                  </p>
                  {u.status_reason && <p className="mt-1 text-xs text-muted">Alasan: {u.status_reason}</p>}
                </div>
                <UserMenu user={u} actions={actions} self={me?.id === u.id} />
              </div>
            )
          })}
        </section>
      )}
      {actions.dialogs}
    </>
  )
}

const INVITE_TONE = { aktif: 'income', habis: 'neutral', kedaluwarsa: 'neutral', dibatalkan: 'expense' }

function InvitesTab() {
  const { toast, confirm } = useFeedback()
  const invites = useAdminInvites()
  const [form, setForm] = useState({ note: '', max_uses: '1', valid_days: '7' })
  const [share, setShare] = useState(null)
  const linkOf = (code) => `${window.location.origin}/daftar?undangan=${code}`

  const create = useAction(adminApi.createInvite, {
    onSuccess: (inv) => {
      setForm({ note: '', max_uses: '1', valid_days: '7' })
      setShare(inv)
    },
    onError: (e) => toast(e.message, 'error'),
  })
  const revoke = useAction(adminApi.revokeInvite, { onSuccess: () => toast('Undangan dibatalkan') })

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="panel p-5 sm:p-6">
        <h2 className="mb-1 text-[17px] font-semibold">Buat undangan</h2>
        <p className="mb-4 text-sm text-muted">Orang yang mendaftar lewat link undangan langsung aktif tanpa perlu disetujui.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate({ note: form.note.trim(), max_uses: Number(form.max_uses), valid_days: Number(form.valid_days) })
          }}
          className="space-y-4"
        >
          <Field label="Untuk siapa" hint="Catatan untuk kamu sendiri.">
            {(id) => <Input id={id} value={form.note} maxLength={200} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Mis. Adik, teman kantor" />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bisa dipakai">
              {(id) => (
                <Select id={id} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}>
                  {[1, 2, 3, 5, 10, 20].map((n) => <option key={n} value={n}>{n} orang</option>)}
                </Select>
              )}
            </Field>
            <Field label="Berlaku">
              {(id) => (
                <Select id={id} value={form.valid_days} onChange={(e) => setForm({ ...form, valid_days: e.target.value })}>
                  {[1, 3, 7, 14, 30].map((n) => <option key={n} value={n}>{n} hari</option>)}
                </Select>
              )}
            </Field>
          </div>
          <Button type="submit" icon={Plus} className="w-full" loading={create.isPending}>Buat link undangan</Button>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <header className="border-b border-line px-6 py-4">
          <h2 className="text-[17px] font-semibold">Daftar undangan</h2>
        </header>
        <ErrorNote error={invites.error} onRetry={invites.refetch} />
        {invites.isLoading ? (
          <div className="p-6"><Skeleton className="h-32" /></div>
        ) : !invites.data?.length ? (
          <Empty icon={Link2} title="Belum ada undangan">Buat undangan untuk orang yang ingin kamu ajak memakai MyFulus.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {invites.data.map((inv) => (
              <li key={inv.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num font-semibold tracking-[0.12em]">{inv.code}</span>
                    <Badge tone={INVITE_TONE[inv.status]}>{inv.status[0].toUpperCase() + inv.status.slice(1)}</Badge>
                  </div>
                  {inv.note && <p className="truncate text-sm">{inv.note}</p>}
                  <p className="text-xs text-faint">
                    Terpakai {inv.used_count} dari {inv.max_uses}, berlaku sampai {dateLabel(inv.expires_at)}
                  </p>
                  {inv.used_by.length > 0 && <p className="mt-0.5 truncate text-xs text-muted">Dipakai oleh {inv.used_by.join(', ')}</p>}
                </div>
                {inv.status === 'aktif' && (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setShare(inv)} aria-label={`Bagikan ${inv.code}`} className="rounded-full p-2 text-muted hover:bg-sunken hover:text-ink"><Link2 className="size-4" /></button>
                    <button
                      type="button"
                      aria-label={`Batalkan ${inv.code}`}
                      onClick={async () => { if (await confirm({ title: `Batalkan undangan ${inv.code}?`, message: 'Link ini tidak bisa dipakai mendaftar lagi. Akun yang sudah dibuat tidak terpengaruh.', confirmLabel: 'Batalkan undangan', danger: true })) revoke.mutate(inv.id) }}
                      className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ShareLink
        open={!!share}
        onClose={() => setShare(null)}
        title={`Undangan ${share?.code || ''}`}
        description="Kirim link ini ke orang yang kamu undang. Kode juga bisa diketik manual di halaman daftar."
        url={share ? linkOf(share.code) : ''}
      />
    </div>
  )
}

function LogsTab() {
  const logs = useAdminLogs()
  if (logs.isLoading) return <Skeleton className="h-64" />
  return (
    <>
      <ErrorNote error={logs.error} onRetry={logs.refetch} />
      {!logs.data?.length ? (
        <section className="panel"><Empty icon={ShieldCheck} title="Belum ada aktivitas admin" /></section>
      ) : (
        <section className="panel divide-y divide-line">
          {logs.data.map((l) => (
            <div key={l.id} className="px-5 py-3.5 text-sm sm:px-6">
              <p>
                <span className="font-semibold">{l.admin_name}</span> {ACTION_LABEL[l.action] || l.action}{' '}
                {l.target_name && <span className="font-semibold">{l.target_name}</span>}
                {!l.target_name && l.action.startsWith('invite') && l.action === 'invite_create' && <span className="num font-semibold">{l.detail}</span>}
              </p>
              {l.detail && l.target_name && <p className="text-[13px] text-muted">{l.detail}</p>}
              <p className="text-xs text-faint">{timeAgo(l.created_at)}</p>
            </div>
          ))}
        </section>
      )}
    </>
  )
}

const TABS = [
  { value: 'persetujuan', label: 'Persetujuan' },
  { value: 'pengguna', label: 'Pengguna' },
  { value: 'undangan', label: 'Undangan' },
  { value: 'log', label: 'Log' },
]

export default function AdminPage() {
  const { user } = useAuth()
  const profile = useProfile()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'persetujuan'
  const role = profile.data?.role || user?.role

  if (profile.isLoading && !user?.role) return <Skeleton className="mt-4 h-64" />
  if (role !== 'admin') return <Navigate to="/" replace />

  return (
    <div>
      <PageHeader title="Admin" description="Kelola siapa yang bisa memakai MyFulus. Admin tidak bisa melihat saldo atau isi transaksi pengguna." />
      <SummaryStrip />
      <div className="mb-4">
        <Segmented size="sm" className="w-full sm:w-auto" value={tab} onChange={(v) => setParams({ tab: v })} options={TABS} />
      </div>
      {tab === 'persetujuan' && <PendingTab />}
      {tab === 'pengguna' && <UsersTab />}
      {tab === 'undangan' && <InvitesTab />}
      {tab === 'log' && <LogsTab />}
    </div>
  )
}
