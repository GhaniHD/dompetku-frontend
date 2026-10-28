import { useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../api/endpoints'
import { Badge, Button, Empty, ErrorNote, Field, Input, PageHeader, Select, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useAdminInvites } from '../hooks/queries'
import { dateLabel } from '../lib/format'
import { ShareLink } from './shared'

const INVITE_TONE = { aktif: 'income', habis: 'neutral', kedaluwarsa: 'neutral', dibatalkan: 'expense' }

export default function InvitesPage() {
  const { toast, confirm } = useFeedback()
  const invites = useAdminInvites()
  const [form, setForm] = useState({ note: '', max_uses: '1', valid_days: '7' })
  const [share, setShare] = useState(null)
  const linkOf = (code) => `${window.location.origin}/daftar?undangan=${code}`

  const create = useAction(adminApi.createInvite, {
    onSuccess: (inv) => {
      setForm({ note: '', max_uses: '1', valid_days: '7' })
      setShare(inv)
    },
    onError: (e) => toast(e.message, 'error'),
  })
  const revoke = useAction(adminApi.revokeInvite, { onSuccess: () => toast('Undangan dibatalkan') })

  return (
    <div>
    <PageHeader title="Undangan" description="Orang yang mendaftar lewat link undangan langsung aktif tanpa perlu disetujui." />
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="panel p-5 sm:p-6">
        <h2 className="mb-1 text-[17px] font-semibold">Buat undangan</h2>
        <p className="mb-4 text-sm text-muted">Orang yang mendaftar lewat link undangan langsung aktif tanpa perlu disetujui.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate({ note: form.note.trim(), max_uses: Number(form.max_uses), valid_days: Number(form.valid_days) })
          }}
          className="space-y-4"
        >
          <Field label="Untuk siapa" hint="Catatan untuk kamu sendiri.">
            {(id) => <Input id={id} value={form.note} maxLength={200} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Mis. Adik, teman kantor" />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bisa dipakai">
              {(id) => (
                <Select id={id} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}>
                  {[1, 2, 3, 5, 10, 20].map((n) => <option key={n} value={n}>{n} orang</option>)}
                </Select>
              )}
            </Field>
            <Field label="Berlaku">
              {(id) => (
                <Select id={id} value={form.valid_days} onChange={(e) => setForm({ ...form, valid_days: e.target.value })}>
                  {[1, 3, 7, 14, 30].map((n) => <option key={n} value={n}>{n} hari</option>)}
                </Select>
              )}
            </Field>
          </div>
          <Button type="submit" icon={Plus} className="w-full" loading={create.isPending}>Buat link undangan</Button>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <header className="border-b border-line px-6 py-4">
          <h2 className="text-[17px] font-semibold">Daftar undangan</h2>
        </header>
        <ErrorNote error={invites.error} onRetry={invites.refetch} />
        {invites.isLoading ? (
          <div className="p-6"><Skeleton className="h-32" /></div>
        ) : !invites.data?.length ? (
          <Empty icon={Link2} title="Belum ada undangan">Buat undangan untuk orang yang ingin kamu ajak memakai MyFulus.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {invites.data.map((inv) => (
              <li key={inv.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num font-semibold tracking-[0.12em]">{inv.code}</span>
                    <Badge tone={INVITE_TONE[inv.status]}>{inv.status[0].toUpperCase() + inv.status.slice(1)}</Badge>
                  </div>
                  {inv.note && <p className="truncate text-sm">{inv.note}</p>}
                  <p className="text-xs text-faint">
                    Terpakai {inv.used_count} dari {inv.max_uses}, berlaku sampai {dateLabel(inv.expires_at)}
                  </p>
                  {inv.used_by.length > 0 && <p className="mt-0.5 truncate text-xs text-muted">Dipakai oleh {inv.used_by.join(', ')}</p>}
                </div>
                {inv.status === 'aktif' && (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setShare(inv)} aria-label={`Bagikan ${inv.code}`} className="rounded-full p-2 text-muted hover:bg-sunken hover:text-ink"><Link2 className="size-4" /></button>
                    <button
                      type="button"
                      aria-label={`Batalkan ${inv.code}`}
                      onClick={async () => { if (await confirm({ title: `Batalkan undangan ${inv.code}?`, message: 'Link ini tidak bisa dipakai mendaftar lagi. Akun yang sudah dibuat tidak terpengaruh.', confirmLabel: 'Batalkan undangan', danger: true })) revoke.mutate(inv.id) }}
                      className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ShareLink
        open={!!share}
        onClose={() => setShare(null)}
        title={`Undangan ${share?.code || ''}`}
        description="Kirim link ini ke orang yang kamu undang. Kode juga bisa diketik manual di halaman daftar."
        url={share ? linkOf(share.code) : ''}
      />
    </div>
    </div>
  )
}
