import { useEffect, useRef, useState } from 'react'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from './ui'

// CodeVerify: isian kode 6 digit dengan tombol kirim ulang berhitung mundur.
export default function CodeVerify({ email, initialResendIn = 0, onSubmit, onResend, submitLabel = 'Verifikasi' }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [sending, setSending] = useState(false)
  const [wait, setWait] = useState(initialResendIn)
  const [elapsed, setElapsed] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (elapsed >= 30) return undefined
    const t = setTimeout(() => setElapsed((s) => s + 1), 1000)
    return () => clearTimeout(t)
  }, [elapsed])

  useEffect(() => {
    if (wait <= 0) return undefined
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const submit = async (value = code) => {
    if (value.length !== 6) return setError('Masukkan 6 digit kode dari email.')
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await onSubmit(value)
    } catch (err) {
      setError(err.message)
      setCode('')
      inputRef.current?.focus()
    } finally {
      setBusy(false)
    }
  }

  const change = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    if (value.length === 6 && !busy) submit(value)
  }

  const resend = async () => {
    setError('')
    setInfo('')
    setSending(true)
    try {
      const res = await onResend()
      setWait(res?.resend_in || 60)
      setElapsed(0)
      setInfo(`Kode baru dikirim ke ${res?.email || email}.`)
    } catch (err) {
      if (err.data?.retry_after) setWait(err.data.retry_after)
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="space-y-4"
    >
      <div className="flex gap-3 rounded-2xl bg-violet-soft p-4 text-sm">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-violet-ink" />
        <div>
          <p>
            Kami mengirim kode 6 digit ke <b className="break-all">{email}</b>. Kode berlaku 15 menit.
          </p>
          {elapsed < 30 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted">
              <Loader2 className="size-3.5 animate-spin" /> Email biasanya tiba dalam 10–30 detik.
            </p>
          )}
        </div>
      </div>
      {elapsed >= 30 && !code && (
        <p className="rounded-xl bg-caution-soft px-3.5 py-2.5 text-[13px] text-ink">
          Belum masuk? Cek folder <b>Spam</b> atau <b>Promosi</b>, dan pastikan alamatnya benar: <b className="break-all">{email}</b>.
        </p>
      )}
      <input
        ref={inputRef}
        value={code}
        onChange={change}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        autoFocus
        aria-label="Kode verifikasi"
        placeholder="••••••"
        className="field h-14 text-center font-mono text-2xl font-semibold tracking-[0.5em]"
      />
      {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      {info && !error && <p className="rounded-xl bg-income-soft px-3.5 py-2.5 text-sm text-income">{info}</p>}
      <Button type="submit" size="lg" className="w-full" loading={busy} disabled={code.length !== 6}>
        {submitLabel}
      </Button>
      <div className="text-center text-[13px] text-muted">
        {wait > 0 ? (
          <span>Kirim ulang dalam {wait} detik.</span>
        ) : (
          <button type="button" onClick={resend} disabled={sending} className="font-semibold text-violet-ink hover:underline disabled:opacity-60">
            {sending ? 'Mengirim…' : 'Kirim ulang kode'}
          </button>
        )}
      </div>
    </form>
  )
}
