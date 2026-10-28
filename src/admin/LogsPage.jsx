import { ShieldCheck } from 'lucide-react'
import { Empty, ErrorNote, PageHeader, Skeleton } from '../components/ui'
import { useAdminLogs } from '../hooks/queries'
import { timeAgo } from '../lib/format'

const ACTION_LABEL = {
  approve: 'menyetujui',
  reject: 'menolak',
  suspend: 'menonaktifkan',
  activate: 'mengaktifkan lagi',
  delete: 'menghapus akun',
  reset_link: 'membuat link atur ulang password untuk',
  force_logout: 'mengeluarkan dari perangkat',
  invite_create: 'membuat undangan',
  invite_revoke: 'membatalkan undangan',
  announcement_create: 'memasang pengumuman',
  announcement_end: 'mengakhiri pengumuman',
}

export default function LogsPage() {
  const logs = useAdminLogs()
  return (
    <div>
      <PageHeader title="Log admin" description="Semua tindakan yang dilakukan dari konsol admin." />
      <ErrorNote error={logs.error} onRetry={logs.refetch} />
      {logs.isLoading ? (
        <Skeleton className="h-64" />
      ) : !logs.data?.length ? (
        <section className="panel"><Empty icon={ShieldCheck} title="Belum ada aktivitas admin" /></section>
      ) : (
        <section className="panel divide-y divide-line">
          {logs.data.map((l) => (
            <div key={l.id} className="px-5 py-3.5 text-sm sm:px-6">
              <p>
                <span className="font-semibold">{l.admin_name}</span> {ACTION_LABEL[l.action] || l.action}{' '}
                {l.target_name && <span className="font-semibold">{l.target_name}</span>}
                {l.action === 'invite_create' && <span className="num font-semibold">{l.detail}</span>}
                {l.action === 'delete' && !l.target_name && <span className="font-semibold">{l.detail}</span>}
              </p>
              {l.detail && (l.target_name || l.action === 'announcement_create') && <p className="text-[13px] text-muted">{l.detail}</p>}
              <p className="text-xs text-faint">{timeAgo(l.created_at)}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
