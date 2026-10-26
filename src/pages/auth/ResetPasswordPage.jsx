import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { authApi } from '../../api/endpoints'
import { Button, Field } from '../../components/ui'
import AuthLayout from './AuthLayout'
import { PasswordInput } from './LoginPage'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 8) return setError('Password minimal 8 karakter.')
    if (password !== confirm) return setError('Konfirmasi password tidak sama.')
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const back = (
    <Link to="/masuk" className="font-semibold text-violet-ink hover:underline">
      Kembali ke halaman masuk
    </Link>
  )

  if (!token) {
    return (
      <AuthLayout title="Link tidak lengkap" subtitle="Minta link atur ulang password yang baru ke admin." footer={back}>
        <span />
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout title="Password diperbarui" subtitle="Silakan masuk dengan password baru. Sesi di perangkat lain sudah diakhiri." footer={back}>
        <div className="flex items-center gap-3 rounded-2xl bg-income-soft p-4 text-sm font-semibold text-income">
          <CheckCircle2 className="size-5" /> Password berhasil diatur ulang.
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Atur ulang password" subtitle="Buat password baru untuk akunmu. Link ini hanya bisa dipakai sekali." footer={back}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Password baru" hint="Minimal 8 karakter.">
          {(id) => <PasswordInput id={id} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
        </Field>
        <Field label="Ulangi password baru">
          {(id) => <PasswordInput id={id} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />}
        </Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Simpan password baru
        </Button>
      </form>
    </AuthLayout>
  )
}
