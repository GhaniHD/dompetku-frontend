import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS } from '../lib/format'
import { shiftMonth } from '../lib/months'

export default function MonthNav({ value, onChange, label }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface p-1">
      <button type="button" aria-label="Bulan sebelumnya" onClick={() => onChange(shiftMonth(value, -1))} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink">
        <ChevronLeft className="size-4" />
      </button>
      <span className="min-w-[150px] px-2 text-center text-sm font-semibold">{label || `${MONTHS[value.month - 1]} ${value.year}`}</span>
      <button type="button" aria-label="Bulan berikutnya" onClick={() => onChange(shiftMonth(value, 1))} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink">
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
