import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, Copy, PiggyBank, PieChart, Plus, Trash2 } from 'lucide-react'
import { budgetApi } from '../api/endpoints'
import { CategorySelect } from '../components/forms/pickers'
import MonthNav from '../components/MonthNav'
import { shiftMonth } from '../lib/months'
import { Badge, Button, Empty, ErrorNote, Field, Input, Modal, MoneyInput, PageHeader, Progress, Segmented, Select, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useQuick } from '../components/layout/QuickActions'
import { useAction, useBudgets, useGoals, useProfile, useWallets } from '../hooks/queries'
import { periodFor, periodOf } from '../lib/cycle'
import { cn } from '../lib/cn'
import { MONTHS, dateLabel, parseAmount, rupiah } from '../lib/format'
import { periodWords } from '../lib/period'

const STATUS = {
  on_track: { label: 'Aman', tone: 'income' },
  warning: { label: 'Hampir habis', tone: 'caution' },
  used_up: { label: 'Habis', tone: 'caution' },
  over_budget: { label: 'Terlampaui', tone: 'expense' },
  in_progress: { label: 'Berjalan', tone: 'violet' },
  achieved: { label: 'Tercapai', tone: 'income' },
}

const isSavings = (b) => b.kind === 'savings'
const budgetName = (b) => (isSavings(b) ? b.goal?.name || b.wallet?.name : b.category.name)

function SavingsTarget({ value, onChange, goals, wallets, id }) {
  const goalWallets = new Set(goals.map((g) => g.wallet.id))
  const free = wallets.filter((w) => w.type !== 'credit_card' && !goalWallets.has(w.id)).sort((a, b) => (b.type === 'savings') - (a.type === 'savings'))
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Pilih target atau dompet</option>
      {goals.length > 0 && (
        <optgroup label="Target tabungan">
          {goals.map((g) => (
            <option key={g.id} value={`goal:${g.id}`}>{g.name} ({g.wallet.name})</option>
          ))}
        </optgroup>
      )}
      {free.length > 0 && (
        <optgroup label="Dompet tanpa target">
          {free.map((w) => (
            <option key={w.id} value={`wallet:${w.id}`}>{w.name}</option>
          ))}
        </optgroup>
      )}
    </Select>
  )
}

