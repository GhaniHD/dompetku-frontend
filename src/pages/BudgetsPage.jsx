import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, Copy, PiggyBank, PieChart, Plus, Trash2 } from 'lucide-react'
import { budgetApi } from '../api/endpoints'
import { CategorySelect } from '../components/forms/pickers'
import MonthNav from '../components/MonthNav'
import { shiftMonth } from '../lib/months'
import { Badge, Button, Empty, ErrorNote, Field, Input, Modal, MoneyInput, PageHeader, Progress, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useQuick } from '../components/layout/QuickActions'
import { useAction, useBudgets, useProfile } from '../hooks/queries'
import { periodFor, periodOf } from '../lib/cycle'
import { cn } from '../lib/cn'
import { MONTHS, dateLabel, parseAmount, rupiah } from '../lib/format'
import { periodWords } from '../lib/period'

const STATUS = {
  on_track: { label: 'Aman', tone: 'income' },
  warning: { label: 'Hampir habis', tone: 'caution' },
  over_budget: { label: 'Terlampaui', tone: 'expense' },
}

function BudgetForm({ onClose, budget, month }) {
  const { toast } = useFeedback()
  const [categoryId, setCategoryId] = useState(budget?.category.id || '')
  const [amount, setAmount] = useState(budget ? String(Math.round(budget.amount)) : '')
  const [notes, setNotes] = useState(budget?.notes || '')
  const [error, setError] = useState('')

  const save = useAction((body) => (budget ? budgetApi.update(budget.id, body) : budgetApi.create(body)), {
    onSuccess: () => {
      toast(budget ? 'Anggaran diperbarui' : 'Anggaran dibuat')
      onClose()
    },
    onError: (e) => setError(e.message),
  })

  const submit = (e) => {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!budget && !categoryId) return setError('Pilih kategori pengeluaran.')
    if (value <= 0) return setError('Masukkan batas lebih dari 0.')
    save.mutate(budget ? { amount: value, notes } : { category_id: categoryId, amount: value, notes, month: month.month, year: month.year })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={budget ? `Anggaran ${budget.category.name}` : 'Buat anggaran'}
      description={budget ? undefined : `Untuk periode ${MONTHS[month.month - 1]} ${month.year}.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="budget-form" loading={save.isPending}>Simpan anggaran</Button>
        </>
      }
    >
      <form id="budget-form" onSubmit={submit} className="space-y-4">
        {!budget && <Field label="Kategori pengeluaran">{(id) => <CategorySelect id={id} type="expense" value={categoryId} onChange={setCategoryId} />}</Field>}
        <Field label="Batas pengeluaran">{(id) => <MoneyInput id={id} value={amount} onChange={setAmount} placeholder="0" />}</Field>
        <Field label="Catatan">{(id) => <Input id={id} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsional" />}</Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

function FreeMoneyCard({ free, until }) {
  const short = free.amount < 0
  const parts = [
    ['Saldo siap pakai', free.spendable, 'Tunai, bank & dompet digital, di luar dompet target'],
    ['Sisa anggaran', -free.budget_left, 'Masih disisihkan untuk kategori beranggaran'],
    ['Sisa setoran tabungan', -free.savings_left, 'Belum disetor ke target periode ini'],
  ]
  return (
    <section className="panel mb-5 p-6">
      <p className="text-[13px] text-muted">Sisa uang bebas</p>
      <p className={cn('num text-[34px] font-semibold leading-tight', short && 'text-expense')}>{rupiah(free.amount)}</p>
      <p className="text-sm text-muted">
        {short ? `Saldo kurang ${rupiah(-free.amount)} untuk menutup anggaran dan tabungan sampai ${until}.` : `Boleh dipakai di luar anggaran tanpa mengganggu rencana sampai ${until}.`}
      </p>
      <dl className="mt-4 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-3 sm:gap-4">
        {parts.map(([label, value, hint]) => (
          <div key={label}>
            <dt className="text-[13px] text-muted">{label}</dt>
            <dd className="num font-semibold">{value < 0 ? `− ${rupiah(-value)}` : rupiah(value)}</dd>
            <dd className="text-xs text-faint">{hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function SavingsSection({ data, isCurrent }) {
  const quick = useQuick()
  return (
    <section className="panel mt-5">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <div>
          <h2 className="text-[17px] font-semibold">Tabungan periode ini</h2>
          <p className="text-[13px] text-muted">
            Disetor <span className="num font-semibold text-ink">{rupiah(data.savings_deposited)}</span>
            {data.savings_planned > 0 && <> dari rencana <span className="num font-semibold text-ink">{rupiah(data.savings_planned)}</span></>}
          </p>
        </div>
        <Link to="/target" className="whitespace-nowrap text-sm font-semibold text-violet-ink hover:underline">Kelola target</Link>
      </div>
      <div className="mt-3 divide-y divide-line">
        {data.savings.map((s) => {
          const pct = s.planned > 0 ? (s.deposited / s.planned) * 100 : 0
          return (
            <div key={s.goal_id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <PiggyBank className="size-4 text-violet-ink" />
                  <span className="font-semibold">{s.name}</span>
                  <span className="truncate text-[13px] text-muted">{s.wallet_name}</span>
                  {s.achieved && <Badge tone="income">Tercapai</Badge>}
                </div>
                {s.planned > 0 ? <Progress value={pct} tone={pct >= 100 ? 'income' : 'violet'} /> : <p className="text-[13px] text-muted">Tanpa tenggat, jadi tidak ada rencana setoran per periode.</p>}
              </div>
              <div className="flex items-center justify-between gap-4 sm:w-[300px] sm:justify-end">
                <div className="text-sm sm:text-right">
                  <p className="num font-semibold">
                    {rupiah(s.deposited)}
                    {s.planned > 0 && <span className="font-normal text-muted"> / {rupiah(s.planned)}</span>}
                  </p>
                  <p className="text-[13px] text-muted">
                    {s.deposited < 0 ? `Ditarik ${rupiah(-s.deposited)}` : s.planned === 0 ? 'Disetor periode ini' : s.remain > 0 ? `Sisa setor ${rupiah(s.remain)}` : 'Sesuai rencana'}
                    {s.deposited < 0 && s.remain > 0 && ` · sisa setor ${rupiah(s.remain)}`}
                  </p>
                </div>
                {isCurrent && !s.achieved && (
                  <Button size="sm" variant="outline" icon={ArrowLeftRight} onClick={() => quick.openTransfer({ to: s.wallet_id, amount: s.remain || '' })}>
                    Setor
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function BudgetsPage() {
  const { toast, confirm } = useFeedback()
  const profile = useProfile().data
  const startDay = profile?.budget_start_day || 1
  const words = periodWords(profile)
  const current = periodOf(startDay)
  const [picked, setPicked] = useState(null)
  const month = picked || { month: current.month, year: current.year }
  const period = periodFor(startDay, month.year, month.month)
  const budgets = useBudgets(month.month, month.year)
  const [form, setForm] = useState(null)

  const remove = useAction(budgetApi.remove, { onSuccess: () => toast('Anggaran dihapus') })
  const prev = shiftMonth(month, -1)
  const copy = useAction(() => budgetApi.copy({ from_month: prev.month, from_year: prev.year, to_month: month.month, to_year: month.year }), {
    onSuccess: () => toast('Anggaran periode lalu disalin'),
    onError: (e) => toast(e.message, 'error'),
  })

  const askRemove = async (b) => {
    if (await confirm({ title: `Hapus anggaran ${b.category.name}?`, message: 'Transaksinya tetap ada. Hanya batas anggarannya yang dihapus.', confirmLabel: 'Hapus anggaran', danger: true })) remove.mutate(b.id)
  }

  const data = budgets.data
  const list = (data?.budgets || []).slice().sort((a, b) => b.used_pct - a.used_pct)
  const usedPct = data?.total_budget ? (data.total_spent / data.total_budget) * 100 : 0
  const rangeLabel = `${dateLabel(period.start, { day: 'numeric', month: 'short' })} – ${dateLabel(period.end, { day: 'numeric', month: 'short', year: 'numeric' })}`
  const isCurrent = month.month === current.month && month.year === current.year
  const daysLeft = isCurrent ? Math.max(1, Math.round((period.next - new Date(new Date().toDateString())) / 86400000)) : null

  return (
    <div>
      <PageHeader
        title="Anggaran"
        description={
          <>
            {words.basis}{' '}
            <Link to="/profil#siklus" className="font-semibold text-violet-ink hover:underline">{words.settingsLink}</Link>
          </>
        }
        actions={<Button icon={Plus} onClick={() => setForm({})}>Buat anggaran</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <MonthNav value={month} onChange={setPicked} />
        <span className="text-sm text-muted">{rangeLabel}</span>
      </div>

      <ErrorNote error={budgets.error} onRetry={budgets.refetch} />

      {data?.free_money && (list.length > 0 || data.savings.length > 0) && <FreeMoneyCard free={data.free_money} until={words.until} />}

      {budgets.isLoading ? (
        <div className="space-y-4"><Skeleton className="h-36" /><Skeleton className="h-64" /></div>
      ) : list.length === 0 ? (
        <section className="panel">
          <Empty
            icon={PieChart}
            title="Belum ada anggaran di periode ini"
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" icon={Copy} loading={copy.isPending} onClick={() => copy.mutate()}>
                  Salin dari {MONTHS[prev.month - 1]}
                </Button>
                <Button icon={Plus} onClick={() => setForm({})}>Buat anggaran</Button>
              </div>
            }
          >
            Tentukan batas pengeluaran per kategori. Kamu akan diberi tahu saat pemakaian mencapai 80% dan 100%.
          </Empty>
        </section>
      ) : (
        <>
          <section className="panel mb-5 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[13px] text-muted">Sisa anggaran</p>
                <p className={cn('num text-[34px] font-semibold leading-tight', data.total_remain < 0 && 'text-expense')}>{rupiah(data.total_remain)}</p>
                {daysLeft && data.total_remain > 0 && (
                  <p className="text-sm text-muted">Sekitar <span className="num font-semibold text-ink">{rupiah(data.total_remain / daysLeft)}</span> per hari sampai {words.until}.</p>
                )}
              </div>
              <div className="text-right text-sm text-muted">
                <p>Terpakai <span className="num font-semibold text-ink">{rupiah(data.total_spent)}</span></p>
                <p>dari <span className="num font-semibold text-ink">{rupiah(data.total_budget)}</span></p>
              </div>
            </div>
            <Progress value={usedPct} tone={usedPct > 100 ? 'expense' : usedPct >= 80 ? 'caution' : 'violet'} className="mt-5 h-3" />
          </section>

          <section className="panel divide-y divide-line">
            {list.map((b) => {
              const st = STATUS[b.status] || STATUS.on_track
              return (
                <div key={b.id} className="group flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
                  <button type="button" onClick={() => setForm({ budget: b })} className="min-w-0 flex-1 text-left">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{b.category.name}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {b.notes && <span className="truncate text-[13px] text-muted">{b.notes}</span>}
                    </div>
                    <Progress value={b.used_pct} tone={b.status === 'over_budget' ? 'expense' : b.status === 'warning' ? 'caution' : 'violet'} />
                  </button>
                  <div className="flex items-center justify-between gap-4 sm:w-[300px] sm:justify-end">
                    <div className="text-sm sm:text-right">
                      <p className="num font-semibold">{rupiah(b.spent)} <span className="font-normal text-muted">/ {rupiah(b.amount)}</span></p>
                      <p className={cn('text-[13px]', b.remain < 0 ? 'text-expense' : 'text-muted')}>
                        {b.remain < 0 ? `Lewat ${rupiah(-b.remain)}` : `Sisa ${rupiah(b.remain)}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => askRemove(b)} aria-label={`Hapus anggaran ${b.category.name}`} className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </section>
        </>
      )}

      {data?.savings?.length > 0 && <SavingsSection data={data} isCurrent={isCurrent} />}

      {form && <BudgetForm budget={form.budget} month={month} onClose={() => setForm(null)} />}
    </div>
  )
}
