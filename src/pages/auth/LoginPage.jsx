import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { authApi } from '../../api/endpoints'
import { Button, Field, Input } from '../../components/ui'
import CodeVerify from '../../components/CodeVerify'
import AppDownloadBanner from '../../components/AppDownloadBanner'
import { useFeatures } from '../../hooks/queries'
import AuthLayout from './AuthLayout'
import { logoutNotice } from '../../api/client'

export function PasswordInput(props) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-faint hover:text-ink"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

// VerifyStep dipakai saat login atau daftar lewat undangan yang masih
// menunggu verifikasi email.
export function VerifyStep({ challenge, onDone, onExpired }) {
  const { verifyLogin } = useAuth()
  const submit = async (code) => {
    try {
      await verifyLogin(challenge.verify_token, code)
      onDone()
    } catch (err) {
      if (err.code === 'challenge_expired') onExpired(err.message)
      throw err
    }
  }
  const resend = async () => {
    try {
      return await authApi.sendCode(challenge.verify_token)
    } catch (err) {
      if (err.code === 'challenge_expired') onExpired(err.message)
      throw err
    }
  }
  return <CodeVerify email={challenge.email} initialResendIn={challenge.resend_in || 0} onSubmit={submit} onResend={resend} submitLabel="Verifikasi & masuk" />
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const features = useFeatures()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(() => logoutNotice.take())
  const [loading, setLoading] = useState(false)
  const [challenge, setChallenge] = useState(null)
  const goIn = () => navigate(location.state?.from || '/', { replace: true })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      goIn()
    } catch (err) {
      if (err.code === 'email_unverified' && err.data?.verify_token) {
        setPassword('')
        setChallenge(err.data)
      } else {
        setError(err.message)
      }
      setLoading(false)
    }
  }

  if (challenge) {
    return (
      <AuthLayout
        title="Verifikasi emailmu"
        subtitle="Satu langkah lagi. Masukkan kode untuk memastikan email ini milikmu."
        footer={
          <button type="button" onClick={() => setChallenge(null)} className="font-semibold text-violet-ink hover:underline">
            Kembali ke halaman masuk
          </button>
        }
      >
        <VerifyStep
          challenge={challenge}
          onDone={goIn}
          onExpired={(message) => {
            setChallenge(null)
            setNotice(message)
          }}
        />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Masuk ke MyFulus"
      subtitle="Lanjutkan mencatat keuanganmu."
      footer={
        <>
          Belum punya akun?{' '}
          <Link to="/daftar" className="font-semibold text-violet-ink hover:underline">
            Daftar gratis
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {notice && <p className="rounded-xl bg-caution-soft px-3.5 py-2.5 text-sm text-ink">{notice}</p>}
        <Field label="Email">{(id) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}</Field>
        <Field label="Password">
          {(id) => <PasswordInput id={id} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
        </Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Masuk
        </Button>
        {features.data?.email ? (
          <p className="text-center text-[13px]">
            <Link to="/lupa-password" state={{ email: email.trim() }} className="font-semibold text-violet-ink hover:underline">
              Lupa password?
            </Link>
          </p>
        ) : (
          <p className="text-center text-[13px] text-muted">Lupa password? Minta link atur ulang password ke admin.</p>
        )}
        <AppDownloadBanner />
      </form>
    </AuthLayout>
  )
}
