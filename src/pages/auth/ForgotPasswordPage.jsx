import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { authApi } from '../../api/endpoints'
import { Button, Field, Input } from '../../components/ui'
import AuthLayout from './AuthLayout'

export default function ForgotPasswordPage() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
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

  if (sent) {
    return (
      <AuthLayout title="Cek emailmu" subtitle="Kalau email itu terdaftar, link untuk membuat password baru sudah kami kirim." footer={back}>
        <div className="flex gap-4 rounded-2xl bg-violet-soft p-5 text-sm">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-violet-ink" />
          <div>
            <p className="font-semibold">Link berlaku 30 menit</p>
            <p className="mt-1 text-muted">Buka email dari MyFulus lalu tekan tombol Buat password baru. Tidak ada di kotak masuk? Cek folder Spam atau Promosi.</p>
          </div>
        </div>
        <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-semibold text-violet-ink hover:underline">
          Kirim ke email lain
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Lupa password" subtitle="Masukkan email akunmu. Kami kirim link untuk membuat password baru." footer={back}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">{(id) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />}</Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Kirim link atur ulang
        </Button>
      </form>
    </AuthLayout>
  )
}
