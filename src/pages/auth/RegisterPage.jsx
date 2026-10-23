import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth'
import { Button, Field, Input } from '../../components/ui'
import AuthLayout from './AuthLayout'
import { PasswordInput } from './LoginPage'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return setError('Password minimal 8 karakter.')
    if (form.password !== form.confirm) return setError('Konfirmasi password tidak sama.')
    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Mulai dari satu dompet, tambah yang lain kapan saja."
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
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Buat akun
        </Button>
      </form>
    </AuthLayout>
  )
}
