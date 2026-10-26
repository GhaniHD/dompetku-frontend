import { useState } from 'react'
import { Briefcase, Shuffle } from 'lucide-react'
import { profileApi } from '../../api/endpoints'
import { useAction } from '../../hooks/queries'
import { periodOf } from '../../lib/cycle'
import { cn } from '../../lib/cn'
import { dateLabel } from '../../lib/format'
import { Button } from '../ui'
import { useFeedback } from '../ui/feedback'

const CHOICES = [
  { value: 'salary', icon: Briefcase, title: 'Gaji tetap tiap bulan', hint: 'Periode dihitung dari tanggal gajian sampai sehari sebelum gajian berikutnya.' },
  { value: 'irregular', icon: Shuffle, title: 'Tidak tetap atau belum bekerja', hint: 'Freelance, usaha, uang saku, atau belum ada pemasukan. Periode memakai bulan kalender.' },
]

export default function IncomeForm({ profile, submitLabel = 'Simpan', onDone }) {
  const { toast } = useFeedback()
  const [type, setType] = useState(profile.income_setup_done ? profile.income_type : '')
  const [day, setDay] = useState(profile.income_type === 'salary' ? profile.budget_start_day || 25 : 25)
  const save = useAction(profileApi.updateIncome, {
    onSuccess: () => {
      toast('Pengaturan pemasukan disimpan')
      onDone?.()
    },
    onError: (e) => toast(e.message, 'error'),
  })
  const p = periodOf(type === 'irregular' ? 1 : day)
  const unchanged = profile.income_setup_done && type === profile.income_type && (type === 'irregular' || day === profile.budget_start_day)

  return (
    <div>
      <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Jenis pemasukan">
        {CHOICES.map(({ value, icon: Icon, title, hint }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={type === value}
            onClick={() => setType(value)}
            className={cn(
              'flex gap-3 rounded-2xl border p-4 text-left transition-colors',
              type === value ? 'border-violet bg-violet-soft' : 'border-line hover:border-violet/40'
            )}
          >
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', type === value ? 'bg-violet text-white' : 'bg-sunken text-muted')}>
              <Icon className="size-[18px]" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">{title}</span>
              <span className="block text-[13px] text-muted">{hint}</span>
            </span>
          </button>
        ))}
      </div>

      {type === 'salary' && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Tanggal gajian</p>
          <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-[repeat(16,minmax(0,1fr))]" role="radiogroup" aria-label="Tanggal gajian">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={d === day}
                onClick={() => setDay(d)}
                className={cn('num aspect-square rounded-xl text-sm font-semibold transition-colors', d === day ? 'bg-violet text-white' : 'bg-sunken text-muted hover:bg-violet-soft hover:text-violet-ink')}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {type && (
        <p className="mt-4 rounded-2xl bg-sunken px-4 py-3 text-sm">
          Periode berjalan: <span className="font-semibold">{dateLabel(p.start)}</span> sampai <span className="font-semibold">{dateLabel(p.end)}</span>
          {type === 'salary' && day > 28 && <span className="block text-muted">Di bulan yang lebih pendek, periode dimulai di hari terakhir bulan itu.</span>}
          {type === 'irregular' && <span className="block text-muted">Jatah harian dihitung dari saldo dibagi sisa hari bulan ini.</span>}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <Button disabled={!type || unchanged} loading={save.isPending} onClick={() => save.mutate({ income_type: type, ...(type === 'salary' && { start_day: day }) })}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
