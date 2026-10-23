import { useState } from 'react'
import { AlertTriangle, Pause, Play, Plus, Repeat, Trash2 } from 'lucide-react'
import { recurringApi } from '../api/endpoints'
import { CategorySelect, WalletSelect } from '../components/forms/pickers'
import { FlowIcon } from '../components/finance'
import { Badge, Button, Empty, ErrorNote, Field, Input, Modal, MoneyInput, PageHeader, Segmented, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useRecurring } from '../hooks/queries'
import { cn } from '../lib/cn'
import { dateLabel, dayToISO, parseAmount, relativeDay, rupiah, today } from '../lib/format'

function RecurringForm({ onClose, rule }) {
  const { toast, confirm } = useFeedback()
  const [form, setForm] = useState(() =>
    rule
      ? { type: rule.type, amount: String(Math.round(rule.amount)), wallet_id: rule.wallet.id, category_id: rule.category.id, frequency: rule.frequency, start_date: rule.start_date, end_date: rule.end_date || '', note: rule.note }
      : { type: 'expense', amount: '', wallet_id: '', category_id: '', frequency: 'monthly', start_date: today(), end_date: '', note: '' }
  )
  const [error, setError] = useState('')
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const save = useAction((body) => (rule ? recurringApi.update(rule.id, body) : recurringApi.create(body)), {
    onSuccess: () => {
      toast(rule ? 'Jadwal diperbarui' : 'Jadwal dibuat')
      onClose()
    },
    onError: (e) => setError(e.message),
  })
  const remove = useAction(() => recurringApi.remove(rule.id), { onSuccess: () => { toast('Jadwal dihapus'); onClose() } })

  const submit = (e) => {
    e.preventDefault()
    const amount = parseAmount(form.amount)
    if (amount <= 0) return setError('Masukkan nominal lebih dari 0.')
    if (!form.wallet_id || !form.category_id) return setError('Pilih dompet dan kategori.')
    const end = form.end_date ? dayToISO(form.end_date) : undefined
    save.mutate(
      rule
        ? { amount, wallet_id: form.wallet_id, category_id: form.category_id, note: form.note, end_date: end }
        : { type: form.type, amount, wallet_id: form.wallet_id, category_id: form.category_id, frequency: form.frequency, start_date: dayToISO(form.start_date), end_date: end, note: form.note }
    )
  }

  const askRemove = async () => {
    if (await confirm({ title: 'Hapus jadwal ini?', message: 'Transaksi yang sudah tercatat dari jadwal ini tetap ada.', confirmLabel: 'Hapus jadwal', danger: true })) remove.mutate()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={rule ? 'Ubah transaksi rutin' : 'Transaksi rutin baru'}
      description={rule ? 'Jenis, frekuensi, dan tanggal mulai tidak bisa diubah. Hapus lalu buat ulang bila perlu.' : 'Dicatat otomatis setiap jatuh tempo, misalnya gaji, kos, atau langganan.'}
      footer={
        <>
          {rule && <Button variant="danger-soft" className="mr-auto" onClick={askRemove} loading={remove.isPending}>Hapus</Button>}
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="recurring-form" loading={save.isPending}>Simpan jadwal</Button>
        </>
      }
    >
      <form id="recurring-form" onSubmit={submit} className="space-y-4">
        {!rule && (
          <Segmented className="w-full" value={form.type} onChange={(type) => setForm((f) => ({ ...f, type, category_id: '' }))} options={[{ value: 'expense', label: 'Pengeluaran' }, { value: 'income', label: 'Pemasukan' }]} />
        )}
        <Field label="Nominal">{(id) => <MoneyInput id={id} value={form.amount} onChange={set('amount')} placeholder="0" />}</Field>
        <Field label="Dompet">{(id) => <WalletSelect id={id} value={form.wallet_id} onChange={set('wallet_id')} />}</Field>
        <Field label="Kategori">{(id) => <CategorySelect id={id} type={form.type} value={form.category_id} onChange={set('category_id')} />}</Field>
        {!rule && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ulangi">
              {() => <Segmented className="w-full" value={form.frequency} onChange={set('frequency')} options={[{ value: 'monthly', label: 'Bulanan' }, { value: 'weekly', label: 'Mingguan' }]} />}
            </Field>
            <Field label="Mulai">{(id) => <Input id={id} type="date" value={form.start_date} onChange={(e) => set('start_date')(e.target.value)} />}</Field>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Berakhir" hint="Kosongkan bila tanpa batas.">{(id) => <Input id={id} type="date" value={form.end_date} min={form.start_date} onChange={(e) => set('end_date')(e.target.value)} />}</Field>
          <Field label="Catatan">{(id) => <Input id={id} value={form.note} onChange={(e) => set('note')(e.target.value)} placeholder="Mis. Gaji kantor" />}</Field>
        </div>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

export default function RecurringPage() {
  const { toast, confirm } = useFeedback()
  const remove = useAction(recurringApi.remove, { onSuccess: () => toast('Jadwal dihapus') })
  const askRemove = async (r) => {
    if (await confirm({ title: `Hapus jadwal ${r.note || r.category.name}?`, message: 'Transaksi yang sudah tercatat dari jadwal ini tetap ada.', confirmLabel: 'Hapus jadwal', danger: true })) remove.mutate(r.id)
  }
  const rules = useRecurring()
  const [form, setForm] = useState(null)
  const toggle = useAction(({ id, is_active }) => recurringApi.update(id, { is_active }), {
    onSuccess: (r) => toast(r.is_active ? 'Jadwal dilanjutkan' : 'Jadwal dijeda'),
    onError: (e) => toast(e.message, 'error'),
  })

  const list = (rules.data || []).slice().sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.next_run_date.localeCompare(b.next_run_date))
  const monthly = list
    .filter((r) => r.is_active)
    .reduce((acc, r) => {
      const perMonth = r.frequency === 'weekly' ? (r.amount * 52) / 12 : r.amount
      acc[r.type] += perMonth
      return acc
    }, { income: 0, expense: 0 })

  return (
    <div>
      <PageHeader title="Transaksi rutin" description="Dicatat otomatis setiap jatuh tempo. Jadwal yang terlewat ikut dicatat saat server berjalan lagi." actions={<Button icon={Plus} onClick={() => setForm({})}>Jadwal baru</Button>} />

      {list.length > 0 && (
        <section className="panel mb-5 grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-5">
            <p className="text-[13px] text-muted">Pemasukan rutin per bulan</p>
            <p className="num mt-1 text-[26px] font-semibold text-income">{rupiah(monthly.income)}</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-[13px] text-muted">Pengeluaran rutin per bulan</p>
            <p className="num mt-1 text-[26px] font-semibold">{rupiah(monthly.expense)}</p>
          </div>
        </section>
      )}

      <ErrorNote error={rules.error} onRetry={rules.refetch} />

      {rules.isLoading ? (
        <Skeleton className="h-64" />
      ) : list.length === 0 ? (
        <section className="panel">
          <Empty icon={Repeat} title="Belum ada transaksi rutin" action={<Button icon={Plus} onClick={() => setForm({})}>Jadwal baru</Button>}>
            Tambahkan gaji, sewa, cicilan, atau langganan supaya tidak perlu dicatat manual tiap bulan.
          </Empty>
        </section>
      ) : (
        <section className="panel divide-y divide-line">
          {list.map((r) => (
            <div key={r.id} className={cn('flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:px-6', !r.is_active && 'opacity-60')}>
              <button type="button" onClick={() => setForm({ rule: r })} className="flex min-w-0 flex-1 items-center gap-3.5 text-left">
                <FlowIcon type={r.type} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{r.note || r.category.name}</span>
                    <Badge tone="violet">{r.frequency === 'weekly' ? 'Mingguan' : 'Bulanan'}</Badge>
                    {!r.is_active && <Badge>Dijeda</Badge>}
                  </span>
                  <span className="block truncate text-[13px] text-muted">
                    {r.category.name}, {r.type === 'income' ? 'ke' : 'dari'} {r.wallet.name}
                    {r.end_date ? `, sampai ${dateLabel(r.end_date)}` : ''}
                  </span>
                  {r.last_error && (
                    <span className="mt-1 flex items-center gap-1.5 text-[13px] text-expense">
                      <AlertTriangle className="size-3.5 shrink-0" /> Gagal terakhir kali: {r.last_error}
                    </span>
                  )}
                </span>
              </button>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="sm:text-right">
                  <p className={cn('num font-semibold', r.type === 'income' && 'text-income')}>{rupiah(r.type === 'income' ? r.amount : -r.amount, { sign: r.type === 'income' })}</p>
                  <p className="text-xs text-muted">{r.is_active ? `Berikutnya ${relativeDay(r.next_run_date).toLowerCase()}` : 'Tidak berjalan'}</p>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => toggle.mutate({ id: r.id, is_active: !r.is_active })}
                    aria-label={r.is_active ? 'Jeda jadwal' : 'Lanjutkan jadwal'}
                    title={r.is_active ? 'Jeda' : 'Lanjutkan'}
                    className="rounded-full p-2 text-muted hover:bg-sunken hover:text-ink"
                  >
                    {r.is_active ? <Pause className="size-4" /> : <Play className="size-4" />}
                  </button>
                  <button type="button" onClick={() => askRemove(r)} aria-label="Hapus jadwal" className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {form && <RecurringForm rule={form.rule} onClose={() => setForm(null)} />}
    </div>
  )
}
