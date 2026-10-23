import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowLeft, ArrowLeftRight, ArrowUpRight, HandCoins, Pencil, Plus, Scale } from 'lucide-react'
import { useQuick } from '../components/layout/QuickActions'
import { AdjustForm, WalletForm } from '../components/forms/WalletForms'
import { WalletGlyph } from '../components/finance'
import { Badge, Button, Empty, ErrorNote, Skeleton } from '../components/ui'
import { useWalletHistory } from '../hooks/queries'
import { cn } from '../lib/cn'
import { dateLabel, rupiah } from '../lib/format'
import { walletType } from '../lib/walletTypes'

const KIND = {
  income: { label: 'Pemasukan', icon: ArrowDownLeft },
  expense: { label: 'Pengeluaran', icon: ArrowUpRight },
  transfer_in: { label: 'Pindahan masuk', icon: ArrowLeftRight },
  transfer_out: { label: 'Pindahan keluar', icon: ArrowLeftRight },
  adjustment: { label: 'Penyesuaian saldo', icon: Scale },
  debt_payable: { label: 'Hutang', icon: HandCoins },
  debt_receivable: { label: 'Piutang', icon: HandCoins },
}

const LIMIT = 30

export default function WalletDetailPage() {
  const { id } = useParams()
  const quick = useQuick()
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(false)
  const [adjusting, setAdjusting] = useState(false)
  const history = useWalletHistory(id, { page, limit: LIMIT })
  const data = history.data
  const wallet = data?.wallet
  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1

  if (history.isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (history.error) {
    return (
      <div className="pt-4">
        <Link to="/dompet" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" /> Dompet</Link>
        <ErrorNote error={history.error} onRetry={history.refetch} />
      </div>
    )
  }

  const describe = (e) => {
    if (e.kind === 'transfer_in') return `Dari ${e.counterpart}`
    if (e.kind === 'transfer_out') return `Ke ${e.counterpart}`
    if (e.kind.startsWith('debt')) return e.counterpart
    return e.category_name || KIND[e.kind]?.label
  }

  return (
    <div>
      <Link to="/dompet" className="mb-4 mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Semua dompet
      </Link>

      <section className="panel mb-5 p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <WalletGlyph type={wallet.type} className="size-14 rounded-[18px]" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[26px] font-semibold leading-tight">{wallet.name}</h1>
                {wallet.is_archived && <Badge>Diarsipkan</Badge>}
              </div>
              <p className="text-muted">{walletType(wallet.type).label}</p>
              <p className={cn('num mt-4 text-[38px] font-semibold leading-none', wallet.balance < 0 && 'text-expense')}>{rupiah(wallet.balance)}</p>
              <p className="mt-2 text-sm text-muted">Saldo awal {rupiah(data.opening_balance)}</p>
            </div>
          </div>
          {!wallet.is_archived && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" icon={Pencil} onClick={() => setEditing(true)}>Ubah</Button>
              <Button variant="outline" icon={Scale} onClick={() => setAdjusting(true)}>Sesuaikan saldo</Button>
              <Button variant="outline" icon={ArrowLeftRight} onClick={() => quick.openTransfer({ from: wallet.id })}>Pindahkan</Button>
              <Button icon={Plus} onClick={() => quick.openTransaction({ wallet_id: wallet.id })}>Catat transaksi</Button>
            </div>
          )}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-[17px] font-semibold">Riwayat saldo</h2>
          <span className="text-sm text-muted">{data.total} catatan</span>
        </header>
        {data.entries.length === 0 ? (
          <Empty icon={ArrowLeftRight} title="Belum ada riwayat">Transaksi, pindahan, dan penyesuaian di dompet ini akan tercatat di sini.</Empty>
        ) : (
          <div className={cn('overflow-x-auto transition-opacity', history.isFetching && 'opacity-60')}>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-[13px] text-muted">
                  <th className="px-6 py-3 font-semibold">Tanggal</th>
                  <th className="px-3 py-3 font-semibold">Keterangan</th>
                  <th className="px-3 py-3 text-right font-semibold">Jumlah</th>
                  <th className="px-6 py-3 text-right font-semibold">Saldo setelahnya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.entries.map((e) => {
                  const kind = KIND[e.kind] || KIND.adjustment
                  return (
                    <tr key={`${e.source}-${e.id}`} className="hover:bg-sunken/60">
                      <td className="whitespace-nowrap px-6 py-3.5 text-muted">{dateLabel(e.date)}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', e.amount > 0 ? 'bg-income-soft text-income' : 'bg-sunken text-muted')}>
                            <kind.icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{e.note || describe(e)}</p>
                            <p className="truncate text-[13px] text-muted">{e.note ? `${kind.label}, ${describe(e)}` : kind.label}</p>
                          </div>
                        </div>
                      </td>
                      <td className={cn('num whitespace-nowrap px-3 py-3.5 text-right font-semibold', e.amount > 0 && 'text-income')}>{rupiah(e.amount, { sign: true })}</td>
                      <td className="num whitespace-nowrap px-6 py-3.5 text-right text-muted">{rupiah(e.balance_after)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <footer className="flex items-center justify-between border-t border-line px-6 py-3 text-sm">
            <span className="text-muted">Halaman {page} dari {pages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Lebih baru</Button>
              <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Lebih lama</Button>
            </div>
          </footer>
        )}
      </section>

      <WalletForm open={editing} wallet={wallet} onClose={() => setEditing(false)} />
      <AdjustForm open={adjusting} wallet={wallet} onClose={() => setAdjusting(false)} />
    </div>
  )
}
