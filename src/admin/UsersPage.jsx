import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, ChevronRight, KeyRound, LogOut, MailWarning, Search, ShieldCheck, Trash2, UserCheck, UserX, Users } from 'lucide-react'
import { Badge, Button, Empty, ErrorNote, Input, Modal, PageHeader, Select, Skeleton } from '../components/ui'
import { useAdminUser, useAdminUsers } from '../hooks/queries'
import { cn } from '../lib/cn'
import { dateLabel, timeAgo } from '../lib/format'
import { EVENTS, STATUS } from './constants'
import { OnlineDot, useUserActions } from './shared'

function EmailBadge({ u }) {
  if (u.role === 'admin') return null
  if (u.email_bounced) return <Badge tone="expense"><MailWarning className="size-3" /> Email terpental</Badge>
  if (!u.email_verified) return <Badge tone="caution"><MailWarning className="size-3" /> Email belum diverifikasi</Badge>
  return null
}

const emailState = (u) => (u.email_bounced ? 'Terpental' : u.email_verified ? 'Terverifikasi' : u.email_pending ? 'Belum, sedang ganti email' : 'Belum diverifikasi')

const lastActive = (u) => (u.online ? 'Online sekarang' : u.last_seen_at ? `Aktif ${timeAgo(u.last_seen_at)}` : u.last_login_at ? `Masuk ${timeAgo(u.last_login_at)}` : 'Belum pernah masuk')

export function EventRow({ e, showUser }) {
  const ev = EVENTS[e.event] || { label: e.event, tone: 'neutral' }
  return (
    <li className="flex items-start gap-3 py-3">
      <Badge tone={ev.tone} className="mt-0.5 w-[136px] shrink-0 justify-center">{ev.label}</Badge>
      <div className="min-w-0 flex-1 text-sm">
        {showUser && <p className="truncate font-semibold">{e.user_name || e.email || 'Tidak dikenal'}{e.user_name && <span className="font-normal text-muted"> · {e.email}</span>}</p>}
        {e.detail && <p className="text-muted">{e.detail}</p>}
        <p className="truncate text-xs text-faint">{e.device || 'Perangkat tidak dikenal'}{e.ip && ` · ${e.ip}`}</p>
      </div>
      <span className="shrink-0 text-xs text-faint" title={new Date(e.created_at).toLocaleString('id-ID')}>{timeAgo(e.created_at)}</span>
    </li>
  )
}

