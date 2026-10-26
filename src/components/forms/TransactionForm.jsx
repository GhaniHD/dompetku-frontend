import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { transactionApi } from '../../api/endpoints'
import { useAction } from '../../hooks/queries'
import { Calculator, ListPlus, Plus, X } from 'lucide-react'
import { dayToISO, groupThousands, isoToDay, parseAmount, rupiah, today } from '../../lib/format'
import { Button, Field, Input, Modal, MoneyInput, Segmented, Skeleton } from '../ui'
import { useFeedback } from '../ui/feedback'
import { CategorySelect, WalletSelect } from './pickers'

let itemSeq = 0
const newItem = () => ({ id: ++itemSeq, name: '', amount: '' })

function ItemsEditor({ items, setItems }) {
  const update = (id, patch) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const total = items.reduce((sum, it) => sum + parseAmount(it.amount), 0)
  return (
    <div className="rounded-2xl border border-line p-3">
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={it.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-b border-line pb-2 last:border-0 last:pb-0 min-[420px]:grid-cols-[minmax(0,1fr)_minmax(0,9rem)_auto] min-[420px]:border-0 min-[420px]:pb-0">
            <Input value={it.name} onChange={(e) => update(it.id, { name: e.target.value })} placeholder={i === 0 ? 'Mis. Cireng' : 'Nama barang'} aria-label={`Nama barang ${i + 1}`} className="col-span-2 min-[420px]:col-span-1" />
            <MoneyInput value={it.amount} onChange={(v) => update(it.id, { amount: v })} placeholder="0" aria-label={`Harga barang ${i + 1}`} className="text-[15px]" quickKeys={false} />
            <button
              type="button"
              aria-label={`Hapus barang ${i + 1}`}
              disabled={items.length === 1}
              onClick={() => setItems((list) => list.filter((x) => x.id !== it.id))}
              className="mt-1 rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense disabled:opacity-30"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
        <button type="button" onClick={() => setItems((list) => [...list, newItem()])} className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-violet-ink hover:underline">
          <Plus className="size-4" /> Tambah barang
        </button>
        <p className="whitespace-nowrap text-sm text-muted">
          Total <span className="num ml-1 text-base font-semibold text-ink">{rupiah(total)}</span>
        </p>
      </div>
    </div>
  )
}

function Fields({ initial, onSubmit, setError, editing }) {
  const [form, setForm] = useState(initial)
  const [itemized, setItemized] = useState(false)
  const [items, setItems] = useState(() => [newItem(), newItem()])
  const [split, setSplit] = useState('merge')
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.wallet_id) return setError('Pilih dompet.')
    if (!form.category_id) return setError('Pilih kategori.')
    const base = { type: form.type, wallet_id: form.wallet_id, category_id: form.category_id, date: dayToISO(form.date) }

    if (!itemized) {
      const amount = parseAmount(form.amount)
      if (amount <= 0) return setError('Masukkan nominal lebih dari 0.')
      setError('')
      return onSubmit([{ ...base, amount, note: form.note.trim() }])
    }

    const filled = items.filter((it) => it.name.trim() || parseAmount(it.amount) > 0)
    if (!filled.length) return setError('Isi minimal satu barang.')
    const bad = filled.find((it) => parseAmount(it.amount) <= 0)
    if (bad) return setError(`Harga "${bad.name.trim() || 'barang'}" harus lebih dari 0.`)
    setError('')
    const extra = form.note.trim()
    if (split === 'split') {
      return onSubmit(filled.map((it) => ({ ...base, amount: parseAmount(it.amount), note: [it.name.trim(), extra].filter(Boolean).join(', ') })))
    }
    const detail = filled.map((it) => `${it.name.trim() || 'Barang'} ${groupThousands(parseAmount(it.amount))}`).join(', ')
    const total = filled.reduce((sum, it) => sum + parseAmount(it.amount), 0)
    onSubmit([{ ...base, amount: total, note: extra ? `${extra}: ${detail}` : detail }])
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">{itemized ? 'Rincian barang' : 'Nominal'}</span>
          {!editing && (
            <button type="button" onClick={() => setItemized((v) => !v)} className="flex items-center gap-1.5 text-[13px] font-semibold text-violet-ink hover:underline">
              {itemized ? <Calculator className="size-3.5" /> : <ListPlus className="size-3.5" />}
              {itemized ? 'Isi satu nominal' : 'Isi per barang'}
            </button>
          )}
        </div>
        {itemized ? (
          <ItemsEditor items={items} setItems={setItems} />
        ) : (
          <>
            <MoneyInput value={form.amount} onChange={set('amount')} placeholder="0" aria-label="Nominal" />
            {!form.amount && <p className="text-xs text-faint">Bisa langsung menghitung, mis. 15rb+12,5rb atau 2x15000.</p>}
          </>
        )}
      </div>
      {itemized && (
        <Field label="Simpan sebagai">
          {() => (
            <Segmented
              className="w-full"
              size="sm"
              value={split}
              onChange={setSplit}
              options={[
                { value: 'merge', label: '1 transaksi (total)' },
                { value: 'split', label: 'Terpisah per barang' },
              ]}
            />
          )}
        </Field>
      )}
      <Field label="Dompet">{(id) => <WalletSelect id={id} value={form.wallet_id} onChange={set('wallet_id')} />}</Field>
      <Field label="Kategori">{(id) => <CategorySelect id={id} type={form.type} value={form.category_id} onChange={set('category_id')} />}</Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tanggal">{(id) => <Input id={id} type="date" value={form.date} max={today()} onChange={(e) => set('date')(e.target.value)} required />}</Field>
        <Field label={itemized ? 'Catatan tambahan' : 'Catatan'}>
          {(id) => <Input id={id} value={form.note} onChange={(e) => set('note')(e.target.value)} placeholder={itemized ? 'Mis. Jajan sore' : 'Opsional'} />}
        </Field>
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

  const save = useAction(
    async (bodies) => {
      if (editId) return transactionApi.update(editId, bodies[0])
      for (let i = 0; i < bodies.length; i++) {
        try {
          await transactionApi.create(bodies[i])
        } catch (e) {
          throw new Error(i === 0 ? e.message : `${i} dari ${bodies.length} transaksi tersimpan. Sisanya gagal: ${e.message}`)
        }
      }
      return bodies.length
    },
    {
      onSuccess: (count) => {
        toast(editId ? 'Transaksi diperbarui' : count > 1 ? `${count} transaksi dicatat` : 'Transaksi dicatat')
        onClose()
      },
      onError: (e) => setError(e.message),
    }
  )

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
        <Fields initial={initial} onSubmit={save.mutate} setError={setError} editing={!!editId} />
      )}
      {error && <p className="mt-4 rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
    </Modal>
  )
}

export default function TransactionForm({ open, onClose, preset = {}, editId }) {
  return open ? <Body onClose={onClose} preset={preset} editId={editId} /> : null
}
