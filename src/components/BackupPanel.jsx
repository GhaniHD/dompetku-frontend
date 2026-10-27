import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DatabaseBackup, Download, FileUp, ShieldAlert, Upload } from 'lucide-react'
import { backupApi } from '../api/endpoints'
import { PasswordInput } from '../pages/auth/LoginPage'
import { dateLabel, rupiah } from '../lib/format'
import { Button, Field, Input, Modal, Panel } from './ui'
import { useFeedback } from './ui/feedback'

const CONFIRM_WORD = 'GANTI'

function ErrorBox({ children }) {
  return children ? <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{children}</p> : null
}

function ExportDialog({ onClose }) {
  const { toast } = useFeedback()
  const [form, setForm] = useState({ password: '', backup: '', repeat: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.backup.length < 8) return setError('Password backup minimal 8 karakter.')
    if (form.backup !== form.repeat) return setError('Ulangi password backup dengan sama persis.')
    setBusy(true)
    try {
      await backupApi.export({ password: form.password, backup_password: form.backup })
      toast('Backup diunduh. Simpan file dan password backup-nya baik-baik.')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Unduh backup"
      description="Semua dompet, transaksi, pindahan, anggaran, transaksi rutin, hutang, dan target disimpan dalam satu file terkunci."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="backup-export" icon={Download} loading={busy}>Unduh backup</Button>
        </>
      }
    >
      <form id="backup-export" onSubmit={submit} className="space-y-4">
        <Field label="Password akun">{(id) => <PasswordInput id={id} autoComplete="current-password" value={form.password} onChange={set('password')} required />}</Field>
        <Field label="Password backup" hint="Minimal 8 karakter. Dipakai untuk membuka file ini nanti.">
          {(id) => <PasswordInput id={id} autoComplete="new-password" value={form.backup} onChange={set('backup')} required />}
        </Field>
        <Field label="Ulangi password backup">{(id) => <PasswordInput id={id} autoComplete="new-password" value={form.repeat} onChange={set('repeat')} required />}</Field>
        <p className="flex gap-2.5 rounded-xl bg-caution-soft px-3.5 py-3 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-caution" />
          <span>Catat password backup di tempat aman. <b>Tanpa password ini file tidak bisa dibuka</b>, admin pun tidak bisa membantu.</span>
        </p>
        <ErrorBox>{error}</ErrorBox>
      </form>
    </Modal>
  )
}

function PreviewSummary({ p }) {
  const rows = [
    ['Dompet', p.wallets],
    ['Transaksi', p.transactions.toLocaleString('id-ID')],
    ['Pindahan', p.transfers],
    ['Anggaran', p.budgets],
    ['Transaksi rutin', p.recurring],
    ['Hutang & piutang', p.debts],
    ['Target tabungan', p.goals],
  ]
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="text-sm text-muted">
        Backup dari <span className="font-semibold text-ink">{p.source_name}</span> ({p.source_email})
      </p>
      <p className="text-sm text-muted">Dibuat {new Date(p.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt className="text-muted">{label}</dt>
            <dd className="num font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-3 text-sm">
        <span className="text-muted">Saldo total</span>
        <span className="num text-lg font-semibold">{rupiah(p.total_balance)}</span>
      </div>
      {p.first_date && (
        <p className="mt-1 text-xs text-faint">
          Transaksi {dateLabel(p.first_date)} sampai {dateLabel(p.last_date)}
        </p>
      )}
    </div>
  )
}

function RestoreDialog({ onClose }) {
  const { toast } = useFeedback()
  const qc = useQueryClient()
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ backup: '', password: '', confirm: '' })
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const buildForm = (extra = {}) => {
    const data = new FormData()
    data.append('file', file)
    data.append('backup_password', form.backup)
    data.append('password', form.password)
    Object.entries(extra).forEach(([k, v]) => data.append(k, v))
    return data
  }

  const run = async (fn) => {
    setError('')
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const check = (e) => {
    e.preventDefault()
    if (!file) return setError('Pilih file backup (.dpk).')
    run(async () => setPreview(await backupApi.preview(buildForm())))
  }

  const restore = (e) => {
    e.preventDefault()
    run(async () => {
      const result = await backupApi.restore(buildForm({ confirm: form.confirm.trim() }))
      await qc.invalidateQueries()
      toast(`Data dipulihkan: ${result.wallets} dompet, ${result.transactions.toLocaleString('id-ID')} transaksi`)
      onClose()
    })
  }

  const ready = form.confirm.trim() === CONFIRM_WORD

  return (
    <Modal
      open
      onClose={onClose}
      title="Pulihkan dari backup"
      description={preview ? 'Periksa isi backup sebelum mengganti data.' : 'Pilih file backup MyFulus (.dpk) lalu masukkan password-nya.'}
      footer={
        preview ? (
          <>
            <Button variant="ghost" onClick={() => { setPreview(null); setForm((f) => ({ ...f, confirm: '' })) }}>Kembali</Button>
            <Button type="submit" form="backup-restore" variant="danger" icon={Upload} loading={busy} disabled={!ready}>Ganti semua data</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" form="backup-check" icon={FileUp} loading={busy}>Lihat isi backup</Button>
          </>
        )
      }
    >
      {preview ? (
        <form id="backup-restore" onSubmit={restore} className="space-y-4">
          <PreviewSummary p={preview} />
          <p className="flex gap-2.5 rounded-xl bg-expense-soft px-3.5 py-3 text-sm text-ink">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-expense" />
            <span>
              <b>Semua data keuangan di akun ini akan dihapus</b> lalu diganti isi backup. Notifikasi dan akunmu tetap. Langkah ini tidak bisa dibatalkan.
            </span>
          </p>
          <Field label={`Ketik ${CONFIRM_WORD} untuk melanjutkan`}>
            {(id) => <Input id={id} value={form.confirm} onChange={set('confirm')} autoComplete="off" placeholder={CONFIRM_WORD} />}
          </Field>
          <ErrorBox>{error}</ErrorBox>
        </form>
      ) : (
        <form id="backup-check" onSubmit={check} className="space-y-4">
          <Field label="File backup">
            {(id) => (
              <input
                id={id}
                type="file"
                accept=".dpk"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-violet-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-ink hover:file:bg-violet-soft/70"
              />
            )}
          </Field>
          <Field label="Password backup">{(id) => <PasswordInput id={id} autoComplete="off" value={form.backup} onChange={set('backup')} required />}</Field>
          <Field label="Password akun ini">{(id) => <PasswordInput id={id} autoComplete="current-password" value={form.password} onChange={set('password')} required />}</Field>
          <ErrorBox>{error}</ErrorBox>
        </form>
      )}
    </Modal>
  )
}

export default function BackupPanel() {
  const [open, setOpen] = useState(null)
  return (
    <Panel title="Backup & pulihkan">
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet-ink">
          <DatabaseBackup className="size-[18px]" />
        </span>
        <p className="text-sm text-muted">
          Simpan semua datamu dalam satu file terkunci password. File ini bisa dipulihkan ke akun ini atau ke akun lain, misalnya saat pindah akun.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" icon={Upload} onClick={() => setOpen('restore')}>Pulihkan</Button>
        <Button icon={Download} onClick={() => setOpen('export')}>Unduh backup</Button>
      </div>
      {open === 'export' && <ExportDialog onClose={() => setOpen(null)} />}
      {open === 'restore' && <RestoreDialog onClose={() => setOpen(null)} />}
    </Panel>
  )
}
