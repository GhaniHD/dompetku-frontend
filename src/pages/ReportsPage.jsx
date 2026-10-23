import { useState } from 'react'
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import DownloadMenu from '../components/DownloadMenu'
import { CashflowChart, DonutChart, Legend2 } from '../components/charts'
import MonthNav from '../components/MonthNav'
import { Button, Empty, ErrorNote, PageHeader, Panel, Segmented, Skeleton } from '../components/ui'
import { useMonthlyReport, useProfile, useYearlyReport } from '../hooks/queries'
import { periodOf } from '../lib/cycle'
import { cn } from '../lib/cn'
import { MONTHS, MONTHS_SHORT, dateLabel, parseYmd, rupiah, ymd } from '../lib/format'

const toItems = (rows = []) => rows.map((r) => ({ name: r.category_name, total: r.total, count: r.transaction_count }))

function Totals({ data }) {
  const cells = [
    ['Pemasukan', data.total_income, 'text-income'],
    ['Pengeluaran', data.total_expense, ''],
    ['Selisih', data.net_balance, data.net_balance < 0 ? 'text-expense' : ''],
  ]
  return (
    <section className="panel mb-5 grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {cells.map(([label, value, tone], i) => (
        <div key={label} className="px-6 py-5">
          <p className="text-[13px] text-muted">{label}</p>
          <p className={cn('num mt-1 text-[28px] font-semibold', tone)}>{rupiah(value, { sign: i === 2 })}</p>
          {i === 2 && data.total_income > 0 && (
            <p className="text-[13px] text-muted">{Math.round((data.net_balance / data.total_income) * 100)}% dari pemasukan tersisa</p>
          )}
        </div>
      ))}
    </section>
  )
}

function CategoryPanels({ data }) {
  const expense = toItems(data.expense_by_category)
  const income = toItems(data.income_by_category)
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Panel title="Pengeluaran per kategori">
        {expense.length ? (
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[200px_minmax(0,1fr)]">
            <DonutChart items={expense} total={data.total_expense} label="Keluar" />
            <Legend2 items={expense} total={data.total_expense} />
          </div>
        ) : (
          <p className="py-6 text-sm text-muted">Tidak ada pengeluaran.</p>
        )}
      </Panel>
      <Panel title="Pemasukan per kategori">
        {income.length ? (
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[200px_minmax(0,1fr)]">
            <DonutChart items={income} total={data.total_income} label="Masuk" />
            <Legend2 items={income} total={data.total_income} />
          </div>
        ) : (
          <p className="py-6 text-sm text-muted">Tidak ada pemasukan.</p>
        )}
      </Panel>
    </div>
  )
}

