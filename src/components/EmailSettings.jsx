import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, MailWarning, TriangleAlert } from 'lucide-react'
import { profileApi } from '../api/endpoints'
import { useAuth } from '../context/auth'
import { cn } from '../lib/cn'
import { dateLabel } from '../lib/format'
import { PasswordInput } from '../pages/auth/LoginPage'
import CodeVerify from './CodeVerify'
import { Badge, Button, Field, Input, Modal, Panel, Skeleton } from './ui'
import { useFeedback } from './ui/feedback'

function useProfileSetter() {
  const qc = useQueryClient()
  const { patchUser } = useAuth()
  return (profile) => {
    if (!profile) return qc.invalidateQueries({ queryKey: ['profile'] })
    qc.setQueryData(['profile'], profile)
    patchUser({ name: profile.name, email: profile.email })
  }
}

// useCodeRequest mengirim kode sekali saat dialog dibuka; bila masih jeda,
// dialog tetap dipakai dengan hitung mundur dari server.
function useCodeRequest() {
  const [state, setState] = useState({ loading: true })
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    profileApi
      .sendEmailCode()
      .then((res) => setState({ email: res.email, resendIn: res.resend_in }))
      .catch((err) => {
        if (err.code === 'code_cooldown') setState({ resendIn: err.data?.retry_after || 60, note: err.message })
        else setState({ error: err.message })
      })
  }, [])
  return state
}

export function VerifyEmailDialog({ email, title = 'Verifikasi email', onClose }) {
  const { toast } = useFeedback()
  const setProfile = useProfileSetter()
  const req = useCodeRequest()
  const submit = async (code) => {
    const profile = await profileApi.verifyEmail(code)
    setProfile(profile)
    toast('Email terverifikasi')
    onClose()
  }
  return (
    <Modal open onClose={onClose} title={title} description="Masukkan kode yang kami kirim untuk memastikan email ini milikmu.">
      {req.loading ? (
        <Skeleton className="h-48" />
      ) : req.error ? (
        <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{req.error}</p>
      ) : (
        <CodeVerify email={req.email || email} initialResendIn={req.resendIn} onSubmit={submit} onResend={profileApi.sendEmailCode} />
      )}
    </Modal>
  )
}

