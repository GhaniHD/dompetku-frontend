import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, CalendarClock, Plus, Receipt, Settings2, Wallet } from 'lucide-react'
import { useAuth } from '../context/auth'
import { useQuick } from '../components/layout/QuickActions'
import { CashflowChart } from '../components/charts'
import { TransactionRow, WalletGlyph } from '../components/finance'
import DailyBudgetDialog from '../components/DailyBudgetDialog'
import { Button, Empty, ErrorNote, IconButton, Money, Panel, Progress, Skeleton } from '../components/ui'
import { useCategories, useCurrentBudgets, useDebts, useMonthlyReport, useProfile, useRecurring, useTransactions, useWallets, useYearlyReport } from '../hooks/queries'
import { cycleProgress } from '../lib/cycle'
import { periodWords } from '../lib/period'
import { cn } from '../lib/cn'
import { dailyPlan } from '../lib/daily'
import { MONTHS_SHORT, dateLabel, dayStartISO, relativeDay, rupiah, rupiahShort, today } from '../lib/format'
import { walletType } from '../lib/walletTypes'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 19) return 'Selamat sore'
  return 'Selamat malam'
}

function CycleHero({ total, cycle, loading }) {
  const quick = useQuick()
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-violet p-6 text-white sm:p-7">
      <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm text-white/70">Total saldo semua dompet</p>
          {loading ? <Skeleton className="mt-2 h-11 w-56 bg-white/20" /> : <p className="num mt-1 text-[34px] font-semibold leading-none min-[380px]:text-[40px] sm:text-[46px]">{rupiah(total)}</p>}
        </div>
        <Link to="/profil#siklus" className="whitespace-nowrap rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25">
          {cycle.words.badge}
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            Hari ke-{cycle.dayIndex} dari {cycle.length}
          </span>
          <span className="text-white/70">
            {cycle.words.countdown(cycle.daysLeft)}
          </span>
        </div>
        <div className="mt-3 flex h-9 gap-[3px]" aria-hidden="true">
          {Array.from({ length: cycle.length }, (_, i) => (
            <span
              key={i}
              className={cn(
                'flex-1 rounded-full transition-colors',
                i < cycle.dayIndex - 1 ? 'bg-white/90' : i === cycle.dayIndex - 1 ? 'bg-white ring-2 ring-white/40 ring-offset-2 ring-offset-violet' : 'bg-white/20'
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-white/60">
          <span>{dateLabel(cycle.start, { day: 'numeric', month: 'short' })}</span>
          <span>{dateLabel(cycle.end, { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        <Button variant="outline"className="border-transparent bg-white text-ink hover:bg-white/90" icon={Plus} onClick={() => quick.openTransaction()}>
          Catat transaksi
        </Button>
        <Button variant="ghost" className="bg-white/15 text-white hover:bg-white/25 hover:text-white" icon={ArrowLeftRight} onClick={() => quick.openTransfer()}>
          Pindahkan uang
        </Button>
      </div>
    </section>
  )
}

function budgetCell(budgets) {
  const free = budgets?.free_money
  if (budgets?.total_budget) {
    return {
      label: 'Sisa anggaran',
      value: budgets.total_remain,
      tone: budgets.total_remain < 0 ? 'text-expense' : '',
      foot: (
        <>
          <Progress value={(budgets.total_spent / budgets.total_budget) * 100} tone={budgets.total_spent > budgets.total_budget ? 'expense' : 'violet'} className="mt-3" />
          {free && (
            <Link to="/anggaran" className="mt-2 block text-xs text-muted hover:underline">
              Uang bebas <span className={cn('num font-semibold', free.amount < 0 ? 'text-expense' : 'text-ink')}>{rupiah(free.amount)}</span>
            </Link>
          )}
        </>
      ),
    }
  }
  if (free && budgets?.savings_planned > 0) {
    return {
      label: 'Uang bebas',
      value: free.amount,
      tone: free.amount < 0 ? 'text-expense' : '',
      foot: <Link to="/anggaran" className="mt-2 block text-xs font-semibold text-violet-ink hover:underline">Lihat rincian</Link>,
    }
  }
  return {
    label: 'Anggaran',
    value: null,
    foot: (
      <Link to="/anggaran" className="mt-1 inline-block text-sm font-semibold text-violet-ink hover:underline">
        Buat anggaran
      </Link>
    ),
  }
}

function PeriodStats({ report, budgets, loading }) {
  const cells = [
    { label: 'Pemasukan periode ini', value: report?.total_income, tone: 'text-income' },
    { label: 'Pengeluaran periode ini', value: report?.total_expense, tone: '' },
    { label: 'Selisih', value: report?.net_balance, tone: report?.net_balance < 0 ? 'text-expense' : '' , sign: true },
    budgetCell(budgets),
  ]
  return (
    <section className="panel grid grid-cols-2 overflow-hidden lg:grid-cols-4">
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={cn('flex flex-col p-5 sm:p-6', i % 2 === 0 && 'border-r border-line', i < 2 && 'border-b border-line lg:border-b-0', i === 1 && 'lg:border-r')}
        >
          <p className="text-[13px] text-muted">{c.label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-3/4" />
          ) : c.value == null ? (
            c.foot
          ) : (
            <div>
              <p className={cn('num mt-3 text-[22px] font-semibold leading-none sm:text-[26px]', c.tone)}>{rupiah(c.value, { sign: c.sign })}</p>
              {c.foot}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

function isToday(value) {
  const d = new Date(value)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

const ROW_LIMIT = 5

function TodayCard({ transactions, budgets, wallets, cycle, profile, loading }) {
  const quick = useQuick()
  const [settings, setSettings] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const selectedIds = profile?.daily_category_ids || []
  const { data: categories = [] } = useCategories('expense')
  const todays = transactions.filter((t) => t.type === 'expense' && isToday(t.date))
  const days = Math.max(1, cycle.daysLeft)
  const plan = dailyPlan({ todays, budgets, wallets, days, selectedIds, categories, until: cycle.words.until })
  const { spent, allowance, rows, missing, counted, other } = plan

  const pct = allowance ? (spent / allowance) * 100 : 0
  const left = allowance != null ? allowance - spent : null
  const tone = pct > 100 ? 'expense' : pct >= 80 ? 'caution' : 'violet'

  return (
    <section className="panel flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold">Hari ini</h2>
          <p className="text-[13px] text-muted">{dateLabel(today(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton icon={Settings2} label="Atur jatah harian" onClick={() => setSettings(true)} />
          <Button size="sm" variant="soft" icon={Plus} onClick={() => quick.openTransaction()}>Catat</Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="mt-5 h-24" />
      ) : (
        <>
          <div className="mt-5">
            <p className="text-[13px] text-muted">{plan.mode === 'pick' && rows.length === 1 ? `Sudah keluar untuk ${rows[0].name}` : 'Sudah keluar'}</p>
            <p className={cn('num text-[34px] font-semibold leading-tight', pct > 100 && 'text-expense')}>{rupiah(spent)}</p>
            {allowance != null && (
              <p className="text-sm text-muted">
                dari jatah <span className="num font-semibold text-ink">{rupiah(allowance)}</span>
              </p>
            )}
          </div>
          {allowance != null ? (
            <>
              <Progress value={pct} tone={tone} className="mt-3 h-2.5" />
              <p className={cn('mt-2 text-sm font-semibold', left < 0 ? 'text-expense' : 'text-ink')}>
                {left < 0 ? `Lewat ${rupiah(-left)} dari jatah hari ini` : `Masih bisa pakai ${rupiah(left)} hari ini`}
              </p>
              <p className="text-xs text-faint">{plan.basis}</p>
            </>
          ) : (
            plan.mode === 'pick' && (
              <p className="mt-2 text-sm text-muted">
                Kategori pilihanmu belum punya anggaran periode ini.{' '}
                <Link to="/anggaran" className="font-semibold text-violet-ink hover:underline">Buat anggaran</Link>
              </p>
            )
          )}

          {rows.length > 1 && (
            <ul className="mt-4 space-y-2.5">
              {(showAll ? rows : rows.slice(0, ROW_LIMIT)).map((r) => {
                const rowPct = r.allowance ? (r.spent / r.allowance) * 100 : r.spent > 0 ? 101 : 0
                return (
                  <li key={r.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-semibold">{r.name}</span>
                      <span className="num shrink-0 text-muted">
                        {rupiah(r.spent)} / {rupiah(r.allowance)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <Progress value={rowPct} tone={rowPct > 100 ? 'expense' : rowPct >= 80 ? 'caution' : 'violet'} className="h-1.5 flex-1" />
                      <span className={cn('num w-[92px] shrink-0 text-right text-xs font-semibold', r.left < 0 ? 'text-expense' : 'text-ink')}>
                        {r.left < 0 ? `lewat ${rupiahShort(-r.left)}` : `sisa ${rupiahShort(r.left)}`}
                      </span>
                    </div>
                  </li>
                )
              })}
              {rows.length > ROW_LIMIT && (
                <li>
                  <button type="button" onClick={() => setShowAll((v) => !v)} className="text-[13px] font-semibold text-violet-ink hover:underline">
                    {showAll ? 'Sembunyikan' : `Lihat semua (${rows.length - ROW_LIMIT} anggaran lainnya)`}
                  </button>
                </li>
              )}
            </ul>
          )}
          {missing.length > 0 && <p className="mt-2 text-xs text-faint">{missing.join(', ')} belum ada anggaran periode ini.</p>}

          <ul className="mt-4 space-y-1.5 border-t border-line pt-3">
            {counted.length === 0 && <li className="text-sm text-muted">Belum ada pengeluaran {plan.mode === 'wallet' ? '' : 'untuk jatah ini '}hari ini.</li>}
            {counted.slice(0, 3).map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => quick.openTransaction({ editId: t.id })} className="flex w-full items-center justify-between gap-3 rounded-lg text-left text-sm hover:text-violet-ink">
                  <span className="min-w-0 truncate">{t.note || t.category_name}</span>
                  <span className="num shrink-0 font-semibold">{rupiah(t.amount)}</span>
                </button>
              </li>
            ))}
            {counted.length > 3 && (
              <li>
                <Link to="/transaksi" className="text-[13px] font-semibold text-violet-ink hover:underline">+{counted.length - 3} transaksi lain</Link>
              </li>
            )}
            {other > 0 && (
              <li className="text-xs text-faint">
                + <span className="num">{rupiah(other)}</span> pengeluaran lain hari ini, di luar jatah ini
              </li>
            )}
          </ul>
        </>
      )}
      {settings && <DailyBudgetDialog selected={selectedIds} budgets={budgets} onClose={() => setSettings(false)} />}
    </section>
  )
}

function Upcoming() {
  const { data: recurring = [] } = useRecurring()
  const { data: debts } = useDebts({ status: 'open' })
  const items = [
    ...recurring
      .filter((r) => r.is_active)
      .map((r) => ({ id: `r-${r.id}`, date: r.next_run_date, title: r.note || r.category.name, sub: `Rutin ${r.frequency === 'weekly' ? 'mingguan' : 'bulanan'}`, amount: r.type === 'income' ? r.amount : -r.amount, to: '/rutin' })),
    ...(debts?.debts || [])
      .filter((d) => d.due_date)
      .map((d) => ({ id: `d-${d.id}`, date: d.due_date, title: d.counterparty, sub: d.kind === 'payable' ? 'Jatuh tempo hutang' : 'Jatuh tempo piutang', amount: d.kind === 'payable' ? -d.remaining : d.remaining, to: '/hutang', overdue: d.overdue })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  return (
    <Panel title="Akan datang" action={<Link to="/rutin" className="text-sm font-semibold text-violet-ink hover:underline">Kelola</Link>}>
      {items.length === 0 ? (
        <p className="py-4 text-sm text-muted">Belum ada tagihan atau transaksi rutin terjadwal.</p>
      ) : (
        <ul className="-mx-2 space-y-0.5">
          {items.map((it) => (
            <li key={it.id}>
              <Link to={it.to} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-sunken">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-muted">
                  <CalendarClock className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{it.title}</span>
                  <span className="block text-[13px] text-muted">{it.sub}</span>
                </span>
                <span className="text-right">
                  <Money value={it.amount} sign className={cn('block font-semibold', it.amount > 0 && 'text-income')} />
                  <span className={cn('block text-xs', it.overdue ? 'font-semibold text-expense' : 'text-faint')}>{it.overdue ? 'Lewat tempo' : relativeDay(it.date)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const quick = useQuick()
  const navigate = useNavigate()
  const profile = useProfile()
  const startDay = profile.data?.budget_start_day || 1
  const cycle = { ...cycleProgress(startDay), startDay, words: periodWords(profile.data) }
  const wallets = useWallets()
  const budgets = useCurrentBudgets()
  const report = useMonthlyReport(cycle.month, cycle.year, 'cycle')
  const year = new Date().getFullYear()
  const yearly = useYearlyReport(year)
  const since = new Date()
  since.setDate(since.getDate() - 45)
  const recent = useTransactions({ start_date: dayStartISO(since.toISOString().slice(0, 10)) })

  const total = (wallets.data || []).reduce((s, w) => s + w.balance, 0)
  const months = (yearly.data?.monthly_breakdown || []).filter((m) => m.month <= new Date().getMonth() + 1).slice(-6)
  const recentTx = (recent.data || []).slice(0, 6)
  const firstName = (profile.data?.name || user?.name || '').split(' ')[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 pb-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight sm:text-[34px]">
            {greeting()}, {firstName}
          </h1>
          <p className="text-muted">{dateLabel(today(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <ErrorNote error={wallets.error || report.error} onRetry={() => { wallets.refetch(); report.refetch() }} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CycleHero total={total} cycle={cycle} loading={wallets.isLoading} />
        </div>
        <div className="lg:col-span-5">
          <TodayCard transactions={recent.data || []} budgets={budgets.data} wallets={wallets.data || []} cycle={cycle} profile={profile.data} loading={recent.isLoading || wallets.isLoading} />
        </div>
      </div>

      <PeriodStats report={report.data} budgets={budgets.data} loading={report.isLoading} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel
          className="lg:col-span-7"
          title="Arus kas 6 bulan"
          action={
            <div className="flex items-center gap-4 text-[13px] text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-income" />Masuk</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-violet" />Keluar</span>
            </div>
          }
        >
          {yearly.isLoading ? (
            <Skeleton className="h-[260px]" />
          ) : (
            <CashflowChart labels={months.map((m) => MONTHS_SHORT[m.month - 1])} income={months.map((m) => m.income)} expense={months.map((m) => m.expense)} />
          )}
        </Panel>

        <Panel className="lg:col-span-5" title="Dompet" action={<Link to="/dompet" className="text-sm font-semibold text-violet-ink hover:underline">Semua dompet</Link>}>
          {wallets.isLoading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : wallets.data?.length ? (
            <ul className="-mx-2 space-y-0.5">
              {wallets.data.slice(0, 5).map((w) => (
                <li key={w.id}>
                  <Link to={`/dompet/${w.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-sunken">
                    <WalletGlyph type={w.type} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{w.name}</span>
                      <span className="block text-[13px] text-muted">{walletType(w.type).label}</span>
                    </span>
                    <Money value={w.balance} className={cn('font-semibold', w.balance < 0 && 'text-expense')} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={Wallet} title="Belum ada dompet" action={<Button size="sm" onClick={() => navigate('/dompet?baru=1')}>Tambah dompet</Button>}>
              Mulai dengan dompet tunai atau rekening bank.
            </Empty>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7" title="Transaksi terakhir" action={<Link to="/transaksi" className="text-sm font-semibold text-violet-ink hover:underline">Lihat semua</Link>}>
          {recent.isLoading ? (
            <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : recentTx.length ? (
            <div className="-mx-2 sm:-mx-3">
              {recentTx.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onClick={() => quick.openTransaction({ editId: tx.id })} />
              ))}
            </div>
          ) : (
            <Empty icon={Receipt} title="Belum ada transaksi" action={<Button size="sm" icon={Plus} onClick={() => quick.openTransaction()}>Catat transaksi</Button>}>
              Transaksi 45 hari terakhir akan muncul di sini.
            </Empty>
          )}
        </Panel>

        <div className="space-y-5 lg:col-span-5">
          <Panel title="Anggaran periode ini" action={<Link to="/anggaran" className="text-sm font-semibold text-violet-ink hover:underline">Atur</Link>}>
            {budgets.data?.budgets?.length ? (
              <ul className="space-y-4">
                {[
                  ...budgets.data.budgets.filter((b) => b.kind !== 'savings').sort((a, b) => b.used_pct - a.used_pct).slice(0, 4),
                  ...budgets.data.budgets.filter((b) => b.kind === 'savings'),
                ].map((b) => {
                  const savings = b.kind === 'savings'
                  return (
                    <li key={b.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate font-semibold">{savings ? `Tabungan ${b.goal?.name || b.wallet?.name}` : b.category.name}</span>
                        <span className="num whitespace-nowrap text-muted">
                          <span className={cn('font-semibold', b.status === 'over_budget' ? 'text-expense' : 'text-ink')}>{rupiah(b.spent)}</span> / {rupiah(b.amount)}
                        </span>
                      </div>
                      <Progress
                        value={Math.max(0, b.used_pct)}
                        tone={savings ? (b.status === 'achieved' ? 'income' : 'violet') : b.status === 'over_budget' ? 'expense' : b.status === 'on_track' ? 'violet' : 'caution'}
                      />
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="py-2 text-sm text-muted">Belum ada anggaran untuk periode ini.</p>
            )}
          </Panel>
          <Upcoming />
        </div>
      </div>
    </div>
  )
}
