import { useState } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { notificationApi } from '../api/endpoints'
import { Button, Empty, ErrorNote, PageHeader, Skeleton } from '../components/ui'
import { useFeedback } from '../components/ui/feedback'
import { useAction, useNotifications } from '../hooks/queries'
import { cn } from '../lib/cn'
import { timeAgo } from '../lib/format'

const LIMIT = 20

export default function NotificationsPage() {
  const { toast, confirm } = useFeedback()
  const [page, setPage] = useState(1)
  const notif = useNotifications(page, LIMIT)
  const read = useAction(notificationApi.read)
  const readAll = useAction(notificationApi.readAll, { onSuccess: () => toast('Semua ditandai dibaca') })
  const remove = useAction(notificationApi.remove)
  const clear = useAction(notificationApi.clear, { onSuccess: () => { toast('Notifikasi dibersihkan'); setPage(1) } })
  const data = notif.data
  const items = data?.notifications || []
  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        description="Peringatan saldo, anggaran, transaksi besar, jatuh tempo, dan target tercapai."
        actions={
          items.length > 0 && (
            <>
              <Button variant="outline" icon={CheckCheck} disabled={!data?.total_unread} onClick={() => readAll.mutate()}>Tandai semua dibaca</Button>
              <Button
                variant="danger-soft"
                icon={Trash2}
                onClick={async () => { if (await confirm({ title: 'Hapus semua notifikasi?', message: 'Notifikasi yang dihapus tidak bisa dikembalikan.', confirmLabel: 'Hapus semua', danger: true })) clear.mutate() }}
              >
                Hapus semua
              </Button>
            </>
          )
        }
      />
      <ErrorNote error={notif.error} onRetry={notif.refetch} />
      {notif.isLoading ? (
        <Skeleton className="h-80" />
      ) : items.length === 0 ? (
        <section className="panel"><Empty icon={Bell} title="Tidak ada notifikasi">Pemberitahuan penting tentang keuanganmu akan muncul di sini.</Empty></section>
      ) : (
        <section className="panel divide-y divide-line">
          {items.map((n) => (
            <div key={n.id} className={cn('group flex gap-4 px-5 py-4 sm:px-6', !n.read && 'bg-violet-soft/40')}>
              <span className={cn('mt-2 size-2 shrink-0 rounded-full', n.read ? 'bg-line' : 'bg-violet')} />
              <button type="button" onClick={() => !n.read && read.mutate(n.id)} className="min-w-0 flex-1 text-left">
                <p className="font-semibold">{n.title}</p>
                <p className="text-[15px] text-muted">{n.message}</p>
                <p className="mt-1 text-xs text-faint">{timeAgo(n.created_at)}</p>
              </button>
              <button type="button" onClick={() => remove.mutate(n.id)} aria-label="Hapus notifikasi" className="self-start rounded-full p-2 text-faint hover:bg-expense-soft hover:text-expense sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 text-sm">
              <span className="text-muted">Halaman {page} dari {pages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Lebih baru</Button>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Lebih lama</Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
