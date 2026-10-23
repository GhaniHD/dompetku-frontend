import { useState } from 'react'
import { walletApi } from '../../api/endpoints'
import { useAction } from '../../hooks/queries'
import { dayToISO, parseAmount, rupiah, today } from '../../lib/format'
import { WALLET_TYPES } from '../../lib/walletTypes'
import { cn } from '../../lib/cn'
import { Button, Field, Input, Modal, MoneyInput } from '../ui'
import { useFeedback } from '../ui/feedback'

export function WalletForm(props) {
  return props.open ? <WalletBody {...props} /> : null
}

function WalletBody({ onClose, wallet }) {
  const { toast } = useFeedback()
  const [name, setName] = useState(wallet?.name || '')
  const [type, setType] = useState(wallet?.type || 'cash')
  const [balance, setBalance] = useState('')
  const [error, setError] = useState('')

  const save = useAction((body) => (wallet ? walletApi.update(wallet.id, body) : walletApi.create(body)), {
    onSuccess: () => {
      toast(wallet ? 'Dompet diperbarui' : 'Dompet dibuat')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Isi nama dompet.')
    const body = { name: name.trim(), type }
    if (!wallet) body.balance = parseAmount(balance)
    save.mutate(body)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={wallet ? 'Ubah dompet' : 'Tambah dompet'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="wallet-form" loading={save.isPending}>{wallet ? 'Simpan perubahan' : 'Tambah dompet'}</Button>
        </>
      }
    >
      <form id="wallet-form" onSubmit={submit} className="space-y-4">
        <Field label="Nama">{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis. BCA, GoPay, Dompet saku" />}</Field>
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-semibold">Jenis</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(WALLET_TYPES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                aria-pressed={type === key}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                  type === key ? 'border-violet bg-violet-soft text-violet-ink' : 'border-line hover:bg-sunken'
                )}
              >
                <t.icon className="size-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
        {!wallet && (
          <Field
            label="Saldo awal"
            hint={type === 'credit_card' ? 'Isi tagihan berjalan sebagai angka minus, mis. -1.500.000.' : 'Saldo saat ini. Bisa 0.'}
          >
            {(id) => <MoneyInput id={id} value={balance} onChange={setBalance} allowNegative={type === 'credit_card'} placeholder="0" />}
          </Field>
        )}
        {wallet && <p className="rounded-xl bg-sunken px-3.5 py-2.5 text-sm text-muted">Untuk mengubah saldo, pakai Sesuaikan saldo agar selisihnya tercatat.</p>}
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

export function AdjustForm(props) {
  return props.open && props.wallet ? <AdjustBody {...props} /> : null
}

function AdjustBody({ onClose, wallet }) {
  const { toast } = useFeedback()
  const [actual, setActual] = useState(String(Math.round(wallet.balance)))
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')

  const save = useAction((body) => walletApi.adjust(wallet.id, body), {
    onSuccess: () => {
      toast('Saldo disesuaikan')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const value = parseAmount(actual)
  const diff = value - wallet.balance

  return (
    <Modal
      open
      onClose={onClose}
      title="Sesuaikan saldo"
      description={`Samakan saldo ${wallet.name} dengan saldo sebenarnya. Selisihnya dicatat sebagai penyesuaian, bukan pemasukan atau pengeluaran.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button
            type="submit"
            form="adjust-form"
            loading={save.isPending}
            disabled={diff === 0}
          >
            Simpan saldo
          </Button>
        </>
      }
    >
      <form
        id="adjust-form"
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate({ actual_balance: value, note: note.trim(), date: dayToISO(date) })
        }}
        className="space-y-4"
      >
        <div className="rounded-2xl bg-sunken px-4 py-3 text-sm">
          <span className="text-muted">Saldo tercatat</span>
          <span className="num float-right font-semibold">{rupiah(wallet.balance)}</span>
        </div>
        <Field label="Saldo sebenarnya">
          {(id) => <MoneyInput id={id} value={actual} onChange={setActual} allowNegative={wallet.type === 'credit_card'} />}
        </Field>
        {diff !== 0 && (
          <p className={cn('text-sm font-semibold', diff > 0 ? 'text-income' : 'text-expense')}>
            Selisih {rupiah(diff, { sign: true })}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal">{(id) => <Input id={id} type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
          <Field label="Alasan">{(id) => <Input id={id} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mis. lupa catat parkir" />}</Field>
        </div>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}
