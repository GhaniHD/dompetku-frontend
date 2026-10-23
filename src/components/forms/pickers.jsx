import { useState } from 'react'
import { Plus } from 'lucide-react'
import { categoryApi } from '../../api/endpoints'
import { useAction, useCategories, useWallets } from '../../hooks/queries'
import { rupiah } from '../../lib/format'
import { Button, Input, Select } from '../ui'

export function WalletSelect({ value, onChange, exclude, placeholder = 'Pilih dompet', ...props }) {
  const { data: wallets = [] } = useWallets()
  return (
    <Select value={value || ''} onChange={(e) => onChange(e.target.value)} {...props}>
      <option value="" disabled>
        {wallets.length ? placeholder : 'Belum ada dompet'}
      </option>
      {wallets
        .filter((w) => w.id !== exclude)
        .map((w) => (
          <option key={w.id} value={w.id}>
            {w.name} ({rupiah(w.balance)})
          </option>
        ))}
    </Select>
  )
}

export function CategorySelect({ type, value, onChange, ...props }) {
  const { data: categories = [] } = useCategories()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const create = useAction(categoryApi.create, {
    onSuccess: (created) => {
      onChange(created.id)
      setAdding(false)
      setName('')
    },
  })
  const options = categories.filter((c) => !type || c.type === type)

  if (adding) {
    return (
      <div className="flex gap-2">
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'income' ? 'Mis. Gaji' : 'Mis. Makan'} />
        <Button
          type="button"
          variant="soft"
          loading={create.isPending}
          disabled={!name.trim()}
          onClick={() => create.mutate({ name: name.trim(), type: type || 'expense' })}
        >
          Simpan
        </Button>
        <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
          Batal
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)} {...props}>
        <option value="" disabled>
          {options.length ? 'Pilih kategori' : 'Belum ada kategori'}
        </option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Button type="button" variant="outline" icon={Plus} onClick={() => setAdding(true)} aria-label="Kategori baru" className="px-3.5" />
    </div>
  )
}
