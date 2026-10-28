import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import { authApi } from '../../api/endpoints'
import { Button, Field, Input } from '../../components/ui'
import AuthLayout from './AuthLayout'

export default function ForgotPasswordPage() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!sent || elapsed >= 30) return undefined
    const t = setTimeout(() => setElapsed((s) => s + 1), 1000)
    return () => clearTimeout(t)
  }, [sent, elapsed])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setElapsed(0)
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
            <p className="mt-1 text-muted">Buka email dari MyFulus lalu tekan tombol Buat password baru.</p>
            {elapsed < 30 && (
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
                <Loader2 className="size-3.5 animate-spin" /> Email biasanya tiba dalam 10–30 detik.
              </p>
            )}
          </div>
        </div>
        {elapsed >= 30 && (
          <p className="mt-3 rounded-xl bg-caution-soft px-3.5 py-2.5 text-[13px] text-ink">
            Belum masuk? Cek folder <b>Spam</b> atau <b>Promosi</b>, dan pastikan emailnya benar: <b className="break-all">{email}</b>.
          </p>
        )}
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
