import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, CalendarClock, Plus, Receipt, Wallet } from 'lucide-react'
import { useAuth } from '../context/auth'
import { useQuick } from '../components/layout/QuickActions'
import { CashflowChart } from '../components/charts'
import { TransactionRow, WalletGlyph } from '../components/finance'
import { Button, Empty, ErrorNote, Money, Panel, Progress, Skeleton } from '../components/ui'
import { useCurrentBudgets, useDebts, useMonthlyReport, useProfile, useRecurring, useTransactions, useWallets, useYearlyReport } from '../hooks/queries'
import { cycleProgress } from '../lib/cycle'
import { cn } from '../lib/cn'
import { MONTHS_SHORT, dateLabel, dayStartISO, relativeDay, rupiah, today } from '../lib/format'
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/70">Total saldo semua dompet</p>
          {loading ? <Skeleton className="mt-2 h-11 w-56 bg-white/20" /> : <p className="num mt-1 text-[40px] font-semibold leading-none sm:text-[46px]">{rupiah(total)}</p>}
        </div>
        <Link to="/profil#siklus" className="whitespace-nowrap rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25">
          Gajian tgl {cycle.startDay}
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            Hari ke-{cycle.dayIndex} dari {cycle.length}
          </span>
          <span className="text-white/70">
            {cycle.daysLeft === 1 ? 'Gajian besok' : `${cycle.daysLeft - 1} hari lagi gajian`}
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
        <Button variant="outline" className="border-transparent bg-white text-[#1D1931] hover:bg-white/90" icon={Plus} onClick={() => quick.openTransaction()}>
          Catat transaksi
        </Button>
        <Button variant="ghost" className="bg-white/15 text-white hover:bg-white/25 hover:text-white" icon={ArrowLeftRight} onClick={() => quick.openTransfer()}>
          Pindahkan uang
        </Button>
      </div>
    </section>
  )
}

function PeriodStats({ report, budgets, loading }) {
  const cells = [
    { label: 'Pemasukan periode ini', value: report?.total_income, tone: 'text-income' },
    { label: 'Pengeluaran periode ini', value: report?.total_expense, tone: '' },
    { label: 'Selisih', value: report?.net_balance, tone: report?.net_balance < 0 ? 'text-expense' : '' , sign: true },
    {
      label: budgets?.total_budget ? 'Sisa anggaran' : 'Anggaran',
      value: budgets?.total_budget ? budgets.total_remain : null,
      tone: budgets?.total_remain < 0 ? 'text-expense' : '',
      foot: budgets?.total_budget ? (
        <Progress value={(budgets.total_spent / budgets.total_budget) * 100} tone={budgets.total_spent > budgets.total_budget ? 'expense' : 'violet'} className="mt-3" />
      ) : (
        <Link to="/anggaran" className="mt-1 inline-block text-sm font-semibold text-violet-ink hover:underline">
          Buat anggaran
        </Link>
      ),
    },
  ]
  return (
    <section className="panel grid grid-cols-2 overflow-hidden">
      {cells.map((c, i) => (
        <div key={c.label} className={cn('flex flex-col p-5 sm:p-6', i % 2 === 0 && 'border-r border-line', i < 2 && 'border-b border-line')}>
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
  const cycle = { ...cycleProgress(startDay), startDay }
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

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CycleHero total={total} cycle={cycle} loading={wallets.isLoading} />
        </div>
        <div className="lg:col-span-5">
          <PeriodStats report={report.data} budgets={budgets.data} loading={report.isLoading} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
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

      <div className="grid items-start gap-5 lg:grid-cols-12">
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
                {budgets.data.budgets
                  .slice()
                  .sort((a, b) => b.used_pct - a.used_pct)
                  .slice(0, 4)
                  .map((b) => (
                    <li key={b.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate font-semibold">{b.category.name}</span>
                        <span className="num whitespace-nowrap text-muted">
                          <span className={cn('font-semibold', b.status === 'over_budget' ? 'text-expense' : 'text-ink')}>{rupiah(b.spent)}</span> / {rupiah(b.amount)}
                        </span>
                      </div>
                      <Progress value={b.used_pct} tone={b.status === 'over_budget' ? 'expense' : b.status === 'warning' ? 'caution' : 'violet'} />
                    </li>
                  ))}
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
