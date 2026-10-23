import { useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { transferApi } from '../../api/endpoints'
import { useAction } from '../../hooks/queries'
import { dayToISO, parseAmount, rupiah, today } from '../../lib/format'
import { Button, Field, Input, Modal, MoneyInput } from '../ui'
import { useFeedback } from '../ui/feedback'
import { WalletSelect } from './pickers'

const blank = (preset) => ({ from: preset.from || '', to: preset.to || '', amount: '', fee: '', date: today(), note: '' })

export default function TransferForm(props) {
  return props.open ? <Body {...props} /> : null
}

function Body({ onClose, preset = {} }) {
  const { toast } = useFeedback()
  const [form, setForm] = useState(() => blank(preset))
  const [error, setError] = useState('')

  const save = useAction(transferApi.create, {
    onSuccess: () => {
      toast('Transfer berhasil dicatat')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const amount = parseAmount(form.amount)
  const fee = parseAmount(form.fee)

  const submit = (e) => {
    e.preventDefault()
    if (!form.from || !form.to) return setError('Pilih dompet asal dan tujuan.')
    if (form.from === form.to) return setError('Dompet asal dan tujuan harus berbeda.')
    if (amount <= 0) return setError('Masukkan nominal lebih dari 0.')
    setError('')
    save.mutate({
      from_wallet_id: form.from,
      to_wallet_id: form.to,
      amount,
      fee,
      date: dayToISO(form.date),
      note: form.note.trim(),
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Pindahkan uang"
      description="Saldo dompet asal berkurang, dompet tujuan bertambah. Tidak dihitung sebagai pemasukan atau pengeluaran."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="transfer-form" loading={save.isPending}>
            Pindahkan
          </Button>
        </>
      }
    >
      <form id="transfer-form" onSubmit={submit} className="space-y-4">
        <Field label="Dari">{(id) => <WalletSelect id={id} value={form.from} onChange={set('from')} exclude={form.to} placeholder="Pilih dompet asal" />}</Field>
        <div className="-my-1 flex justify-center text-faint">
          <ArrowDown className="size-5" />
        </div>
        <Field label="Ke">{(id) => <WalletSelect id={id} value={form.to} onChange={set('to')} exclude={form.from} placeholder="Pilih dompet tujuan" />}</Field>
        <Field label="Nominal">{(id) => <MoneyInput id={id} value={form.amount} onChange={set('amount')} placeholder="0" />}</Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Biaya admin" hint="Dicatat sebagai pengeluaran dompet asal.">
            {(id) => <MoneyInput id={id} value={form.fee} onChange={set('fee')} placeholder="0" />}
          </Field>
          <Field label="Tanggal">{(id) => <Input id={id} type="date" value={form.date} max={today()} onChange={(e) => set('date')(e.target.value)} />}</Field>
        </div>
        <Field label="Catatan">{(id) => <Input id={id} value={form.note} onChange={(e) => set('note')(e.target.value)} placeholder="Mis. Tarik tunai ATM" />}</Field>
        {amount > 0 && (
          <p className="rounded-xl bg-sunken px-3.5 py-2.5 text-sm text-muted">
            Total keluar dari dompet asal: <span className="num font-semibold text-ink">{rupiah(amount + fee)}</span>
          </p>
        )}
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}
