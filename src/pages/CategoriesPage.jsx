import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { categoryApi } from '../api/endpoints'
import { Button, ErrorNote, Input, PageHeader, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useCategories } from '../hooks/queries'

const SUGGEST = {
  expense: ['Makan & minum', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan'],
  income: ['Gaji', 'Bonus', 'Usaha sampingan', 'Hadiah'],
}

function Column({ type, title, items }) {
  const { toast, confirm } = useFeedback()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const create = useAction(categoryApi.create, { onSuccess: () => setName(''), onError: (e) => toast(e.message, 'error') })
  const update = useAction(({ id, name }) => categoryApi.update(id, { name }), { onSuccess: () => setEditing(null), onError: (e) => toast(e.message, 'error') })
  const remove = useAction(categoryApi.remove, { onSuccess: () => toast('Kategori dihapus'), onError: (e) => toast(e.message, 'error') })
  const existing = new Set(items.map((c) => c.name.toLowerCase()))
  const suggestions = SUGGEST[type].filter((s) => !existing.has(s.toLowerCase()))

  const askRemove = async (c) => {
    if (await confirm({ title: `Hapus kategori ${c.name}?`, message: 'Transaksi lama yang memakai kategori ini tetap tersimpan.', confirmLabel: 'Hapus kategori', danger: true })) remove.mutate(c.id)
  }

  return (
    <section className="panel flex flex-col">
      <header className="flex items-center justify-between px-6 pb-2 pt-5">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        <span className="text-sm text-muted">{items.length}</span>
      </header>
      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate({ name: name.trim(), type }) }}
        className="flex gap-2 px-6 py-3"
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kategori baru" aria-label={`Kategori ${title.toLowerCase()} baru`} />
        <Button type="submit" variant="soft" icon={Plus} loading={create.isPending} disabled={!name.trim()}>Tambah</Button>
      </form>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pb-3">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => create.mutate({ name: s, type })} className="rounded-full border border-dashed border-line px-3 py-1 text-[13px] font-medium text-muted hover:border-violet hover:text-violet-ink">
              + {s}
            </button>
          ))}
        </div>
      )}
      <ul className="divide-y divide-line border-t border-line">
        {items.map((c) => (
          <li key={c.id} className="group flex items-center gap-2 px-6 py-2.5">
            {editing?.id === c.id ? (
              <form onSubmit={(e) => { e.preventDefault(); update.mutate(editing) }} className="flex flex-1 gap-2">
                <Input autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="h-9" />
                <button type="submit" aria-label="Simpan" className="rounded-full p-2 text-income hover:bg-income-soft"><Check className="size-4" /></button>
                <button type="button" aria-label="Batal" onClick={() => setEditing(null)} className="rounded-full p-2 text-muted hover:bg-sunken"><X className="size-4" /></button>
              </form>
            ) : (
              <>
                <span className="flex-1 truncate font-medium">{c.name}</span>
                <button type="button" aria-label={`Ubah ${c.name}`} onClick={() => setEditing({ id: c.id, name: c.name })} className="rounded-full p-2 text-faint hover:bg-sunken hover:text-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"><Pencil className="size-4" /></button>
                <button type="button" aria-label={`Hapus ${c.name}`} onClick={() => askRemove(c)} className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"><Trash2 className="size-4" /></button>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="px-6 py-6 text-sm text-muted">Belum ada kategori. Pilih saran di atas atau ketik sendiri.</li>}
      </ul>
    </section>
  )
}

export default function CategoriesPage() {
  const cats = useCategories()
  const list = (cats.data || []).slice().sort((a, b) => a.name.localeCompare(b.name, 'id'))
  return (
    <div>
      <PageHeader title="Kategori" description="Kelompokkan transaksi supaya laporan dan anggaran lebih jelas." />
      <ErrorNote error={cats.error} onRetry={cats.refetch} />
      {cats.isLoading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <Column type="expense" title="Pengeluaran" items={list.filter((c) => c.type === 'expense')} />
          <Column type="income" title="Pemasukan" items={list.filter((c) => c.type === 'income')} />
        </div>
      )}
    </div>
  )
}
