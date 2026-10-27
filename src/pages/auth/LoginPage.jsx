import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { Button, Field, Input } from '../../components/ui'
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

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice] = useState(() => logoutNotice.take())
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Masuk ke DompetKu"
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
        <p className="text-center text-[13px] text-muted">Lupa password? Minta link atur ulang password ke admin.</p>
      </form>
    </AuthLayout>
  )
}
