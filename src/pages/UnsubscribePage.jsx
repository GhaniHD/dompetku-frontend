import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BellOff, Loader2, TriangleAlert } from 'lucide-react'
import { emailApi } from '../api/endpoints'
import AuthLayout from './auth/AuthLayout'

export default function UnsubscribePage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [state, setState] = useState(token ? { status: 'loading' } : { status: 'error', message: 'Link berhenti langganan tidak lengkap.' })
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    emailApi
      .unsubscribe(token)
      .then((res) => setState({ status: 'done', label: res.label }))
      .catch((err) => setState({ status: 'error', message: err.message }))
  }, [token])

  const footer = (
    <Link to="/profil" className="font-semibold text-violet-ink hover:underline">
      Atur semua notifikasi email di Profil
    </Link>
  )

  if (state.status === 'loading') {
    return (
      <AuthLayout title="Memproses…" subtitle="Sebentar, kami simpan pilihanmu." footer={footer}>
        <Loader2 className="size-6 animate-spin text-violet-ink" />
      </AuthLayout>
    )
  }
  if (state.status === 'error') {
    return (
      <AuthLayout title="Link tidak bisa dipakai" subtitle={state.message} footer={footer}>
        <div className="flex gap-3 rounded-2xl bg-caution-soft p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-caution" />
          <p>Kamu tetap bisa mematikan email tertentu lewat menu Profil setelah masuk.</p>
        </div>
      </AuthLayout>
    )
  }
  return (
    <AuthLayout title="Berhenti langganan berhasil" subtitle={`Kamu tidak akan menerima ${state.label} lagi.`} footer={footer}>
      <div className="flex gap-3 rounded-2xl bg-violet-soft p-4 text-sm">
        <BellOff className="mt-0.5 size-5 shrink-0 text-violet-ink" />
        <p>Email penting seperti kode verifikasi dan atur ulang password tetap dikirim. Kamu bisa menyalakannya lagi kapan saja di Profil.</p>
      </div>
    </AuthLayout>
  )
}