function UserDetail({ id, onClose }) {
  const { data, isLoading } = useAdminUser(id)
  const actions = useUserActions({ onDeleted: onClose })
  const u = data?.user
  const st = u ? STATUS[u.status] || STATUS.active : null
  const isAdmin = u?.role === 'admin'

  const facts = u
    ? [
        ['Status', st.label],
        ['Email', isAdmin ? 'Admin' : emailState(u)],
        ['Terakhir aktif', u.online ? 'Online sekarang' : u.last_seen_at ? new Date(u.last_seen_at).toLocaleString('id-ID') : '—'],
        ['Login terakhir', u.last_login_at ? `${new Date(u.last_login_at).toLocaleString('id-ID')}` : 'Belum pernah'],
        ['Perangkat', u.last_login_device || '—'],
        ['Daftar', dateLabel(u.created_at)],
        ['Disetujui', u.approved_at ? dateLabel(u.approved_at) : '—'],
        ['Jumlah data', `${u.wallets} dompet, ${u.transactions} transaksi`],
        ['Undangan', u.invite_code || '—'],
      ]
    : []

  return (
    <Modal open onClose={onClose} wide title={u ? u.name : 'Memuat'} description={u?.email}>
      {isLoading || !u ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <OnlineDot online={u.online} />
            <span className="text-sm font-semibold">{lastActive(u)}</span>
            <Badge tone={st.tone}>{st.label}</Badge>
            {isAdmin && <Badge tone="violet"><ShieldCheck className="size-3" /> Admin</Badge>}
            {!isAdmin && u.email_verified && <Badge tone="income"><BadgeCheck className="size-3" /> Email terverifikasi</Badge>}
            <EmailBadge u={u} />
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 rounded-2xl bg-sunken p-4 text-sm sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 sm:block">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-semibold sm:text-left">{v}</dd>
              </div>
            ))}
          </dl>
          {u.status_reason && <p className="text-sm text-muted">Alasan status: {u.status_reason}</p>}

          {!isAdmin && (
            <div className="flex flex-wrap gap-2">
              {(u.status === 'pending' || u.status === 'rejected') && <Button size="sm" icon={UserCheck} onClick={() => actions.approve.mutate(u.id)}>Setujui</Button>}
              {u.status === 'suspended' && <Button size="sm" icon={UserCheck} onClick={() => actions.activate.mutate(u.id)}>Aktifkan lagi</Button>}
              {u.status === 'active' && <Button size="sm" variant="outline" icon={LogOut} onClick={() => actions.askForceLogout(u)}>Keluarkan dari perangkat</Button>}
              <Button size="sm" variant="outline" icon={KeyRound} onClick={() => actions.askResetLink(u)}>Link atur ulang password</Button>
              {!u.email_verified && <Button size="sm" variant="outline" icon={BadgeCheck} onClick={() => actions.askVerifyEmail(u)}>Tandai email terverifikasi</Button>}
              {u.status === 'active' && <Button size="sm" variant="danger-soft" icon={UserX} onClick={() => actions.askSuspend(u)}>Nonaktifkan</Button>}
              {u.status === 'pending' && <Button size="sm" variant="danger-soft" icon={UserX} onClick={() => actions.askReject(u)}>Tolak</Button>}
              <Button size="sm" variant="danger-soft" icon={Trash2} onClick={() => actions.askRemove(u)}>Hapus permanen</Button>
            </div>
          )}

          <div>
            <h3 className="mb-1 font-semibold">Aktivitas 7 hari terakhir</h3>
            {data.events.length === 0 ? (
              <p className="py-3 text-sm text-muted">Belum ada aktivitas tercatat.</p>
            ) : (
              <ul className="max-h-[320px] divide-y divide-line overflow-y-auto">
                {data.events.map((e) => <EventRow key={e.id} e={e} />)}
              </ul>
            )}
          </div>
        </div>
      )}
      {actions.dialogs}
    </Modal>
  )
}

export default function UsersPage() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const status = params.get('status') || ''
  const online = params.get('online') === '1'
  const users = useAdminUsers({ status: status || undefined, q: q.trim() || undefined, online: online || undefined })
  const [openId, setOpenId] = useState(null)
  const list = users.data || []
  const setParam = (k, v) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  return (
    <div>
      <PageHeader title="Pengguna" description="Cari, lihat aktivitas, dan kelola akun. Isi keuangan pengguna tidak pernah ditampilkan." />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email" className="pl-10" aria-label="Cari pengguna" />
        </div>
        <Select value={status} onChange={(e) => setParam('status', e.target.value)} aria-label="Status">
          <option value="">Semua status</option>
          {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </Select>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold">
          <input type="checkbox" checked={online} onChange={(e) => setParam('online', e.target.checked ? '1' : '')} className="size-4 accent-[rgb(var(--violet))]" />
          Hanya yang online
        </label>
      </div>
      <ErrorNote error={users.error} onRetry={users.refetch} />
      {users.isLoading ? (
        <Skeleton className="h-64" />
      ) : list.length === 0 ? (
        <section className="panel"><Empty icon={Users} title={online ? 'Tidak ada pengguna yang online' : 'Tidak ada pengguna yang cocok'} /></section>
      ) : (
        <section className={cn('panel divide-y divide-line transition-opacity', users.isFetching && 'opacity-60')}>
          {list.map((u) => {
            const st = STATUS[u.status] || STATUS.active
            return (
              <button key={u.id} type="button" onClick={() => setOpenId(u.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-sunken/60 sm:px-6">
                <OnlineDot online={u.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{u.name}</span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {u.role === 'admin' && <Badge tone="violet"><ShieldCheck className="size-3" /> Admin</Badge>}
                    <EmailBadge u={u} />
                  </div>
                  <p className="truncate text-sm text-muted">{u.email}</p>
                  <p className="mt-0.5 text-xs text-faint">
                    <span className={cn(u.online && 'font-semibold text-income')}>{lastActive(u)}</span> · {u.wallets} dompet, {u.transactions} transaksi · daftar {dateLabel(u.created_at)}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-faint" />
              </button>
            )
          })}
        </section>
      )}
      {openId && <UserDetail id={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
