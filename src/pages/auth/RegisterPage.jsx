import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Hourglass, Ticket } from 'lucide-react'
import { authApi } from '../../api/endpoints'
import { useAuth } from '../../context/auth'
import { Button, Field, Input } from '../../components/ui'
import { dateLabel } from '../../lib/format'
import AuthLayout from './AuthLayout'
import { PasswordInput } from './LoginPage'

function PendingScreen({ name }) {
  return (
    <AuthLayout
      title="Pendaftaran terkirim"
      subtitle={`Terima kasih, ${name}. Akunmu sedang menunggu persetujuan admin.`}
      footer={
        <Link to="/masuk" className="font-semibold text-violet-ink hover:underline">
          Kembali ke halaman masuk
        </Link>
      }
    >
      <div className="flex gap-4 rounded-2xl bg-violet-soft p-5">
        <Hourglass className="mt-0.5 size-5 shrink-0 text-violet-ink" />
        <div className="text-sm">
          <p className="font-semibold">Apa selanjutnya?</p>
          <p className="mt-1 text-muted">
            Setelah admin menyetujui, kamu bisa masuk dengan email dan password yang baru dibuat. Kalau kamu mengenal admin, beri tahu bahwa kamu sudah mendaftar supaya lebih cepat diproses.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const linkCode = (params.get('undangan') || '').toUpperCase()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', code: linkCode })
  const [showCode, setShowCode] = useState(!!linkCode)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const code = form.code.trim().toUpperCase()
  const invite = useQuery({
    queryKey: ['invite', code],
    queryFn: () => authApi.checkInvite(code),
    enabled: code.length >= 6,
    retry: 0,
    staleTime: 60_000,
  })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return setError('Password minimal 8 karakter.')
    if (form.password !== form.confirm) return setError('Konfirmasi password tidak sama.')
    if (code && invite.data && !invite.data.valid) return setError('Kode undangan tidak valid atau sudah kedaluwarsa. Hapus kodenya untuk mendaftar biasa.')
    setError('')
    setLoading(true)
    try {
      const res = await register(form.name.trim(), form.email.trim(), form.password, code)
      if (res.token) navigate('/', { replace: true })
      else setPending(form.name.trim())
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (pending) return <PendingScreen name={pending} />

  const inviteOk = code && invite.data?.valid

  return (
    <AuthLayout
      title="Buat akun"
      subtitle={inviteOk ? 'Kamu diundang. Akun langsung aktif setelah dibuat.' : 'Pendaftaran akan ditinjau admin sebelum akun bisa dipakai.'}
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/masuk" className="font-semibold text-violet-ink hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nama">{(id) => <Input id={id} autoComplete="name" value={form.name} onChange={set('name')} required />}</Field>
        <Field label="Email">{(id) => <Input id={id} type="email" autoComplete="email" value={form.email} onChange={set('email')} required />}</Field>
        <Field label="Password" hint="Minimal 8 karakter.">
          {(id) => <PasswordInput id={id} autoComplete="new-password" value={form.password} onChange={set('password')} required />}
        </Field>
        <Field label="Ulangi password">
          {(id) => <PasswordInput id={id} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />}
        </Field>

        {showCode ? (
          <Field
            label="Kode undangan"
            error={code && invite.data && !invite.data.valid ? 'Kode tidak valid, sudah dipakai, atau kedaluwarsa.' : undefined}
          >
            {(id) => (
              <div className="relative">
                <Input id={id} value={form.code} onChange={set('code')} placeholder="Mis. K7QM2XPA" className="pr-10 uppercase tracking-[0.15em]" maxLength={16} />
                {inviteOk && <CheckCircle2 className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-income" />}
              </div>
            )}
          </Field>
        ) : (
          <button type="button" onClick={() => setShowCode(true)} className="flex items-center gap-2 text-sm font-semibold text-violet-ink hover:underline">
            <Ticket className="size-4" /> Punya kode undangan?
          </button>
        )}
        {inviteOk && invite.data.expires_at && (
          <p className="text-[13px] text-income">Undangan berlaku sampai {dateLabel(invite.data.expires_at)}.</p>
        )}

        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {inviteOk ? 'Buat akun' : 'Kirim pendaftaran'}
        </Button>
      </form>
    </AuthLayout>
  )
}
