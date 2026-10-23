import { useMemo, useState } from 'react'
import { ArrowLeftRight, ArrowRight, Download, Plus, Receipt, Search, Trash2 } from 'lucide-react'
import { exportApi, transferApi } from '../api/endpoints'
import { useQuick } from '../components/layout/QuickActions'
import MonthNav from '../components/MonthNav'
import { TransactionRow } from '../components/finance'
import { Button, Empty, ErrorNote, Input, Money, PageHeader, Segmented, Select, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useCategories, useProfile, useTransactions, useTransfers, useWallets } from '../hooks/queries'
import { periodFor, periodOf } from '../lib/cycle'
import { cn } from '../lib/cn'
import { dateLabel, dayEndISO, dayStartISO, rupiah } from '../lib/format'

const PAGE = 40

function groupByDay(items, key) {
  const map = new Map()
  for (const it of items) {
    const day = String(it[key]).slice(0, 10)
    const local = new Date(it[key])
    const label = isNaN(local) ? day : local.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    const k = isNaN(local) ? day : local.toDateString()
    if (!map.has(k)) map.set(k, { label, items: [] })
    map.get(k).items.push(it)
  }
  return [...map.values()]
}

function TransfersList({ params }) {
  const { data = [], isLoading, error, refetch } = useTransfers(params)
  const { toast, confirm } = useFeedback()
  const quick = useQuick()
  const remove = useAction(transferApi.remove, { onSuccess: () => toast('Transfer dibatalkan'), onError: (e) => toast(e.message, 'error') })

  const askRemove = async (t) => {
    const ok = await confirm({
      title: 'Batalkan transfer ini?',
      message: `${rupiah(t.amount)} akan dikembalikan ke ${t.from_wallet.name}${t.fee ? ', termasuk biaya admin ' + rupiah(t.fee) : ''}.`,
      confirmLabel: 'Batalkan transfer',
      danger: true,
    })
    if (ok) remove.mutate(t.id)
  }

  if (isLoading) return <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
  if (error) return <div className="p-6"><ErrorNote error={error} onRetry={refetch} /></div>
  if (!data.length)
    return (
      <Empty icon={ArrowLeftRight} title="Belum ada pindahan uang" action={<Button size="sm" icon={ArrowLeftRight} onClick={() => quick.openTransfer()}>Pindahkan uang</Button>}>
        Misalnya tarik tunai dari rekening, atau isi saldo dompet digital.
      </Empty>
    )

  return (
    <div className="py-2">
      {groupByDay(data, 'date').map((g) => (
        <div key={g.label} className="px-3 py-2 sm:px-4">
          <p className="px-2 pb-1 text-[13px] font-semibold text-muted">{g.label}</p>
          {g.items.map((t) => (
            <div key={t.id} className="group flex items-center gap-3.5 rounded-2xl px-2 py-2.5 hover:bg-sunken">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-soft text-violet-ink">
                <ArrowLeftRight className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 truncate font-semibold">
                  {t.from_wallet.name} <ArrowRight className="size-3.5 shrink-0 text-faint" /> {t.to_wallet.name}
                </span>
                <span className="block truncate text-[13px] text-muted">{t.note || 'Tanpa catatan'}{t.fee ? `, biaya admin ${rupiah(t.fee)}` : ''}</span>
              </span>
              <Money value={t.amount} className="font-semibold" />
              <button type="button" onClick={() => askRemove(t)} aria-label="Batalkan transfer" className="rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function TransactionsPage() {
  const quick = useQuick()
  const { toast } = useFeedback()
  const startDay = useProfile().data?.budget_start_day || 1
  const [tab, setTab] = useState('tx')
  const [picked, setMonth] = useState(null)
  const current = periodOf(startDay)
  const month = picked || { month: current.month, year: current.year }
  const [type, setType] = useState('')
  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [exporting, setExporting] = useState(false)

  const period = periodFor(startDay, month.year, month.month)
  const range = { start_date: dayStartISO(period.startYmd), end_date: dayEndISO(period.endYmd) }
  const params = { ...range, type: type || undefined, wallet_id: walletId || undefined, category_id: categoryId || undefined }

  const { data: wallets = [] } = useWallets()
  const { data: categories = [] } = useCategories()
  const txs = useTransactions(params)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = txs.data || []
    if (!term) return list
    return list.filter((t) => [t.note, t.category_name, t.wallet_name].some((v) => v?.toLowerCase().includes(term)))
  }, [txs.data, q])

  const totals = filtered.reduce((acc, t) => ((acc[t.type] += t.amount), acc), { income: 0, expense: 0 })
  const navLabel =
    startDay === 1 ? undefined : `${dateLabel(period.start, { day: 'numeric', month: 'short' })} – ${dateLabel(period.end, { day: 'numeric', month: 'short', year: 'numeric' })}`

  const doExport = async () => {
    setExporting(true)
    try {
      const name = `dompetku-${tab === 'tx' ? 'transaksi' : 'transfer'}-${period.startYmd}_${period.endYmd}.csv`
      await (tab === 'tx' ? exportApi.transactions(range, name) : exportApi.transfers(range, name))
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Transaksi"
        description="Semua uang masuk, keluar, dan pindahan antar dompet."
        actions={
          <>
            <Button variant="outline" icon={Download} loading={exporting} onClick={doExport}>
              Unduh CSV
            </Button>
            <Button variant="outline" icon={ArrowLeftRight} onClick={() => quick.openTransfer()}>
              Pindahkan uang
            </Button>
            <Button icon={Plus} onClick={() => quick.openTransaction()}>
              Catat transaksi
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'tx', label: 'Pemasukan & pengeluaran' },
            { value: 'transfer', label: 'Pindahan' },
          ]}
        />
        <div className="ml-auto">
          <MonthNav value={month} onChange={(m) => { setMonth(m); setLimit(PAGE) }} label={navLabel} />
        </div>
      </div>

      <section className="panel overflow-hidden">
        {tab === 'tx' ? (
          <>
            <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari catatan, kategori, dompet" className="pl-10" aria-label="Cari transaksi" />
              </div>
              <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Jenis">
                <option value="">Semua jenis</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </Select>
              <Select value={walletId} onChange={(e) => setWalletId(e.target.value)} aria-label="Dompet">
                <option value="">Semua dompet</option>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </Select>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Kategori">
                <option value="">Semua kategori</option>
                {categories.filter((c) => !type || c.type === type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line bg-sunken/60 px-5 py-3.5 text-sm sm:px-6">
              <span className="text-muted">
                Masuk <span className="num ml-1 font-semibold text-income">{rupiah(totals.income)}</span>
              </span>
              <span className="text-muted">
                Keluar <span className="num ml-1 font-semibold text-ink">{rupiah(totals.expense)}</span>
              </span>
              <span className="text-muted">
                Selisih <span className={cn('num ml-1 font-semibold', totals.income - totals.expense < 0 ? 'text-expense' : 'text-ink')}>{rupiah(totals.income - totals.expense, { sign: true })}</span>
              </span>
              <span className="ml-auto text-muted">{filtered.length} transaksi</span>
            </div>

            {txs.error ? (
              <div className="p-6"><ErrorNote error={txs.error} onRetry={txs.refetch} /></div>
            ) : txs.isLoading ? (
              <div className="space-y-3 p-6">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : filtered.length === 0 ? (
              <Empty icon={Receipt} title={q || type || walletId || categoryId ? 'Tidak ada yang cocok' : 'Belum ada transaksi di periode ini'} action={<Button size="sm" icon={Plus} onClick={() => quick.openTransaction()}>Catat transaksi</Button>}>
                {q || type || walletId || categoryId ? 'Coba ubah filter atau kata pencarian.' : 'Pindah ke periode lain atau catat transaksi baru.'}
              </Empty>
            ) : (
              <div className={cn('py-2 transition-opacity', txs.isFetching && 'opacity-60')}>
                {groupByDay(filtered.slice(0, limit), 'date').map((g) => (
                  <div key={g.label} className="px-2 py-2 sm:px-4">
                    <p className="px-3 pb-0.5 pt-2 text-[13px] font-semibold text-muted">{g.label}</p>
                    {g.items.map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} showDate={false} onClick={() => quick.openTransaction({ editId: tx.id })} />
                    ))}
                  </div>
                ))}
                {filtered.length > limit && (
                  <div className="p-4 text-center">
                    <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
                      Tampilkan {Math.min(PAGE, filtered.length - limit)} lagi
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <TransfersList params={range} />
        )}
      </section>
    </div>
  )
}