function Monthly({ startDay }) {
  const [picked, setPicked] = useState(null)
  const [mode, setMode] = useState(startDay === 1 ? 'calendar' : 'cycle')
  const now = new Date()
  const current = mode === 'cycle' ? periodOf(startDay) : { month: now.getMonth() + 1, year: now.getFullYear() }
  const month = picked || { month: current.month, year: current.year }
  const report = useMonthlyReport(month.month, month.year, mode)
  const data = report.data
  const days = []
  if (data) {
    const byDate = new Map((data.daily_totals || []).map((d) => [d.date.slice(0, 10), d]))
    for (let d = parseYmd(data.period_start); ymd(d) <= data.period_end; d.setDate(d.getDate() + 1)) {
      const key = ymd(d)
      days.push({ date: key, expense: byDate.get(key)?.expense || 0 })
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <MonthNav value={month} onChange={setPicked} />
        {startDay !== 1 && (
          <Segmented
            size="sm"
            value={mode}
            onChange={(m) => { setMode(m); setPicked(null) }}
            options={[
              { value: 'cycle', label: 'Periode gajian' },
              { value: 'calendar', label: 'Tanggal 1–akhir' },
            ]}
          />
        )}
        {data && <span className="text-sm text-muted">{dateLabel(data.period_start)} – {dateLabel(data.period_end)}</span>}
        <div className="ml-auto">
          <DownloadMenu size="sm" start={data?.period_start} end={data?.period_end} />
        </div>
      </div>
      <ErrorNote error={report.error} onRetry={report.refetch} />
      {report.isLoading || !data ? (
        <div className="space-y-4"><Skeleton className="h-28" /><Skeleton className="h-72" /></div>
      ) : data.total_income === 0 && data.total_expense === 0 ? (
        <section className="panel"><Empty icon={BarChart3} title={`Belum ada transaksi di ${MONTHS[month.month - 1]} ${month.year}`}>Laporan dibuat otomatis dari transaksi yang kamu catat.</Empty></section>
      ) : (
        <div className={cn('transition-opacity', report.isFetching && 'opacity-60')}>
          <Totals data={data} />
          <Panel title="Pengeluaran harian" className="mb-5">
            <CashflowChart height={240} labels={days.map((d) => Number(d.date.slice(8, 10)))} expense={days.map((d) => d.expense)} />
          </Panel>
          <CategoryPanels data={data} />
        </div>
      )}
    </>
  )
}

function Yearly() {
  const [year, setYear] = useState(new Date().getFullYear())
  const report = useYearlyReport(year)
  const data = report.data
  const months = data?.monthly_breakdown || []

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-line bg-surface p-1">
        <button type="button" aria-label="Tahun sebelumnya" onClick={() => setYear((y) => y - 1)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink"><ChevronLeft className="size-4" /></button>
        <span className="min-w-[80px] text-center text-sm font-semibold">{year}</span>
        <button type="button" aria-label="Tahun berikutnya" onClick={() => setYear((y) => y + 1)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink"><ChevronRight className="size-4" /></button>
      </div>
        <div className="ml-auto">
          <DownloadMenu size="sm" start={`${year}-01-01`} end={`${year}-12-31`} />
        </div>
      </div>
      <ErrorNote error={report.error} onRetry={report.refetch} />
      {report.isLoading || !data ? (
        <div className="space-y-4"><Skeleton className="h-28" /><Skeleton className="h-72" /></div>
      ) : (
        <div className={cn('transition-opacity', report.isFetching && 'opacity-60')}>
          <Totals data={data} />
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
            <Panel title="Per bulan">
              <CashflowChart labels={months.map((m) => MONTHS_SHORT[m.month - 1])} income={months.map((m) => m.income)} expense={months.map((m) => m.expense)} />
            </Panel>
            <Panel title="Rincian" bodyClassName="p-0 sm:p-0">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="text-left text-[13px] text-muted">
                      <th className="px-6 py-2 font-semibold">Bulan</th>
                      <th className="px-3 py-2 text-right font-semibold">Masuk</th>
                      <th className="px-3 py-2 text-right font-semibold">Keluar</th>
                      <th className="px-6 py-2 text-right font-semibold">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {months.map((m) => (
                      <tr key={m.month}>
                        <td className="px-6 py-2.5 font-semibold">{MONTHS_SHORT[m.month - 1]}</td>
                        <td className="num px-3 py-2.5 text-right text-income">{m.income ? rupiah(m.income) : '–'}</td>
                        <td className="num px-3 py-2.5 text-right">{m.expense ? rupiah(m.expense) : '–'}</td>
                        <td className={cn('num px-6 py-2.5 text-right font-semibold', m.net < 0 && 'text-expense')}>{m.net ? rupiah(m.net, { sign: true }) : '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
          <CategoryPanels data={data} />
        </div>
      )}
    </>
  )
}

export default function ReportsPage() {
  const startDay = useProfile().data?.budget_start_day || 1
  const [tab, setTab] = useState('monthly')
  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Ke mana uangmu pergi, per bulan atau per tahun."
        actions={<Segmented value={tab} onChange={setTab} options={[{ value: 'monthly', label: 'Bulanan' }, { value: 'yearly', label: 'Tahunan' }]} />}
      />
      {tab === 'monthly' ? <Monthly key={startDay} startDay={startDay} /> : <Yearly />}
    </div>
  )
}