function ChangeEmailDialog({ profile, onClose }) {
  const { toast } = useFeedback()
  const setProfile = useProfileSetter()
  const mailOn = profile.email_status?.mail_enabled
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(null)

  const start = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await profileApi.changeEmail({ email: email.trim(), password })
      if (res?.sent) {
        setSent(res)
        setProfile(null)
      } else {
        setProfile(await profileApi.get())
        toast('Email diganti')
        onClose()
      }
    } catch (err) {
      if (err.code === 'code_cooldown') {
        setSent({ email: email.trim(), resend_in: err.data?.retry_after || 60 })
        setProfile(null)
      } else {
        setError(err.message)
      }
    } finally {
      setBusy(false)
    }
  }

  const verify = async (code) => {
    const next = await profileApi.verifyEmail(code)
    setProfile(next)
    toast('Email berhasil diganti')
    onClose()
  }

  if (sent) {
    return (
      <Modal open onClose={onClose} title="Konfirmasi email baru" description="Email lama tetap dipakai sampai kode ini dimasukkan.">
        <CodeVerify email={sent.email} initialResendIn={sent.resend_in} onSubmit={verify} onResend={profileApi.sendEmailCode} submitLabel="Pakai email baru" />
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Ganti email"
      description={mailOn ? 'Kami kirim kode ke email baru. Email lama tetap aktif sampai kode dimasukkan.' : 'Email login akan langsung diganti.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="change-email" loading={busy} disabled={!email.trim() || !password}>
            {mailOn ? 'Kirim kode' : 'Ganti email'}
          </Button>
        </>
      }
    >
      <form id="change-email" onSubmit={start} className="space-y-4">
        <Field label="Email baru">{(id) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />}</Field>
        <Field label="Password akun" hint="Untuk memastikan ini memang kamu.">
          {(id) => <PasswordInput id={id} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
        </Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

// EmailBlock: email login, status verifikasi, email baru yang menunggu, dan peringatan terpental.
export function EmailBlock({ profile }) {
  const { toast } = useFeedback()
  const setProfile = useProfileSetter()
  const st = profile.email_status || {}
  const [dialog, setDialog] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const isAdmin = profile.role === 'admin'

  const cancel = async () => {
    setCancelling(true)
    try {
      setProfile(await profileApi.cancelEmail())
      toast('Perubahan email dibatalkan')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-ink">Email</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line px-3.5 py-2.5">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{profile.email}</span>
          {st.mail_enabled && !isAdmin && (st.verified ? (
            <Badge tone="income"><BadgeCheck className="size-3.5" /> Email terverifikasi</Badge>
          ) : (
            <Badge tone="caution"><MailWarning className="size-3.5" /> Belum diverifikasi</Badge>
          ))}
          <div className="flex gap-2">
            {st.mail_enabled && !isAdmin && !st.verified && !st.pending_email && (
              <Button size="sm" onClick={() => setDialog('verify')}>Verifikasi</Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setDialog('change')}>Ganti email</Button>
          </div>
        </div>
      </div>
      {st.mail_enabled && !isAdmin && !st.verified && st.due_at && !st.pending_email && (
        <p className="text-[13px] text-muted">
          {new Date(st.due_at) > new Date()
            ? `Verifikasi sebelum ${dateLabel(st.due_at)}. Setelah itu kamu wajib memasukkan kode dari email saat masuk.`
            : 'Masa tenggang sudah lewat. Kamu akan diminta kode verifikasi setiap kali masuk sampai email terverifikasi.'}
        </p>
      )}
      {st.pending_email && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-violet-soft px-3.5 py-3 text-sm">
          <p className="min-w-0 flex-1">
            Menunggu verifikasi: <b className="break-all">{st.pending_email}</b>
            <span className="block text-[13px] text-muted">Email lama tetap dipakai sampai kode dimasukkan.</span>
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setDialog('pending')}>Verifikasi</Button>
            <Button size="sm" variant="ghost" loading={cancelling} onClick={cancel}>Batal</Button>
          </div>
        </div>
      )}
      {st.bounced && (
        <div className="flex gap-3 rounded-xl bg-expense-soft px-3.5 py-3 text-sm text-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-expense" />
          <p>Email ke alamat ini gagal terkirim, jadi ringkasan dan pengingat dihentikan. Periksa alamatnya atau ganti ke email lain.</p>
        </div>
      )}
      {dialog === 'verify' && <VerifyEmailDialog email={profile.email} onClose={() => setDialog(null)} />}
      {dialog === 'pending' && <VerifyEmailDialog email={st.pending_email} title="Konfirmasi email baru" onClose={() => setDialog(null)} />}
      {dialog === 'change' && <ChangeEmailDialog profile={profile} onClose={() => setDialog(null)} />}
    </div>
  )
}

function Toggle({ on, onChange, label, description, disabled }) {
  return (
    <li className="flex items-start gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[13px] text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!on)}
        className={cn('relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60', on ? 'bg-violet' : 'bg-line')}
      >
        <span className={cn('absolute top-1 size-5 rounded-full bg-white shadow transition-all', on ? 'left-6' : 'left-1')} />
      </button>
    </li>
  )
}

const PREFS = [
  ['weekly', 'Ringkasan mingguan', 'Pemasukan, pengeluaran, dan anggaran yang perlu diperhatikan, sekali seminggu.'],
  ['reminders', 'Pengingat jatuh tempo', 'Sehari sebelum hutang jatuh tempo atau transaksi rutin dicatat.'],
  ['login_alert', 'Login dari perangkat baru', 'Pemberitahuan saat akunmu dipakai masuk dari perangkat lain.'],
]

export function EmailPrefsPanel({ profile }) {
  const { toast } = useFeedback()
  const setProfile = useProfileSetter()
  const st = profile.email_status
  const [busy, setBusy] = useState(false)
  if (!st?.mail_enabled || profile.role === 'admin') return null

  const change = async (key, value) => {
    setBusy(true)
    try {
      setProfile(await profileApi.updateEmailPrefs({ ...st.prefs, [key]: value }))
      toast(value ? 'Email dinyalakan' : 'Email dimatikan')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title="Notifikasi email">
      <p className="text-sm text-muted">
        {st.verified ? 'Pilih email yang ingin kamu terima.' : 'Email di bawah mulai dikirim setelah emailmu terverifikasi.'} Kode verifikasi dan atur ulang password selalu dikirim.
      </p>
      <ul className="mt-2 divide-y divide-line">
        {PREFS.map(([key, label, description]) => (
          <Toggle key={key} label={label} description={description} on={!!st.prefs?.[key]} disabled={busy} onChange={(v) => change(key, v)} />
        ))}
      </ul>
    </Panel>
  )
}
