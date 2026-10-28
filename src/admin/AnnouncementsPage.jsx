import { useState } from 'react'
import { Megaphone, TriangleAlert } from 'lucide-react'
import { adminApi } from '../api/endpoints'
import { Badge, Button, Empty, ErrorNote, Field, PageHeader, Segmented, Select, Skeleton, Textarea } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useAdminAnnouncements } from '../hooks/queries'
import { cn } from '../lib/cn'
import { timeAgo } from '../lib/format'

const DURATIONS = [
  { value: '', label: 'Sampai diakhiri manual' },
  { value: '6', label: '6 jam' },
  { value: '24', label: '1 hari' },
  { value: '72', label: '3 hari' },
  { value: '168', label: '7 hari' },
]

export default function AnnouncementsPage() {
  const { toast, confirm } = useFeedback()
  const list = useAdminAnnouncements()
  const [form, setForm] = useState({ message: '', level: 'info', hours: '24' })
  const [error, setError] = useState('')

  const create = useAction(adminApi.createAnnouncement, {
    onSuccess: () => {
      setForm({ message: '', level: 'info', hours: '24' })
      toast('Pengumuman dipasang untuk semua pengguna')
    },
    onError: (e) => setError(e.message),
  })
  const end = useAction(adminApi.endAnnouncement, { onSuccess: () => toast('Pengumuman diakhiri') })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    const msg = form.message.trim()
    if (!msg) return setError('Tulis isi pengumuman.')
    create.mutate({
      message: msg,
      level: form.level,
      ends_at: form.hours ? new Date(Date.now() + Number(form.hours) * 3600_000).toISOString() : undefined,
    })
  }

  return (
    <div>
      <PageHeader title="Pengumuman" description="Banner yang tampil di bagian atas aplikasi semua pengguna, misalnya jadwal pemeliharaan server." />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <section className="panel p-5 sm:p-6">
          <h2 className="mb-4 text-[17px] font-semibold">Pasang pengumuman</h2>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Isi pengumuman" hint={`${form.message.length}/280 karakter`}>
              {(id) => <Textarea id={id} rows={4} maxLength={280} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Mis. Pemeliharaan server Sabtu 22.00–22.30 WIB. Aplikasi tidak bisa dibuka sementara." />}
            </Field>
            <Segmented
              className="w-full"
              value={form.level}
              onChange={(level) => setForm({ ...form, level })}
              options={[{ value: 'info', label: 'Informasi' }, { value: 'warning', label: 'Peringatan' }]}
            />
            <Field label="Tampil selama">
              {(id) => (
                <Select id={id} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })}>
                  {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </Select>
              )}
            </Field>
            {form.message.trim() && (
              <div className={cn('flex items-start gap-3 rounded-2xl px-4 py-3 text-sm', form.level === 'warning' ? 'bg-caution-soft' : 'bg-violet-soft')}>
                {form.level === 'warning' ? <TriangleAlert className="mt-0.5 size-4 shrink-0 text-caution" /> : <Megaphone className="mt-0.5 size-4 shrink-0 text-violet-ink" />}
                <p>{form.message}</p>
              </div>
            )}
            {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
            <Button type="submit" icon={Megaphone} className="w-full" loading={create.isPending}>Pasang pengumuman</Button>
          </form>
        </section>

        <section className="panel overflow-hidden">
          <header className="border-b border-line px-6 py-4"><h2 className="text-[17px] font-semibold">Riwayat pengumuman</h2></header>
          <ErrorNote error={list.error} onRetry={list.refetch} />
          {list.isLoading ? (
            <div className="p-6"><Skeleton className="h-32" /></div>
          ) : !list.data?.length ? (
            <Empty icon={Megaphone} title="Belum ada pengumuman" />
          ) : (
            <ul className="divide-y divide-line">
              {list.data.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap gap-2">
                      <Badge tone={a.active ? 'income' : 'neutral'}>{a.active ? 'Tampil' : 'Berakhir'}</Badge>
                      <Badge tone={a.level === 'warning' ? 'caution' : 'violet'}>{a.level === 'warning' ? 'Peringatan' : 'Informasi'}</Badge>
                    </div>
                    <p className="text-sm">{a.message}</p>
                    <p className="text-xs text-faint">
                      Dipasang {timeAgo(a.created_at)}
                      {a.active && a.ends_at && `, berakhir ${new Date(a.ends_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  {a.active && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => { if (await confirm({ title: 'Akhiri pengumuman ini?', message: 'Banner langsung hilang dari aplikasi semua pengguna.', confirmLabel: 'Akhiri', danger: true })) end.mutate(a.id) }}
                    >
                      Akhiri
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
