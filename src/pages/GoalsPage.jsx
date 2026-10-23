import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PartyPopper, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { goalApi } from '../api/endpoints'
import { useQuick } from '../components/layout/QuickActions'
import { WalletSelect } from '../components/forms/pickers'
import { Button, Empty, ErrorNote, Field, Input, Modal, MoneyInput, PageHeader, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useGoals } from '../hooks/queries'
import { cn } from '../lib/cn'
import { dateLabel, dayToISO, isoToDay, parseAmount, rupiah, today } from '../lib/format'

function GoalForm({ onClose, goal }) {
  const { toast } = useFeedback()
  const [form, setForm] = useState(() =>
    goal ? { name: goal.name, target: String(Math.round(goal.target_amount)), wallet_id: goal.wallet.id, deadline: isoToDay(goal.deadline) } : { name: '', target: '', wallet_id: '', deadline: '' }
  )
  const [error, setError] = useState('')
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const save = useAction((body) => (goal ? goalApi.update(goal.id, body) : goalApi.create(body)), {
    onSuccess: () => {
      toast(goal ? 'Target diperbarui' : 'Target dibuat')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const submit = (e) => {
    e.preventDefault()
    const target = parseAmount(form.target)
    if (!form.name.trim()) return setError('Beri nama targetnya.')
    if (target <= 0) return setError('Masukkan target lebih dari 0.')
    if (!goal && !form.wallet_id) return setError('Pilih dompet tempat menabung.')
    const deadline = form.deadline ? dayToISO(form.deadline) : undefined
    save.mutate(goal ? { name: form.name.trim(), target_amount: target, deadline } : { name: form.name.trim(), target_amount: target, wallet_id: form.wallet_id, deadline })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={goal ? 'Ubah target' : 'Target tabungan baru'}
      description={goal ? undefined : 'Progres dihitung dari saldo dompet yang dipilih. Pakai dompet khusus, misalnya rekening tabungan terpisah.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="goal-form" loading={save.isPending}>Simpan target</Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={submit} className="space-y-4">
        <Field label="Nama">{(id) => <Input id={id} value={form.name || ''} onChange={(e) => set('name')(e.target.value)} placeholder="Mis. Dana darurat, Liburan Bali" />}</Field>
        <Field label="Target">{(id) => <MoneyInput id={id} value={form.target} onChange={set('target')} placeholder="0" />}</Field>
        {!goal && <Field label="Dompet tabungan">{(id) => <WalletSelect id={id} value={form.wallet_id} onChange={set('wallet_id')} />}</Field>}
        <Field label="Tenggat" hint="Opsional. Dipakai untuk menghitung setoran per bulan.">{(id) => <Input id={id} type="date" min={today()} value={form.deadline || ''} onChange={(e) => set('deadline')(e.target.value)} />}</Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

function Ring({ pct, done }) {
  const r = 34
  const c = 2 * Math.PI * r
  const v = Math.min(100, Math.max(0, pct))
  return (
    <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-sunken" />
      <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} className={done ? 'stroke-income' : 'stroke-violet'} style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.2,.8,.2,1)' }} />
    </svg>
  )
}

export default function GoalsPage() {
  const quick = useQuick()
  const { toast, confirm } = useFeedback()
  const goals = useGoals()
  const [form, setForm] = useState(null)
  const remove = useAction(goalApi.remove, { onSuccess: () => toast('Target dihapus') })

  const askRemove = async (g) => {
    if (await confirm({ title: `Hapus target ${g.name}?`, message: 'Saldo dompetnya tidak berubah.', confirmLabel: 'Hapus target', danger: true })) remove.mutate(g.id)
  }

  const list = goals.data || []

  return (
    <div>
      <PageHeader title="Target tabungan" description="Satu target, satu dompet. Saldo dompet itu adalah progresnya." actions={<Button icon={Plus} onClick={() => setForm({})}>Target baru</Button>} />
      <ErrorNote error={goals.error} onRetry={goals.refetch} />
      {goals.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Skeleton className="h-56" /><Skeleton className="h-56" /></div>
      ) : list.length === 0 ? (
        <section className="panel">
          <Empty icon={Target} title="Belum ada target" action={<Button icon={Plus} onClick={() => setForm({})}>Target baru</Button>}>
            Misalnya dana darurat 6 bulan, DP rumah, atau liburan akhir tahun.
          </Empty>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((g) => (
            <article key={g.id} className={cn('panel flex flex-col p-5', g.achieved && 'border-income/40')}>
              <div className="flex items-start gap-4">
                <div className="relative grid place-items-center">
                  <Ring pct={g.progress_pct} done={g.achieved} />
                  <span className="num absolute text-sm font-semibold">{Math.floor(g.progress_pct)}%</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-semibold">{g.name}</p>
                  <Link to={`/dompet/${g.wallet.id}`} className="text-[13px] text-muted hover:text-violet-ink hover:underline">{g.wallet.name}</Link>
                  <p className="num mt-2 text-xl font-semibold">{rupiah(g.current_amount)}</p>
                  <p className="text-[13px] text-muted">dari {rupiah(g.target_amount)}</p>
                </div>
              </div>
              <div className="mt-4 flex-1 rounded-2xl bg-sunken px-4 py-3 text-sm">
                {g.achieved ? (
                  <p className="flex items-center gap-2 font-semibold text-income"><PartyPopper className="size-4" /> Tercapai{g.achieved_at ? ` ${dateLabel(g.achieved_at)}` : ''}</p>
                ) : (
                  <>
                    <p>Kurang <span className="num font-semibold">{rupiah(g.remaining)}</span></p>
                    {g.deadline && (
                      <p className="text-muted">
                        {g.monthly_needed != null && g.months_left > 0
                          ? <>Setor <span className="num font-semibold text-ink">{rupiah(g.monthly_needed)}</span> per bulan sampai {dateLabel(g.deadline)}</>
                          : `Tenggat ${dateLabel(g.deadline)}`}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="mt-4 flex items-center gap-1">
                {!g.achieved && <Button size="sm" variant="soft" icon={Plus} onClick={() => quick.openTransfer({ to: g.wallet.id })}>Tambah setoran</Button>}
                <button type="button" onClick={() => setForm({ goal: g })} aria-label="Ubah target" className="ml-auto rounded-full p-2 text-muted hover:bg-sunken hover:text-ink"><Pencil className="size-4" /></button>
                <button type="button" onClick={() => askRemove(g)} aria-label="Hapus target" className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense"><Trash2 className="size-4" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      {form && <GoalForm goal={form.goal} onClose={() => setForm(null)} />}
    </div>
  )
}
