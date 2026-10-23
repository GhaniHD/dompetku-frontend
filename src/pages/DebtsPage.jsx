import { useState } from 'react'
import { HandCoins, Plus, Trash2 } from 'lucide-react'
import { debtApi } from '../api/endpoints'
import { WalletSelect } from '../components/forms/pickers'
import { Badge, Button, Empty, ErrorNote, Field, Input, Modal, MoneyInput, PageHeader, Progress, Segmented, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useDebt, useDebts } from '../hooks/queries'
import { cn } from '../lib/cn'
import { dateLabel, dayToISO, groupThousands, isoToDay, parseAmount, relativeDay, rupiah, today } from '../lib/format'

const COPY = {
  payable: {
    tab: 'Hutang saya',
    new: 'Catat hutang',
    who: 'Pinjam dari siapa?',
    wallet: 'Uangnya masuk ke dompet',
    payTitle: 'Bayar cicilan',
    payWallet: 'Dibayar dari dompet',
    empty: 'Tidak ada hutang',
  },
  receivable: {
    tab: 'Piutang',
    new: 'Catat piutang',
    who: 'Dipinjam oleh siapa?',
    wallet: 'Uangnya keluar dari dompet',
    payTitle: 'Terima pelunasan',
    payWallet: 'Diterima di dompet',
    empty: 'Tidak ada piutang',
  },
}

