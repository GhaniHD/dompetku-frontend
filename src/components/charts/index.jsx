import { useEffect, useState } from 'react'
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { rupiah, rupiahShort } from '../../lib/format'
import { SERIES } from '../../lib/palette'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler)


const readVar = (name) => `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()})`

function useTokens() {
  const read = () => ({
    ink: readVar('ink'),
    muted: readVar('muted'),
    line: readVar('line'),
    surface: readVar('surface'),
    violet: readVar('violet'),
    income: readVar('income'),
    expense: readVar('expense'),
  })
  const [tokens, setTokens] = useState(read)
  useEffect(() => {
    const obs = new MutationObserver(() => setTokens(read()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return tokens
}

const tooltip = (t) => ({
  backgroundColor: t.ink,
  titleColor: t.surface,
  bodyColor: t.surface,
  padding: 10,
  cornerRadius: 10,
  displayColors: true,
  boxPadding: 4,
  titleFont: { family: "'Plus Jakarta Sans Variable', sans-serif", weight: '600' },
  bodyFont: { family: "'Plus Jakarta Sans Variable', sans-serif" },
})

export function CashflowChart({ labels, income, expense, height = 260 }) {
  const t = useTokens()
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: [
            income && { label: 'Pemasukan', data: income, backgroundColor: t.income, borderRadius: 6, borderSkipped: false, barPercentage: 0.7, categoryPercentage: 0.6 },
            { label: 'Pengeluaran', data: expense, backgroundColor: t.violet, borderRadius: 6, borderSkipped: false, barPercentage: income ? 0.7 : 0.8, categoryPercentage: income ? 0.6 : 0.9 },
          ].filter(Boolean),
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltip(t), callbacks: { label: (c) => ` ${c.dataset.label}: ${rupiah(c.raw)}` } },
          },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: t.muted, font: { family: "'Plus Jakarta Sans Variable', sans-serif", size: 12 } } },
            y: {
              grid: { color: t.line },
              border: { display: false },
              ticks: { color: t.muted, maxTicksLimit: 5, font: { family: "'Plus Jakarta Sans Variable', sans-serif", size: 11 }, callback: (v) => rupiahShort(v) },
            },
          },
        }}
      />
    </div>
  )
}

export function TrendChart({ labels, series, height = 280 }) {
  const t = useTokens()
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.data,
            borderColor: t[s.tone] || s.tone,
            backgroundColor: t[s.tone] || s.tone,
            borderWidth: 2.5,
            borderDash: s.dashed ? [6, 5] : [],
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.35,
            spanGaps: true,
          })),
        }}
        options={{
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { ...tooltip(t), callbacks: { label: (c) => (c.raw == null ? null : ` ${c.dataset.label}: ${rupiah(c.raw)}`) } },
          },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: t.muted, font: { family: "'Plus Jakarta Sans Variable', sans-serif", size: 12 } } },
            y: { grid: { color: t.line }, border: { display: false }, ticks: { color: t.muted, maxTicksLimit: 5, callback: (v) => rupiahShort(v) } },
          },
        }}
      />
    </div>
  )
}

export function DonutChart({ items, total, label = 'Total', size = 200 }) {
  const t = useTokens()
  const data = items.length ? items.map((i) => i.total) : [1]
  const colors = items.length ? items.map((_, i) => SERIES[i % SERIES.length]) : [t.line]
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <Doughnut
        data={{ labels: items.map((i) => i.name), datasets: [{ data, backgroundColor: colors, borderColor: t.surface, borderWidth: 3, hoverOffset: 4 }] }}
        options={{
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: items.length ? { ...tooltip(t), callbacks: { label: (c) => ` ${rupiah(c.raw)}` } } : { enabled: false },
          },
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs text-muted">{label}</span>
        <span className="num text-lg font-semibold">{rupiahShort(total)}</span>
      </div>
    </div>
  )
}

export function Legend2({ items, total }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-3 text-sm">
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
          <span className="min-w-0 flex-1 truncate">{item.name}</span>
          <span className="num font-semibold">{rupiah(item.total)}</span>
          <span className="w-11 text-right text-xs text-muted">{total ? Math.round((item.total / total) * 100) : 0}%</span>
        </li>
      ))}
    </ul>
  )
}
