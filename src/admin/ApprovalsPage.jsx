import { UserCheck, UserX } from 'lucide-react'
import { Button, Empty, ErrorNote, PageHeader, Skeleton } from '../components/ui'
import { useAdminUsers } from '../hooks/queries'
import { timeAgo } from '../lib/format'
import { useUserActions } from './shared'

export default function ApprovalsPage() {
  const users = useAdminUsers({ status: 'pending' })
  const actions = useUserActions()
  const list = users.data || []

  return (
    <div>
      <PageHeader title="Persetujuan" description="Pendaftar baru menunggu di sini sampai disetujui atau ditolak." />
      <ErrorNote error={users.error} onRetry={users.refetch} />
      {users.isLoading ? (
        <Skeleton className="h-48" />
      ) : list.length === 0 ? (
        <section className="panel">
          <Empty icon={UserCheck} title="Tidak ada pendaftar yang menunggu">Pendaftar baru akan muncul di sini. Kamu juga mendapat notifikasi setiap ada yang mendaftar.</Empty>
        </section>
      ) : (
        <section className="panel divide-y divide-line">
          {list.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{u.name}</p>
                <p className="truncate text-sm text-muted">{u.email}</p>
                <p className="text-xs text-faint">Mendaftar {timeAgo(u.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="danger-soft" icon={UserX} onClick={() => actions.askReject(u)}>Tolak</Button>
                <Button icon={UserCheck} loading={actions.approve.isPending && actions.approve.variables === u.id} onClick={() => actions.approve.mutate(u.id)}>Setujui</Button>
              </div>
            </div>
          ))}
        </section>
      )}
      {actions.dialogs}
    </div>
  )
}
