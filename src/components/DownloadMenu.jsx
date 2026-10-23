import { useState } from 'react'
import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { exportApi } from '../api/endpoints'
import { dayEndISO, dayStartISO } from '../lib/format'
import Popover from './layout/Popover'
import { Button } from './ui'
import { useFeedback } from './ui/feedback'

export default function DownloadMenu({ start, end, size = 'md', className }) {
  const { toast } = useFeedback()
  const [busy, setBusy] = useState(false)
  const range = { start_date: dayStartISO(start), end_date: dayEndISO(end) }
  const suffix = `${start}_${end}`

  const run = async (fn, close) => {
    close()
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const items = [
    {
      icon: FileSpreadsheet,
      label: 'Laporan Excel lengkap',
      hint: 'Ringkasan, transaksi, mutasi dompet, kategori, harian, anggaran, hutang, target',
      fn: () => exportApi.report(start, end, `dompetku-laporan_${suffix}.xlsx`),
    },
    {
      icon: FileText,
      label: 'Transaksi saja (CSV)',
      hint: 'Data mentah untuk diimpor ke aplikasi lain',
      fn: () => exportApi.transactions(range, `dompetku-transaksi_${suffix}.csv`),
    },
    {
      icon: FileText,
      label: 'Pindahan saja (CSV)',
      hint: 'Pindahan antar dompet beserta biaya admin',
      fn: () => exportApi.transfers(range, `dompetku-pindahan_${suffix}.csv`),
    },
  ]

  return (
    <Popover
      className="w-[min(92vw,340px)] p-1.5"
      trigger={({ toggle }) => (
        <Button variant="outline" size={size} icon={Download} loading={busy} onClick={toggle} className={className} disabled={!start || !end}>
          Unduh <ChevronDown className="-mr-1 size-4 text-muted" />
        </Button>
      )}
    >
      {(close) => (
        <div>
          {items.map(({ icon: Icon, label, hint, fn }, i) => (
            <button
              key={label}
              type="button"
              onClick={() => run(fn, close)}
              className="flex w-full gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-sunken"
            >
              <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${i === 0 ? 'bg-income-soft text-income' : 'bg-sunken text-muted'}`}>
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
