import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Archive, ArchiveRestore, ArrowLeftRight, MoreVertical, Pencil, Plus, Scale, Trash2, Wallet } from 'lucide-react'
import { walletApi } from '../api/endpoints'
import Popover from '../components/layout/Popover'
import { useQuick } from '../components/layout/QuickActions'
import { AdjustForm, WalletForm } from '../components/forms/WalletForms'
import { WalletGlyph } from '../components/finance'
import { Badge, Button, Empty, ErrorNote, PageHeader, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useWallets } from '../hooks/queries'
import { cn } from '../lib/cn'
import { rupiah } from '../lib/format'
import { walletType } from '../lib/walletTypes'

function WalletMenu({ wallet, onEdit, onAdjust, onRemove, onRestore }) {
  const item = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-sunken'
  return (
    <Popover
      className="w-56 p-1.5"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggle() }}
          aria-label={`Menu ${wallet.name}`}
          className={cn('rounded-full p-2', wallet.type === 'credit_card' && !wallet.is_archived ? 'text-white/70 hover:bg-white/10' : 'text-faint hover:bg-sunken hover:text-ink')}
        >
          <MoreVertical className="size-4" />
        </button>
      )}
    >
      {(close) => (
        <div onClick={(e) => e.preventDefault()}>
          {wallet.is_archived ? (
            <button type="button" className={item} onClick={() => { close(); onRestore() }}>
              <ArchiveRestore className="size-4 text-muted" /> Aktifkan lagi
            </button>
          ) : (
            <>
              <button type="button" className={item} onClick={() => { close(); onEdit() }}><Pencil className="size-4 text-muted" /> Ubah nama & jenis</button>
              <button type="button" className={item} onClick={() => { close(); onAdjust() }}><Scale className="size-4 text-muted" /> Sesuaikan saldo</button>
            </>
          )}
          <button type="button" className={cn(item, 'text-expense hover:bg-expense-soft')} onClick={() => { close(); onRemove() }}>
            {wallet.is_archived ? <Trash2 className="size-4" /> : <Archive className="size-4" />} {wallet.is_archived ? 'Hapus' : 'Arsipkan atau hapus'}
          </button>
        </div>
      )}
    </Popover>
  )
}

function WalletCard({ wallet, ...actions }) {
  const dark = wallet.type === 'credit_card' && !wallet.is_archived
  return (
    <Link
      to={`/dompet/${wallet.id}`}
      className={cn(
        'flex min-h-[176px] flex-col justify-between rounded-[22px] border p-5 transition-colors',
        dark ? 'border-transparent bg-[#1D1931] text-white hover:bg-[#2A2445]' : 'border-line bg-surface hover:border-violet/40',
        wallet.is_archived && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <WalletGlyph type={wallet.type} className={dark ? 'bg-white/10 text-white' : ''} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{wallet.name}</p>
            <p className={cn('text-[13px]', dark ? 'text-white/60' : 'text-muted')}>{walletType(wallet.type).label}</p>
          </div>
        </div>
        <WalletMenu wallet={wallet} {...actions} />
      </div>
      <div>
        {wallet.is_archived && <Badge className="mb-2">Diarsipkan</Badge>}
        <p className={cn('text-[13px]', dark ? 'text-white/60' : 'text-muted')}>{wallet.type === 'credit_card' ? 'Tagihan berjalan' : 'Saldo'}</p>
        <p className={cn('num text-[26px] font-semibold leading-tight', !dark && wallet.balance < 0 && 'text-expense')}>{rupiah(wallet.balance)}</p>
      </div>
    </Link>
  )
}

export default function WalletsPage() {
  const quick = useQuick()
  const { toast, confirm } = useFeedback()
  const [params, setParams] = useSearchParams()
  const [showArchived, setShowArchived] = useState(false)
  const [editing, setEditing] = useState(null)
  const [adjusting, setAdjusting] = useState(null)
  const creating = params.get('baru') === '1'
  const wallets = useWallets(showArchived)

  const remove = useAction(walletApi.remove, {
    onSuccess: (res) => toast(res?.archived ? 'Dompet diarsipkan karena punya riwayat' : 'Dompet dihapus'),
    onError: (e) => toast(e.message, 'error'),
  })
  const restore = useAction((id) => walletApi.update(id, { is_archived: false }), { onSuccess: () => toast('Dompet aktif lagi') })

  const askRemove = async (w) => {
    const ok = await confirm({
      title: `Hapus ${w.name}?`,
      message:
        w.balance !== 0
          ? `Saldo masih ${rupiah(w.balance)}. Pindahkan atau sesuaikan saldonya ke 0 dulu sebelum menghapus.`
          : 'Kalau dompet ini punya riwayat transaksi, dompet akan diarsipkan agar riwayatnya tetap ada. Kalau belum pernah dipakai, dompet dihapus.',
      confirmLabel: 'Lanjutkan',
      danger: true,
    })
    if (ok) remove.mutate(w.id)
  }

  const list = wallets.data || []
  const active = list.filter((w) => !w.is_archived)
  const assets = active.filter((w) => w.balance > 0).reduce((s, w) => s + w.balance, 0)
  const debt = active.filter((w) => w.balance < 0).reduce((s, w) => s + w.balance, 0)

  return (
    <div>
      <PageHeader
        title="Dompet"
        description="Rekening, tunai, dompet digital, dan kartu kredit."
        actions={
          <>
            <Button variant="outline" icon={ArrowLeftRight} onClick={() => quick.openTransfer()}>Pindahkan uang</Button>
            <Button icon={Plus} onClick={() => setParams({ baru: '1' })}>Tambah dompet</Button>
          </>
        }
      />

      <section className="panel mb-5 grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          ['Total aset', assets, ''],
          ['Tagihan kartu kredit', debt, debt < 0 ? 'text-expense' : ''],
          ['Kekayaan bersih', assets + debt, ''],
        ].map(([label, value, tone]) => (
          <div key={label} className="px-6 py-5">
            <p className="text-[13px] text-muted">{label}</p>
            {wallets.isLoading ? <Skeleton className="mt-2 h-8 w-40" /> : <p className={cn('num mt-1 text-[26px] font-semibold', tone)}>{rupiah(value)}</p>}
          </div>
        ))}
      </section>

      <ErrorNote error={wallets.error} onRetry={wallets.refetch} />

      {wallets.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[176px] rounded-[22px]" />)}</div>
      ) : list.length === 0 ? (
        <section className="panel">
          <Empty icon={Wallet} title="Belum ada dompet" action={<Button icon={Plus} onClick={() => setParams({ baru: '1' })}>Tambah dompet</Button>}>
            Buat satu dompet untuk setiap tempat kamu menyimpan uang.
          </Empty>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              onEdit={() => setEditing(w)}
              onAdjust={() => setAdjusting(w)}
              onRemove={() => askRemove(w)}
              onRestore={() => restore.mutate(w.id)}
            />
          ))}
        </div>
      )}

      <label className="mt-6 inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted">
        <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="size-4 accent-[rgb(var(--violet))]" />
        Tampilkan dompet yang diarsipkan
      </label>

      <WalletForm open={creating || !!editing} wallet={editing} onClose={() => { setEditing(null); if (creating) setParams({}) }} />
      <AdjustForm open={!!adjusting} wallet={adjusting} onClose={() => setAdjusting(null)} />
    </div>
  )
}
