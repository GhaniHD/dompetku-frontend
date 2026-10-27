import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { profileApi } from '../api/endpoints'
import { useCategories } from '../hooks/queries'
import { cn } from '../lib/cn'
import { rupiah } from '../lib/format'
import { Button, Modal, Segmented, Skeleton } from './ui'
import { useFeedback } from './ui/feedback'

export default function DailyBudgetDialog({ selected, budgets, onClose }) {
  const { toast } = useFeedback()
  const qc = useQueryClient()
  const { data: categories = [], isLoading } = useCategories('expense')
  const [mode, setMode] = useState(selected.length ? 'pick' : 'all')
  const [picked, setPicked] = useState(selected)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const budgetOf = new Map((budgets?.budgets || []).filter((b) => b.kind !== 'savings').map((b) => [b.category.id, b]))
  const sorted = [...categories].sort((a, b) => Number(budgetOf.has(b.id)) - Number(budgetOf.has(a.id)) || a.name.localeCompare(b.name))
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const save = async () => {
    setError('')
    const ids = mode === 'all' ? [] : picked
    if (mode === 'pick' && ids.length === 0) return setError('Centang minimal satu kategori, atau pilih Semua anggaran.')
    setBusy(true)
    try {
      const profile = await profileApi.updateDailyCategories(ids)
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
      description="Pilih anggaran yang dihitung di kartu Hari ini."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button onClick={save} loading={busy}>Simpan</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Segmented
          className="w-full"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'all', label: 'Semua anggaran' },
            { value: 'pick', label: 'Pilih kategori' },
          ]}
        />
        {mode === 'all' ? (
          <p className="text-sm text-muted">Jatah harian dihitung dari sisa semua anggaran pengeluaran.</p>
        ) : isLoading ? (
          <Skeleton className="h-40" />
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted">Belum ada kategori pengeluaran.</p>
        ) : (
          <ul className="max-h-[50vh] space-y-1.5 overflow-y-auto">
            {sorted.map((c) => {
              const on = picked.includes(c.id)
              const budget = budgetOf.get(c.id)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(c.id)}
                    className={cn('flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors', on ? 'border-violet bg-violet-soft' : 'border-line hover:bg-sunken')}
                  >
                    <span className={cn('grid size-5 shrink-0 place-items-center rounded-md border', on ? 'border-violet bg-violet text-white' : 'border-line bg-surface')}>
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.name}</span>
                    <span className={cn('shrink-0 text-xs', budget ? 'num text-muted' : 'text-faint')}>{budget ? rupiah(budget.amount) : 'belum ada anggaran'}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {error && <p className="rounded-xl bg-expense-soft px-3.5 py-2.5 text-sm text-expense">{error}</p>}
      </div>
    </Modal>
  )
}
