import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { profileApi } from '../api/endpoints'
import { useCategories } from '../hooks/queries'
import { cn } from '../lib/cn'
import { rupiah } from '../lib/format'
import { Button, Modal, Skeleton } from './ui'
import { useFeedback } from './ui/feedback'

function CategoryRow({ category, budget, on, onToggle }) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        onClick={onToggle}
        className={cn('flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors', on ? 'border-violet bg-violet-soft' : 'border-line hover:bg-sunken')}
      >
        <span className={cn('grid size-5 shrink-0 place-items-center rounded-md border', on ? 'border-violet bg-violet text-white' : 'border-line bg-surface')}>
          {on && <Check className="size-3.5" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{category.name}</span>
        <span className={cn('shrink-0 text-xs', budget ? 'num text-muted' : 'text-faint')}>{budget ? rupiah(budget.amount) : 'belum ada anggaran'}</span>
      </button>
    </li>
  )
}

export default function DailyBudgetDialog({ selected, budgets, onClose }) {
  const { toast } = useFeedback()
  const qc = useQueryClient()
  const { data: categories = [], isLoading } = useCategories('expense')
  const budgetOf = new Map((budgets?.budgets || []).filter((b) => b.kind !== 'savings').map((b) => [b.category.id, b]))
  const budgetedIds = categories.filter((c) => budgetOf.has(c.id)).map((c) => c.id)

  // Kosong di server = semua anggaran: tampil sebagai semua kategori beranggaran tercentang.
  const [picked, setPicked] = useState(null)
  const current = picked ?? (selected.length ? selected : budgetedIds)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const withBudget = categories.filter((c) => budgetOf.has(c.id)).sort((a, b) => a.name.localeCompare(b.name))
  const withoutBudget = categories.filter((c) => !budgetOf.has(c.id)).sort((a, b) => a.name.localeCompare(b.name))
  const isAll = budgetedIds.length > 0 && budgetedIds.every((id) => current.includes(id)) && current.every((id) => budgetOf.has(id))

  const toggle = (id) => setPicked(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])

  const save = async () => {
    setError('')
    if (current.length === 0) return setError('Centang minimal satu kategori.')
    setBusy(true)
    try {
      const profile = await profileApi.updateDailyCategories(isAll ? [] : current)
      qc.setQueryData(['profile'], profile)
      toast('Jatah harian diperbarui')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Atur jatah harian"
      description="Centang anggaran yang dihitung di kartu Hari ini."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button onClick={save} loading={busy}>Simpan</Button>
        </>
      }
    >
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted">Belum ada kategori pengeluaran.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-sunken px-3.5 py-2.5 text-sm">
            <span className={cn(isAll ? 'font-semibold text-ink' : 'text-muted')}>
              {isAll
                ? 'Semua anggaran dihitung. Anggaran baru otomatis ikut.'
                : budgetedIds.length === 0 && current.length === 0
                  ? 'Belum ada anggaran periode ini, jatah dihitung dari saldo.'
                  : `${current.length} kategori dipilih`}
            </span>
            {!isAll && budgetedIds.length > 0 && (
              <button type="button" onClick={() => setPicked(budgetedIds)} className="shrink-0 font-semibold text-violet-ink hover:underline">
                Centang semua
              </button>
            )}
          </div>
          <div className="max-h-[50vh] space-y-4 overflow-y-auto">
            {withBudget.length > 0 && (
              <ul className="space-y-1.5">
                {withBudget.map((c) => <CategoryRow key={c.id} category={c} budget={budgetOf.get(c.id)} on={current.includes(c.id)} onToggle={() => toggle(c.id)} />)}
              </ul>
            )}
            {withoutBudget.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-faint">Belum ada anggaran</p>
                <ul className="space-y-1.5">
                  {withoutBudget.map((c) => <CategoryRow key={c.id} category={c} on={current.includes(c.id)} onToggle={() => toggle(c.id)} />)}
                </ul>
              </div>
            )}
          </div>
          {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