function DebtForm({ onClose, kind }) {
  const { toast } = useFeedback()
  const c = COPY[kind]
  const [form, setForm] = useState({ counterparty: '', amount: '', wallet_id: '', date: today(), due_date: '', note: '' })
  const [error, setError] = useState('')
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const save = useAction(debtApi.create, {
    onSuccess: () => {
      toast(kind === 'payable' ? 'Hutang dicatat' : 'Piutang dicatat')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const submit = (e) => {
    e.preventDefault()
    const amount = parseAmount(form.amount)
    if (!form.counterparty.trim()) return setError('Isi nama orang atau pihaknya.')
    if (amount <= 0) return setError('Masukkan nominal lebih dari 0.')
    save.mutate({
      kind,
      counterparty: form.counterparty.trim(),
      amount,
      wallet_id: form.wallet_id || undefined,
      date: dayToISO(form.date),
      due_date: form.due_date ? dayToISO(form.due_date) : undefined,
      note: form.note.trim(),
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={c.new}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="debt-form" loading={save.isPending}>Simpan</Button>
        </>
      }
    >
      <form id="debt-form" onSubmit={submit} className="space-y-4">
        <Field label={c.who}>{(id) => <Input id={id} value={form.counterparty} onChange={(e) => set('counterparty')(e.target.value)} placeholder="Mis. Budi, Koperasi kantor" />}</Field>
        <Field label="Nominal">{(id) => <MoneyInput id={id} value={form.amount} onChange={set('amount')} placeholder="0" />}</Field>
        <Field label={c.wallet} hint="Kosongkan kalau hanya ingin mencatat tanpa mengubah saldo dompet.">
          {(id) => <WalletSelect id={id} value={form.wallet_id} onChange={set('wallet_id')} placeholder="Tidak ada" />}
        </Field>
        {form.wallet_id && (
          <button type="button" onClick={() => set('wallet_id')('')} className="-mt-2 text-[13px] font-semibold text-violet-ink hover:underline">
            Jangan ubah saldo dompet
          </button>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal">{(id) => <Input id={id} type="date" max={today()} value={form.date} onChange={(e) => set('date')(e.target.value)} />}</Field>
          <Field label="Jatuh tempo">{(id) => <Input id={id} type="date" min={form.date} value={form.due_date} onChange={(e) => set('due_date')(e.target.value)} />}</Field>
        </div>
        <Field label="Catatan">{(id) => <Input id={id} value={form.note} onChange={(e) => set('note')(e.target.value)} placeholder="Opsional" />}</Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

function DebtDetail({ id, onClose }) {
  const { toast, confirm } = useFeedback()
  const detail = useDebt(id)
  const d = detail.data
  const c = COPY[d?.kind || 'payable']
  const [pay, setPay] = useState({ amount: '', wallet_id: '', date: today(), note: '' })
  const [edit, setEdit] = useState(null)
  const [error, setError] = useState('')

  const payMut = useAction((body) => debtApi.pay(id, body), {
    onSuccess: () => {
      toast(d.kind === 'payable' ? 'Pembayaran dicatat' : 'Pelunasan dicatat')
      setPay({ amount: '', wallet_id: pay.wallet_id, date: today(), note: '' })
    },
    onError: (e) => setError(e.message),
  })
  const undo = useAction((paymentId) => debtApi.removePayment(id, paymentId), { onSuccess: () => toast('Pembayaran dibatalkan') })
  const update = useAction((body) => debtApi.update(id, body), { onSuccess: () => { toast('Perubahan disimpan'); setEdit(null) }, onError: (e) => setError(e.message) })
  const remove = useAction(() => debtApi.remove(id), { onSuccess: () => { toast('Catatan dihapus, saldo dompet dikembalikan'); onClose() } })

  const submitPay = (e) => {
    e.preventDefault()
    const amount = parseAmount(pay.amount)
    if (amount <= 0) return setError('Masukkan nominal lebih dari 0.')
    setError('')
    payMut.mutate({ amount, wallet_id: pay.wallet_id || undefined, date: dayToISO(pay.date), note: pay.note.trim() })
  }

  const askRemove = async () => {
    if (await confirm({ title: `Hapus catatan ${d.counterparty}?`, message: 'Semua pembayarannya ikut dihapus dan saldo dompet yang terkait dikembalikan.', confirmLabel: 'Hapus', danger: true })) remove.mutate()
  }

  return (
    <Modal open onClose={onClose} title={d ? d.counterparty : 'Memuat'} description={d ? (d.kind === 'payable' ? 'Hutang saya' : 'Piutang') : undefined} wide>
      {!d ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[13px] text-muted">Sisa</p>
                <p className={cn('num text-[32px] font-semibold leading-tight', d.status === 'paid' && 'text-income')}>{d.status === 'paid' ? 'Lunas' : rupiah(d.remaining)}</p>
              </div>
              <p className="text-sm text-muted">
                Terbayar <span className="num font-semibold text-ink">{rupiah(d.paid_amount)}</span> dari <span className="num font-semibold text-ink">{rupiah(d.principal)}</span>
              </p>
            </div>
            <Progress value={(d.paid_amount / d.principal) * 100} tone={d.status === 'paid' ? 'income' : 'violet'} className="mt-3" />
            {d.due_date && (
              <p className={cn('mt-2 text-sm', d.overdue ? 'font-semibold text-expense' : 'text-muted')}>
                Jatuh tempo {dateLabel(d.due_date)}{d.overdue ? ', sudah lewat' : ''}
              </p>
            )}
            {d.note && <p className="mt-1 text-sm text-muted">{d.note}</p>}
          </div>

          {edit ? (
            <form onSubmit={(e) => { e.preventDefault(); update.mutate({ counterparty: edit.counterparty.trim(), note: edit.note, due_date: edit.due_date ? dayToISO(edit.due_date) : undefined }) }} className="space-y-3 rounded-2xl bg-sunken p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nama">{(fid) => <Input id={fid} value={edit.counterparty} onChange={(e) => setEdit({ ...edit, counterparty: e.target.value })} />}</Field>
                <Field label="Jatuh tempo">{(fid) => <Input id={fid} type="date" value={edit.due_date} onChange={(e) => setEdit({ ...edit, due_date: e.target.value })} />}</Field>
              </div>
              <Field label="Catatan">{(fid) => <Input id={fid} value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} />}</Field>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEdit(null)}>Batal</Button>
                <Button size="sm" type="submit" loading={update.isPending}>Simpan</Button>
              </div>
            </form>
          ) : (
            d.status !== 'paid' && (
              <form onSubmit={submitPay} className="space-y-3 rounded-2xl bg-sunken p-4">
                <p className="font-semibold">{c.payTitle}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nominal">{(fid) => <MoneyInput id={fid} value={pay.amount} onChange={(v) => setPay({ ...pay, amount: v })} placeholder={groupThousands(Math.round(d.remaining))} />}</Field>
                  <Field label={c.payWallet}>{(fid) => <WalletSelect id={fid} value={pay.wallet_id} onChange={(v) => setPay({ ...pay, wallet_id: v })} placeholder="Tidak ada" />}</Field>
                  <Field label="Tanggal">{(fid) => <Input id={fid} type="date" max={today()} value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} />}</Field>
                  <Field label="Catatan">{(fid) => <Input id={fid} value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} placeholder="Opsional" />}</Field>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPay({ ...pay, amount: String(Math.round(d.remaining)) })}>Isi sisa</Button>
                  <Button size="sm" type="submit" loading={payMut.isPending}>Simpan pembayaran</Button>
                </div>
              </form>
            )
          )}
          {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}

          <div>
            <p className="mb-2 font-semibold">Riwayat</p>
            <ul className="divide-y divide-line rounded-2xl border border-line">
              {(d.movements || []).map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{m.kind === 'principal' ? 'Pinjaman awal' : 'Pembayaran'}</span>
                    <span className="block text-[13px] text-muted">
                      {dateLabel(m.date)}{m.wallet ? `, ${m.wallet.name}` : ''}{m.note ? `, ${m.note}` : ''}
                    </span>
                  </span>
                  <span className="num font-semibold">{rupiah(m.amount)}</span>
                  {m.kind !== 'principal' && (
                    <button type="button" onClick={() => undo.mutate(m.id)} aria-label="Batalkan pembayaran" className="rounded-full p-1.5 text-faint hover:bg-expense-soft hover:text-expense">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
            <Button variant="danger-soft" size="sm" onClick={askRemove} loading={remove.isPending}>Hapus catatan</Button>
            {!edit && <Button variant="outline" size="sm" onClick={() => setEdit({ counterparty: d.counterparty, note: d.note, due_date: isoToDay(d.due_date) })}>Ubah nama, catatan, jatuh tempo</Button>}
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function DebtsPage() {
  const [kind, setKind] = useState('payable')
  const [status, setStatus] = useState('open')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState(null)
  const all = useDebts({})
  const debts = useDebts({ kind, status: status || undefined })
  const list = debts.data?.debts || []

  return (
    <div>
      <PageHeader title="Hutang & piutang" description="Uang yang kamu pinjam dan yang dipinjam orang lain." actions={<Button icon={Plus} onClick={() => setCreating(true)}>{COPY[kind].new}</Button>} />

      <section className="panel mb-5 grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-6 py-5">
          <p className="text-[13px] text-muted">Total hutang saya</p>
          {all.isLoading ? <Skeleton className="mt-2 h-8 w-40" /> : <p className="num mt-1 text-[26px] font-semibold text-expense">{rupiah(all.data?.total_payable || 0)}</p>}
        </div>
        <div className="px-6 py-5">
          <p className="text-[13px] text-muted">Total piutang</p>
          {all.isLoading ? <Skeleton className="mt-2 h-8 w-40" /> : <p className="num mt-1 text-[26px] font-semibold text-income">{rupiah(all.data?.total_receivable || 0)}</p>}
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented value={kind} onChange={setKind} options={[{ value: 'payable', label: COPY.payable.tab }, { value: 'receivable', label: COPY.receivable.tab }]} />
        <Segmented size="sm" className="ml-auto" value={status} onChange={setStatus} options={[{ value: 'open', label: 'Belum lunas' }, { value: 'paid', label: 'Lunas' }, { value: '', label: 'Semua' }]} />
      </div>

      <ErrorNote error={debts.error} onRetry={debts.refetch} />

      {debts.isLoading ? (
        <Skeleton className="h-48" />
      ) : list.length === 0 ? (
        <section className="panel">
          <Empty icon={HandCoins} title={COPY[kind].empty} action={<Button icon={Plus} onClick={() => setCreating(true)}>{COPY[kind].new}</Button>}>
            Catat pinjaman beserta jatuh temponya. Kamu akan diingatkan sehari sebelumnya.
          </Empty>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <button key={d.id} type="button" onClick={() => setOpenId(d.id)} className="panel flex flex-col p-5 text-left transition-colors hover:border-violet/40">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate text-[17px] font-semibold">{d.counterparty}</p>
                {d.status === 'paid' ? <Badge tone="income">Lunas</Badge> : d.overdue ? <Badge tone="expense">Lewat tempo</Badge> : d.due_date ? <Badge>{relativeDay(d.due_date)}</Badge> : null}
              </div>
              <p className="mt-0.5 truncate text-[13px] text-muted">{d.note || `Sejak ${dateLabel(d.created_at)}`}</p>
              <p className="num mt-5 text-[24px] font-semibold">{rupiah(d.status === 'paid' ? d.principal : d.remaining)}</p>
              <p className="text-[13px] text-muted">{d.status === 'paid' ? 'sudah lunas' : `sisa dari ${rupiah(d.principal)}`}</p>
              <Progress value={(d.paid_amount / d.principal) * 100} tone={d.status === 'paid' ? 'income' : 'violet'} className="mt-3" />
            </button>
          ))}
        </div>
      )}

      {creating && <DebtForm kind={kind} onClose={() => setCreating(false)} />}
      {openId && <DebtDetail key={openId} id={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
