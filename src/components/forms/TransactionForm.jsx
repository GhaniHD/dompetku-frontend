import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { transactionApi } from '../../api/endpoints'
import { useAction } from '../../hooks/queries'
import { dayToISO, isoToDay, parseAmount, today } from '../../lib/format'
import { Button, Field, Input, Modal, MoneyInput, Segmented, Skeleton } from '../ui'
import { useFeedback } from '../ui/feedback'
import { CategorySelect, WalletSelect } from './pickers'

function Fields({ initial, onSubmit, setError }) {
  const [form, setForm] = useState(initial)
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    const amount = parseAmount(form.amount)
    if (amount <= 0) return setError('Masukkan nominal lebih dari 0.')
    if (!form.wallet_id) return setError('Pilih dompet.')
    if (!form.category_id) return setError('Pilih kategori.')
    setError('')
    onSubmit({
      type: form.type,
      amount,
      wallet_id: form.wallet_id,
      category_id: form.category_id,
      date: dayToISO(form.date),
      note: form.note.trim(),
    })
  }

  return (
    <form id="tx-form" onSubmit={submit} className="space-y-4">
      <Segmented
        className="w-full"
        value={form.type}
        onChange={(type) => setForm((f) => ({ ...f, type, category_id: '' }))}
        options={[
          { value: 'expense', label: 'Pengeluaran' },
          { value: 'income', label: 'Pemasukan' },
        ]}
      />
      <Field label="Nominal">{(id) => <MoneyInput id={id} value={form.amount} onChange={set('amount')} placeholder="0" />}</Field>
      <Field label="Dompet">{(id) => <WalletSelect id={id} value={form.wallet_id} onChange={set('wallet_id')} />}</Field>
      <Field label="Kategori">{(id) => <CategorySelect id={id} type={form.type} value={form.category_id} onChange={set('category_id')} />}</Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tanggal">{(id) => <Input id={id} type="date" value={form.date} max={today()} onChange={(e) => set('date')(e.target.value)} required />}</Field>
        <Field label="Catatan">{(id) => <Input id={id} value={form.note} onChange={(e) => set('note')(e.target.value)} placeholder="Opsional" />}</Field>
      </div>
    </form>
  )
}

function Body({ onClose, preset, editId }) {
  const { toast, confirm } = useFeedback()
  const [error, setError] = useState('')

  const detail = useQuery({
    queryKey: ['transactions', 'detail', editId],
    queryFn: () => transactionApi.get(editId),
    enabled: !!editId,
    staleTime: 0,
  })

  const save = useAction((body) => (editId ? transactionApi.update(editId, body) : transactionApi.create(body)), {
    onSuccess: () => {
      toast(editId ? 'Transaksi diperbarui' : 'Transaksi dicatat')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const remove = useAction(() => transactionApi.remove(editId), {
    onSuccess: () => {
      toast('Transaksi dihapus')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const askRemove = async () => {
    const ok = await confirm({
      title: 'Hapus transaksi ini?',
      message: 'Saldo dompet dan anggaran akan dihitung ulang tanpa transaksi ini.',
      confirmLabel: 'Hapus transaksi',
      danger: true,
    })
    if (ok) remove.mutate()
  }

  const t = detail.data
  const initial = editId
    ? t && { type: t.type, amount: String(Math.round(t.amount)), wallet_id: t.wallet.id, category_id: t.category.id, date: isoToDay(t.date), note: t.note || '' }
    : { type: preset.type || 'expense', amount: '', wallet_id: preset.wallet_id || '', category_id: '', date: today(), note: '' }

  return (
    <Modal
      open
      onClose={onClose}
      title={editId ? 'Ubah transaksi' : 'Catat transaksi'}
      footer={
        <>
          {editId && (
            <Button variant="danger-soft" className="mr-auto" loading={remove.isPending} onClick={askRemove}>
              Hapus
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="tx-form" loading={save.isPending} disabled={!initial}>
            {editId ? 'Simpan perubahan' : 'Simpan transaksi'}
          </Button>
        </>
      }
    >
      {detail.error ? (
        <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{detail.error.message}</p>
      ) : !initial ? (
        <div className="space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      ) : (
        <Fields initial={initial} onSubmit={save.mutate} setError={setError} />
      )}
      {error && <p className="mt-4 rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
    </Modal>
  )
}

export default function TransactionForm({ open, onClose, preset = {}, editId }) {
  return open ? <Body onClose={onClose} preset={preset} editId={editId} /> : null
}
