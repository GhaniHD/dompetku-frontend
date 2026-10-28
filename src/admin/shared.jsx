import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { adminApi } from '../api/endpoints'
import { Button, Field, Modal, Skeleton, Textarea } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction } from '../hooks/queries'
import { cn } from '../lib/cn'
import { PasswordInput } from '../pages/auth/LoginPage'

export function OnlineDot({ online, className }) {
  return (
    <span
      title={online ? 'Sedang online' : 'Offline'}
      aria-label={online ? 'Sedang online' : 'Offline'}
      className={cn('inline-block size-2.5 shrink-0 rounded-full', online ? 'bg-income shadow-[0_0_0_3px_rgb(var(--income)/0.18)]' : 'bg-line', className)}
    />
  )
}

export function Stat({ label, value, tone, dot, to, loading }) {
  const body = (
    <>
      <p className="flex items-center gap-2 text-[13px] text-muted">{dot && <OnlineDot online />} {label}</p>
      {loading ? <Skeleton className="mt-2 h-9 w-16" /> : <p className={cn('num mt-1 text-[32px] font-semibold leading-tight', tone)}>{value ?? 0}</p>}
    </>
  )
  return to ? (
    <Link to={to} className="panel block p-5 transition-colors hover:border-violet/40">{body}</Link>
  ) : (
    <div className="panel p-5">{body}</div>
  )
}

export function ShareLink({ open, onClose, title, description, url }) {
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

function ReasonDialog({ open, title, description, confirmLabel, onClose, onConfirm, loading }) {
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
          <Button variant="danger" loading={loading} onClick={() => onConfirm(reason.trim())}>{confirmLabel}</Button>
        </>
      }
    >
      <Field label="Alasan" hint="Opsional, hanya terlihat oleh admin.">
        {(id) => <Textarea id={id} value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} />}
      </Field>
    </Modal>
  )
}

// PasswordDialog meminta admin mengetik ulang password sebelum aksi berbahaya.
function PasswordDialog({ request, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!request) return null
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await request.run(password)
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={request.title}
      description={request.description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="admin-confirm" variant={request.danger ? 'danger' : 'primary'} loading={busy} disabled={!password}>{request.confirmLabel}</Button>
        </>
      }
    >
      <form id="admin-confirm" onSubmit={submit} className="space-y-3">
        <Field label="Password admin" hint="Diminta ulang untuk aksi yang berisiko.">
          {(id) => <PasswordInput id={id} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />}
        </Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserActions({ onDeleted } = {}) {
  const { toast } = useFeedback()
  const [reasonFor, setReasonFor] = useState(null)
  const [share, setShare] = useState(null)
  const [confirmReq, setConfirmReq] = useState(null)
  const done = (msg) => ({ onSuccess: () => toast(msg), onError: (e) => toast(e.message, 'error') })

  const approve = useAction(adminApi.approve, done('Pengguna disetujui'))
  const reject = useAction(({ id, reason }) => adminApi.reject(id, reason), { ...done('Pendaftaran ditolak'), onSettled: () => setReasonFor(null) })
  const suspend = useAction(({ id, reason }) => adminApi.suspend(id, reason), { ...done('Akun dinonaktifkan'), onSettled: () => setReasonFor(null) })
  const activate = useAction(adminApi.activate, done('Akun aktif lagi'))
  const remove = useAction(adminApi.remove, { onSuccess: () => { toast('Akun dihapus permanen'); onDeleted?.() } })
  const forceLogout = useAction(adminApi.forceLogout, { onSuccess: () => toast('Pengguna dikeluarkan dari semua perangkat') })
  const verifyEmail = useAction(adminApi.verifyEmail, { onSuccess: () => toast('Email ditandai terverifikasi') })
  const resetLink = useAction(adminApi.resetLink, {
    onSuccess: (res) => setShare({ url: `${window.location.origin}/atur-ulang-password?token=${res.token}` }),
  })

  const askRemove = (u) =>
    setConfirmReq({
      title: `Hapus akun ${u.name}?`,
      description: 'Akun dan semua datanya dihapus permanen dan tidak bisa dipulihkan. Email ini bisa dipakai mendaftar lagi sebagai akun baru.',
      confirmLabel: 'Hapus permanen',
      danger: true,
      run: (password) => remove.mutateAsync({ id: u.id, password }),
    })
  const askForceLogout = (u) =>
    setConfirmReq({
      title: `Keluarkan ${u.name}?`,
      description: 'Pengguna langsung keluar dari perangkatnya dan harus masuk lagi. Datanya tidak berubah.',
      confirmLabel: 'Keluarkan',
      danger: true,
      run: (password) => forceLogout.mutateAsync({ id: u.id, password }),
    })
  const askResetLink = (u) =>
    setConfirmReq({
      title: `Buat link atur ulang password untuk ${u.name}?`,
      description: 'Link berlaku 24 jam dan hanya bisa dipakai sekali. Link sebelumnya otomatis tidak berlaku.',
      confirmLabel: 'Buat link',
      run: (password) => resetLink.mutateAsync({ id: u.id, password }),
    })

  const askVerifyEmail = (u) =>
    setConfirmReq({
      title: `Tandai email ${u.name} terverifikasi?`,
      description: `Pakai ini hanya bila kamu sudah memastikan ${u.email} memang milik pengguna ini, misalnya kode tidak pernah sampai. Tindakan ini dicatat di log admin.`,
      confirmLabel: 'Tandai terverifikasi',
      run: (password) => verifyEmail.mutateAsync({ id: u.id, password }),
    })

  const dialogs = (
    <>
      <ReasonDialog
        key={reasonFor ? reasonFor.kind + reasonFor.user.id : 'none'}
        open={!!reasonFor}
        title={reasonFor?.kind === 'reject' ? `Tolak pendaftaran ${reasonFor?.user.name}?` : `Nonaktifkan ${reasonFor?.user.name}?`}
        description={reasonFor?.kind === 'reject' ? 'Pengguna tidak bisa masuk. Kamu masih bisa menyetujuinya nanti dari menu Pengguna.' : 'Pengguna langsung keluar dari semua perangkat dan tidak bisa masuk sampai diaktifkan lagi.'}
        confirmLabel={reasonFor?.kind === 'reject' ? 'Tolak' : 'Nonaktifkan'}
        loading={reject.isPending || suspend.isPending}
        onClose={() => setReasonFor(null)}
        onConfirm={(reason) => (reasonFor.kind === 'reject' ? reject : suspend).mutate({ id: reasonFor.user.id, reason })}
      />
      <PasswordDialog key={confirmReq?.title || 'none'} request={confirmReq} onClose={() => setConfirmReq(null)} />
      <ShareLink
        open={!!share}
        onClose={() => setShare(null)}
        title="Link atur ulang password"
        description="Kirim link ini langsung ke pemilik akun. Berlaku 24 jam dan hanya bisa dipakai sekali."
        url={share?.url || ''}
      />
    </>
  )

  return {
    approve, activate, askRemove, askForceLogout, askResetLink, askVerifyEmail, dialogs,
    askReject: (user) => setReasonFor({ kind: 'reject', user }),
    askSuspend: (user) => setReasonFor({ kind: 'suspend', user }),
  }
}