function BudgetForm({ onClose, budget, month }) {
  const { toast } = useFeedback()
  const goals = useGoals().data || []
  const wallets = useWallets().data || []
  const [kind, setKind] = useState(budget?.kind || 'expense')
  const [categoryId, setCategoryId] = useState(budget?.category.id || '')
  const [target, setTarget] = useState('')
  const [amount, setAmount] = useState(budget ? String(Math.round(budget.amount)) : '')
  const [notes, setNotes] = useState(budget?.notes || '')
  const [error, setError] = useState('')
  const savings = kind === 'savings'
  const goal = target.startsWith('goal:') ? goals.find((g) => g.id === target.slice(5)) : null
  const suggestion = goal?.monthly_needed

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
    if (!budget && !savings && !categoryId) return setError('Pilih kategori pengeluaran.')
    if (!budget && savings && !target) return setError('Pilih target tabungan atau dompet tabungan.')
    if (value <= 0) return setError(savings ? 'Masukkan rencana setoran lebih dari 0.' : 'Masukkan batas lebih dari 0.')
    if (budget) return save.mutate({ amount: value, notes })
    const base = { amount: value, notes, month: month.month, year: month.year }
    if (!savings) return save.mutate({ ...base, kind: 'expense', category_id: categoryId })
    const [type, id] = target.split(':')
    save.mutate({ ...base, kind: 'savings', [type === 'goal' ? 'goal_id' : 'wallet_id']: id })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={budget ? `Anggaran ${isSavings(budget) ? 'tabungan ' : ''}${budgetName(budget)}` : 'Buat anggaran'}
      description={budget ? undefined : `Untuk periode ${MONTHS[month.month - 1]} ${month.year}.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" form="budget-form" loading={save.isPending}>Simpan anggaran</Button>
        </>
      }
    >
      <form id="budget-form" onSubmit={submit} className="space-y-4">
        {!budget && (
          <Segmented
            className="w-full"
            value={kind}
            onChange={(k) => { setKind(k); setError('') }}
            options={[
              { value: 'expense', label: 'Pengeluaran' },
              { value: 'savings', label: 'Tabungan' },
            ]}
          />
        )}
        {!budget && !savings && <Field label="Kategori pengeluaran">{(id) => <CategorySelect id={id} type="expense" value={categoryId} onChange={setCategoryId} />}</Field>}
        {!budget && savings && (
          <Field label="Menabung ke" hint="Setoran dihitung otomatis dari uang yang masuk ke dompet ini dikurangi yang keluar selama periode.">
            {(id) => <SavingsTarget id={id} value={target} onChange={setTarget} goals={goals} wallets={wallets} />}
          </Field>
        )}
        <Field label={savings ? 'Rencana setoran periode ini' : 'Batas pengeluaran'}>{(id) => <MoneyInput id={id} value={amount} onChange={setAmount} placeholder="0" />}</Field>
        {!budget && savings && suggestion > 0 && (
          <p className="rounded-xl bg-violet-soft px-3.5 py-2.5 text-sm">
            Saran dari target {goal.name}: <span className="num font-semibold">{rupiah(suggestion)}</span> per periode agar tercapai tepat waktu.{' '}
            <button type="button" onClick={() => setAmount(String(Math.round(suggestion)))} className="font-semibold text-violet-ink hover:underline">Pakai saran</button>
          </p>
        )}
        <Field label="Catatan">{(id) => <Input id={id} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsional" />}</Field>
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </form>
    </Modal>
  )
}

function FreeMoneyCard({ free, until }) {
  const short = free.amount < 0
  const parts = [
    ['Saldo siap pakai', free.spendable, 'Tunai, bank & dompet digital, di luar dompet tabungan'],
    ['Dikurangi sisa anggaran belanja', free.budget_left, 'Dari kategori yang belum habis'],
    ['Dikurangi setoran yang belum masuk', free.savings_left, 'Sisa rencana tabungan periode ini'],
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
            <dd className="num font-semibold">{rupiah(value)}</dd>
            <dd className="text-xs text-faint">{hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function ExpenseRow({ b, onEdit, onRemove }) {
  const st = STATUS[b.status] || STATUS.on_track
  return (
    <div className="group flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-semibold">{b.category.name}</span>
          <Badge tone={st.tone}>{st.label}</Badge>
          {b.notes && <span className="truncate text-[13px] text-muted">{b.notes}</span>}
        </div>
        <Progress value={b.used_pct} tone={b.status === 'over_budget' ? 'expense' : b.status === 'on_track' ? 'violet' : 'caution'} />
      </button>
      <div className="flex items-center justify-between gap-4 sm:w-[300px] sm:justify-end">
        <div className="text-sm sm:text-right">
          <p className="num font-semibold">{rupiah(b.spent)} <span className="font-normal text-muted">/ {rupiah(b.amount)}</span></p>
          <p className={cn('text-[13px]', b.remain < 0 ? 'text-expense' : 'text-muted')}>
            {b.remain < 0 ? `Lewat ${rupiah(-b.remain)}` : b.remain === 0 ? 'Pas habis' : `Sisa ${rupiah(b.remain)}`}
          </p>
        </div>
        <button type="button" onClick={onRemove} aria-label={`Hapus anggaran ${b.category.name}`} className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}

function SavingsRow({ b, isCurrent, onEdit, onRemove }) {
  const quick = useQuick()
  const st = STATUS[b.status] || STATUS.in_progress
  const withdrawn = b.spent < 0
  return (
    <div className="group flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <PiggyBank className="size-4 text-violet-ink" />
          <span className="font-semibold">{budgetName(b)}</span>
          {b.goal && <span className="truncate text-[13px] text-muted">{b.wallet.name}</span>}
          <Badge tone={st.tone}>{st.label}</Badge>
          {b.notes && <span className="truncate text-[13px] text-muted">{b.notes}</span>}
        </div>
        <Progress value={Math.max(0, b.used_pct)} tone={b.status === 'achieved' ? 'income' : 'violet'} />
      </button>
      <div className="flex items-center justify-between gap-4 sm:w-[340px] sm:justify-end">
        <div className="text-sm sm:text-right">
          <p className="num font-semibold">
            {withdrawn ? `Ditarik ${rupiah(-b.spent)}` : rupiah(b.spent)} <span className="font-normal text-muted">/ {rupiah(b.amount)}</span>
          </p>
          <p className="text-[13px] text-muted">{b.remain > 0 ? `Sisa setor ${rupiah(b.remain)}` : 'Rencana terpenuhi'}</p>
        </div>
        <div className="flex items-center gap-1">
          {isCurrent && b.remain > 0 && (
            <Button size="sm" variant="outline" icon={ArrowLeftRight} onClick={() => quick.openTransfer({ to: b.wallet.id, amount: b.remain })}>
              Setor
            </Button>
          )}
          <button type="button" onClick={onRemove} aria-label={`Hapus anggaran tabungan ${budgetName(b)}`} className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
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
    const message = isSavings(b) ? 'Setoran dan saldo dompet tabungan tetap ada. Hanya rencananya yang dihapus.' : 'Transaksinya tetap ada. Hanya batas anggarannya yang dihapus.'
    if (await confirm({ title: `Hapus anggaran ${isSavings(b) ? 'tabungan ' : ''}${budgetName(b)}?`, message, confirmLabel: 'Hapus anggaran', danger: true })) remove.mutate(b.id)
  }

  const data = budgets.data
  const all = data?.budgets || []
  const list = all.filter((b) => !isSavings(b)).sort((a, b) => b.used_pct - a.used_pct)
  const savingsList = all.filter(isSavings)
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

      {data?.free_money && all.length > 0 && <FreeMoneyCard free={data.free_money} until={words.until} />}

      {budgets.isLoading ? (
        <div className="space-y-4"><Skeleton className="h-36" /><Skeleton className="h-64" /></div>
      ) : all.length === 0 ? (
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
            Tentukan batas pengeluaran per kategori dan rencana setoran tabungan. Kamu akan diberi tahu saat pemakaian mencapai 80% dan 100%.
          </Empty>
        </section>
      ) : (
        <>
          {list.length > 0 && (
            <>
              <section className="panel mb-5 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-muted">Sisa anggaran pengeluaran</p>
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
                {list.map((b) => (
                  <ExpenseRow key={b.id} b={b} onEdit={() => setForm({ budget: b })} onRemove={() => askRemove(b)} />
                ))}
              </section>
            </>
          )}

          {savingsList.length > 0 && (
            <section className={cn('panel', list.length > 0 && 'mt-5')}>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
                <div>
                  <h2 className="text-[17px] font-semibold">Tabungan</h2>
                  <p className="text-[13px] text-muted">
                    {data.savings_deposited < 0 ? 'Ditarik' : 'Disetor'} <span className="num font-semibold text-ink">{rupiah(Math.abs(data.savings_deposited))}</span> dari rencana{' '}
                    <span className="num font-semibold text-ink">{rupiah(data.savings_planned)}</span>
                  </p>
                </div>
                <Link to="/target" className="whitespace-nowrap text-sm font-semibold text-violet-ink hover:underline">Kelola target</Link>
              </div>
              <div className="mt-3 divide-y divide-line">
                {savingsList.map((b) => (
                  <SavingsRow key={b.id} b={b} isCurrent={isCurrent} onEdit={() => setForm({ budget: b })} onRemove={() => askRemove(b)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {form && <BudgetForm budget={form.budget} month={month} onClose={() => setForm(null)} />}
    </div>
  )
}
