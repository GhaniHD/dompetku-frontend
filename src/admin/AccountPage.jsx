import { useState } from 'react'
import { profileApi } from '../api/endpoints'
import { Button, Field, PageHeader, Panel } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAuth } from '../context/auth'
import { useAction, useProfile } from '../hooks/queries'
import { PasswordInput } from '../pages/auth/LoginPage'

export default function AccountPage() {
  const { toast } = useFeedback()
  const { replaceToken } = useAuth()
  const { data: me } = useProfile()
  const [form, setForm] = useState({ old: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = useAction(
    async (b) => {
      const res = await profileApi.changePassword(b)
      if (res?.token) replaceToken(res.token)
      return res
    },
    {
      onSuccess: () => { setForm({ old: '', next: '', confirm: '' }); setError(''); toast('Password admin diganti') },
      onError: (e) => setError(e.message),
    }
  )

  return (
    <div className="max-w-2xl">
      <PageHeader title="Akun admin" description="Akun ini khusus untuk konsol admin dan tidak dipakai untuk mencatat keuangan." />
      <Panel title="Identitas" className="mb-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted">Nama</dt><dd className="font-semibold">{me?.name}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Email</dt><dd className="font-semibold">{me?.email}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Keamanan</dt><dd className="text-right">Keluar otomatis setelah 30 menit tidak aktif</dd></div>
        </dl>
      </Panel>
      <Panel title="Ganti password">
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
    </div>
  )
}
