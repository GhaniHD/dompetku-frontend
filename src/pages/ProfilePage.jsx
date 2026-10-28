import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { profileApi } from '../api/endpoints'
import Avatar from '../components/layout/Avatar'
import { Button, ErrorNote, Field, Input, Modal, PageHeader, Panel, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAuth } from '../context/auth'
import { useAction, useProfile } from '../hooks/queries'
import { cn } from '../lib/cn'
import { dateLabel, rupiah } from '../lib/format'
import { PasswordInput } from './auth/LoginPage'
import IncomeForm from '../components/forms/IncomeForm'
import BackupPanel from '../components/BackupPanel'
import { EmailBlock, EmailPrefsPanel } from '../components/EmailSettings'

function AccountPanel({ profile }) {
  const { toast } = useFeedback()
  const { patchUser } = useAuth()
  const [name, setName] = useState(profile.name)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const save = useAction(profileApi.update, {
    onSuccess: (p) => { patchUser({ name: p.name, email: p.email }); setError(''); toast('Profil disimpan') },
    onError: (e) => setError(e.message),
  })
  const upload = useAction(profileApi.uploadAvatar, {
    onSuccess: () => toast('Foto profil diganti'),
    onError: (e) => toast(e.message, 'error'),
  })

  const pick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast('Pakai foto JPG, PNG, atau WebP.', 'error')
    if (file.size > 2 * 1024 * 1024) return toast('Ukuran foto maksimal 2 MB.', 'error')
    upload.mutate(file)
  }

  const dirty = name.trim() !== profile.name

  return (
    <Panel title="Akun">
      <div className="mb-6 flex items-center gap-5">
        <button type="button" onClick={() => fileRef.current?.click()} className="group relative" aria-label="Ganti foto profil">
          <Avatar name={profile.name} src={profile.avatar_url} className="size-20 text-2xl" />
          <span className={cn('absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100', upload.isPending && 'opacity-100')}>
            <Camera className="size-5" />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />
        <div>
          <p className="text-lg font-semibold">{profile.name}</p>
          <p className="text-sm text-muted">Bergabung {dateLabel(profile.created_at, { month: 'long', year: 'numeric' })}</p>
          {profile.last_login_at && (
            <p className="text-[13px] text-muted">
              Masuk terakhir: {profile.last_login_device || 'perangkat tidak dikenal'},{' '}
              {new Date(profile.last_login_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 text-sm font-semibold text-violet-ink hover:underline">
            {upload.isPending ? 'Mengunggah…' : 'Ganti foto'}
          </button>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate({ name: name.trim() }) }} className="space-y-4">
        <Field label="Nama">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />}</Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={!dirty} loading={save.isPending}>Simpan nama</Button>
        </div>
      </form>
      <div className="mt-5 border-t border-line pt-5">
        <EmailBlock profile={profile} />
      </div>
    </Panel>
  )
}

function IncomePanel({ profile }) {
  return (
    <Panel title="Pemasukan & periode" className="scroll-mt-24">
      <div id="siklus" />
      <p className="mb-4 text-sm text-muted">Menentukan cara anggaran, ringkasan periode, dan jatah harian dihitung.</p>
      <IncomeForm profile={profile} />
    </Panel>
  )
}

function PasswordPanel() {
  const { toast } = useFeedback()
  const { replaceToken } = useAuth()
  const [form, setForm] = useState({ old: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const save = useAction(
    async (b) => {
      const res = await profileApi.changePassword(b)
      if (res?.token) replaceToken(res.token)
      return res
    },
    {
    onSuccess: () => { setForm({ old: '', next: '', confirm: '' }); setError(''); toast('Password diganti. Perangkat lain otomatis keluar.') },
    onError: (e) => setError(e.message),
    }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Panel title="Password & keamanan">
      <p className="mb-4 text-sm text-muted">Akun hanya aktif di satu perangkat. Masuk di perangkat lain akan mengeluarkan perangkat ini.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (form.next.length < 8) return setError('Password baru minimal 8 karakter.')
          if (form.next !== form.confirm) return setError('Konfirmasi password tidak sama.')
          save.mutate({ old_password: form.old, new_password: form.next })
        }}
        className="space-y-4"
      >
        <Field label="Password sekarang">{(id) => <PasswordInput id={id} autoComplete="current-password" value={form.old} onChange={set('old')} required />}</Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Password baru">{(id) => <PasswordInput id={id} autoComplete="new-password" value={form.next} onChange={set('next')} required />}</Field>
          <Field label="Ulangi password baru">{(id) => <PasswordInput id={id} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />}</Field>
        </div>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        <div className="flex justify-end"><Button type="submit" loading={save.isPending}>Ganti password</Button></div>
      </form>
    </Panel>
  )
}

function DeleteAccountDialog({ onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await profileApi.remove(password)
      logout()
      navigate('/masuk', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Hapus akun permanen?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="delete-account" variant="danger" loading={busy} disabled={!password}>Hapus permanen</Button>
        </>
      }
    >
      <form id="delete-account" onSubmit={submit} className="space-y-4">
        <p className="rounded-xl bg-expense-soft px-3.5 py-3 text-sm text-ink">
          Akun dan <b>semua datamu</b> (dompet, transaksi, anggaran, hutang, target) langsung dihapus dari server dan <b>tidak bisa dipulihkan</b>, termasuk oleh admin.
        </p>
        <Field label="Password akun">{(id) => <PasswordInput id={id} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />}</Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

function DangerPanel({ profile }) {
  const [open, setOpen] = useState(false)
  const isAdmin = profile.role === 'admin'
  return (
    <Panel title="Hapus akun">
      <p className="text-sm text-muted">
        {isAdmin
          ? 'Akun admin tidak bisa dihapus dari sini.'
          : 'Akun dan semua data keuanganmu akan dihapus permanen dari server. Unduh backup dulu bila ingin menyimpan atau memindahkan datamu.'}
      </p>
      {!isAdmin && (
        <div className="mt-4 flex justify-end">
          <Button variant="danger-soft" onClick={() => setOpen(true)}>Hapus akun</Button>
        </div>
      )}
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </Panel>
  )
}

export default function ProfilePage() {
  const profile = useProfile()
  const location = useLocation()
  const p = profile.data

  useEffect(() => {
    if (p && location.hash === '#siklus') document.getElementById('siklus')?.parentElement?.parentElement?.scrollIntoView({ behavior: 'smooth' })
  }, [p, location.hash])

  return (
    <div>
      <PageHeader title="Profil & pengaturan" />
      <ErrorNote error={profile.error} onRetry={profile.refetch} />
      {!p ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
      ) : (
        <>
          <section className="panel mb-5 grid grid-cols-3 divide-x divide-line">
            {[
              ['Total saldo', rupiah(p.balance)],
              ['Transaksi', p.transactions.toLocaleString('id-ID')],
              ['Dompet', p.wallet],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-4 sm:px-6 sm:py-5">
                <p className="text-[13px] text-muted">{label}</p>
                <p className="num mt-1 truncate text-lg font-semibold sm:text-2xl">{value}</p>
              </div>
            ))}
          </section>
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <div className="space-y-5">
              <AccountPanel key={p.id + p.name + p.email} profile={p} />
              <PasswordPanel />
            </div>
            <div className="space-y-5">
              <IncomePanel key={`${p.income_type}-${p.budget_start_day}`} profile={p} />
              <EmailPrefsPanel profile={p} />
              <BackupPanel />
              <DangerPanel profile={p} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
