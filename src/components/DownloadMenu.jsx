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
      label: 'Laporan Excel lengkap',
      hint: 'Ringkasan, transaksi, mutasi dompet, kategori, harian, anggaran, hutang, target',
      fn: () => exportApi.report(start, end, `myfulus-laporan_${suffix}.xlsx`),
      primary: true,
    },
    {
      label: 'Transaksi saja (Excel)',
      hint: 'Satu tabel rapi dengan filter dan total yang ikut filter',
      fn: () => exportApi.transactionsXlsx(start, end, `myfulus-transaksi_${suffix}.xlsx`),
    },
    {
      label: 'Pindahan saja (Excel)',
      hint: 'Pindahan antar dompet beserta biaya admin',
      fn: () => exportApi.transfersXlsx(start, end, `myfulus-pindahan_${suffix}.xlsx`),
    },
  ]

  const raw = [
    { label: 'Transaksi', fn: () => exportApi.transactions(range, `myfulus-transaksi_${suffix}.csv`) },
    { label: 'Pindahan', fn: () => exportApi.transfers(range, `myfulus-pindahan_${suffix}.csv`) },
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
          {items.map(({ label, hint, fn, primary }) => (
            <button
              key={label}
              type="button"
              onClick={() => run(fn, close)}
              className="flex w-full gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-sunken"
            >
              <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${primary ? 'bg-income-soft text-income' : 'bg-sunken text-muted'}`}>
                <FileSpreadsheet className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted">{hint}</span>
              </span>
            </button>
          ))}
          <div className="mx-3 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pb-1.5 pt-2.5 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5" /> CSV mentah:
            </span>
            {raw.map(({ label, fn }) => (
              <button key={label} type="button" onClick={() => run(fn, close)} className="font-semibold text-violet-ink hover:underline">
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Popover>
  )
}
