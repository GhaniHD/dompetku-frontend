import { useState } from 'react'
import { ChevronLeft, ChevronRight, Lightbulb, Sparkles, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { DonutChart, Legend2, TrendChart } from '../components/charts'
import { Badge, Empty, ErrorNote, PageHeader, Panel, Skeleton } from '../components/ui'
import { useAnalysis } from '../hooks/queries'
import { cn } from '../lib/cn'
import { rupiah } from '../lib/format'

const RISK = {
  aman: { label: 'Kondisi aman', tone: 'income' },
  perhatian: { label: 'Perlu perhatian', tone: 'caution' },
  kritis: { label: 'Kritis', tone: 'expense' },
}

const CONFIDENCE = { high: 'tinggi', medium: 'sedang', low: 'rendah' }

export default function AnalysisPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const analysis = useAnalysis(year)
  const data = analysis.data
  const insight = data?.insight
  const risk = RISK[insight?.risk_level]

  const trend = data?.monthly_trend || []
  const prediction = data?.prediction || []
  const labels = [...trend.map((t) => t.label), ...prediction.map((p) => p.label)]
  const pad = (arr, before, after) => [...Array(before).fill(null), ...arr, ...Array(after).fill(null)]
  const lastNet = trend.length ? trend[trend.length - 1] : null

  const series = [
    { label: 'Pemasukan', tone: 'income', data: pad(trend.map((t) => t.income), 0, prediction.length) },
    { label: 'Pengeluaran', tone: 'violet', data: pad(trend.map((t) => t.expense), 0, prediction.length) },
    {
      label: 'Prediksi pengeluaran',
      tone: 'violet',
      dashed: true,
      data: prediction.length ? pad([lastNet?.expense ?? null, ...prediction.map((p) => p.predicted_expense)], trend.length - 1, 0) : [],
    },
    {
      label: 'Prediksi pemasukan',
      tone: 'income',
      dashed: true,
      data: prediction.length ? pad([lastNet?.income ?? null, ...prediction.map((p) => p.predicted_income)], trend.length - 1, 0) : [],
    },
  ]

  const expenseItems = (data?.expense_by_category || []).map((c) => ({ name: c.category_name, total: c.total }))
  const empty = data && data.total_income === 0 && data.total_expense === 0

  return (
    <div>
      <PageHeader
        title="Analisis AI"
        description="Ringkasan 6 bulan terakhir, pola pengeluaran, dan perkiraan 3 bulan ke depan."
        actions={
          <div className="inline-flex items-center rounded-full border border-line bg-surface p-1">
            <button type="button" aria-label="Tahun sebelumnya" onClick={() => setYear((y) => y - 1)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink"><ChevronLeft className="size-4" /></button>
            <span className="min-w-[80px] text-center text-sm font-semibold">{year}</span>
            <button type="button" aria-label="Tahun berikutnya" disabled={year >= new Date().getFullYear()} onClick={() => setYear((y) => y + 1)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink disabled:opacity-30"><ChevronRight className="size-4" /></button>
          </div>
        }
      />

      <ErrorNote error={analysis.error} onRetry={analysis.refetch} />

      {analysis.isLoading ? (
        <div className="space-y-5">
          <section className="panel flex items-center gap-4 p-6">
            <Sparkles className="size-6 animate-pulse text-violet" />
            <div>
              <p className="font-semibold">Menyusun analisis</p>
              <p className="text-sm text-muted">Biasanya selesai dalam 10–20 detik.</p>
            </div>
          </section>
          <Skeleton className="h-72" />
        </div>
      ) : !data ? null : empty ? (
        <section className="panel">
          <Empty icon={Sparkles} title="Belum ada data untuk dianalisis">Catat transaksi selama beberapa minggu, lalu kembali ke sini.</Empty>
        </section>
      ) : (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-[26px] bg-violet p-6 text-white sm:p-7">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5" />
                <span className="text-sm font-semibold text-white/80">Ringkasan</span>
                {risk && <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{risk.label}</span>}
              </div>
              <p className="mt-4 text-lg leading-relaxed">{insight.summary}</p>
              {insight.highlights?.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-white/15 pt-5 text-[15px] text-white/85">
                  {insight.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/70" />{h}</li>
                  ))}
                </ul>
              )}
            </div>
            <section className="panel grid grid-cols-2">
              {[
                ['Pemasukan', data.total_income, 'text-income'],
                ['Pengeluaran', data.total_expense, ''],
                ['Sisa', data.net_balance, data.net_balance < 0 ? 'text-expense' : ''],
                ['Rasio tabungan', null, data.savings_rate < 0 ? 'text-expense' : ''],
              ].map(([label, value, tone], i) => (
                <div key={label} className={cn('p-5 sm:p-6', i % 2 === 0 && 'border-r border-line', i < 2 && 'border-b border-line')}>
                  <p className="text-[13px] text-muted">{label}</p>
                  <p className={cn('num mt-2 text-[22px] font-semibold', tone)}>{value == null ? `${Math.round(data.savings_rate)}%` : rupiah(value)}</p>
                </div>
              ))}
            </section>
          </section>

          <Panel
            title="Tren dan prediksi"
            action={
              <div className="hidden flex-wrap items-center gap-4 text-[13px] text-muted sm:flex">
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-income" />Masuk</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-violet" />Keluar</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-muted" />Prediksi</span>
              </div>
            }
          >
            <TrendChart labels={labels} series={series} />
            {prediction.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {prediction.map((p) => (
                  <div key={p.label} className="rounded-2xl bg-sunken px-4 py-3">
                    <p className="text-[13px] font-semibold">{p.label}</p>
                    <p className={cn('num text-lg font-semibold', p.predicted_net < 0 && 'text-expense')}>{rupiah(p.predicted_net, { sign: true })}</p>
                    <p className="text-xs text-muted">Keyakinan {CONFIDENCE[p.confidence] || p.confidence}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Saran">
              {insight.recommendations?.length ? (
                <ol className="space-y-3">
                  {insight.recommendations.map((r) => (
                    <li key={r} className="flex gap-3 text-[15px]">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-soft text-violet-ink"><Lightbulb className="size-4" /></span>
                      <span className="pt-1">{r}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted">Belum ada saran.</p>
              )}
            </Panel>
            <Panel title="Pola pengeluaran">
              {insight.spending_patterns?.length ? (
                <ul className="divide-y divide-line">
                  {insight.spending_patterns.map((p) => {
                    const Icon = p.trend === 'naik' ? TrendingUp : p.trend === 'turun' ? TrendingDown : Minus
                    return (
                      <li key={p.category} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{p.category}</span>
                          <span className="block text-[13px] text-muted">Rata-rata {rupiah(p.avg_monthly)} per bulan</span>
                        </span>
                        <Badge tone={p.trend === 'naik' ? 'expense' : p.trend === 'turun' ? 'income' : 'neutral'}>
                          <Icon className="size-3.5" />
                          {p.trend === 'stabil' ? 'Stabil' : `${Math.abs(Math.round(p.trend_pct))}%`}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)]">
                  <DonutChart items={expenseItems} total={data.total_expense} size={180} label="Keluar" />
                  <Legend2 items={expenseItems} total={data.total_expense} />
                </div>
              )}
            </Panel>
          </div>
          <p className="text-center text-xs text-faint">Analisis dibuat oleh AI dari data transaksimu dan bisa keliru. Gunakan sebagai bahan pertimbangan.</p>
        </div>
      )}
    </div>
  )
}
