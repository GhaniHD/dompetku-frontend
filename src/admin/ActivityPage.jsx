import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, Search } from 'lucide-react'
import { Empty, ErrorNote, Input, PageHeader, Select, Skeleton } from '../components/ui'
import { useAdminActivity } from '../hooks/queries'
import { cn } from '../lib/cn'
import { EVENTS } from './constants'
import { EventRow } from './UsersPage'

export default function ActivityPage() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const event = params.get('event') || ''
  const activity = useAdminActivity({ event: event || undefined, q: q.trim() || undefined, limit: 200 })
  const list = activity.data || []

  return (
    <div>
      <PageHeader title="Aktivitas login" description="Masuk, keluar, gagal masuk, dan perubahan password seluruh pengguna. Disimpan 7 hari, lalu dihapus otomatis." />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, atau IP" className="pl-10" aria-label="Cari aktivitas" />
        </div>
        <Select
          value={event}
          aria-label="Jenis aktivitas"
          onChange={(e) => {
            const next = new URLSearchParams(params)
            if (e.target.value) next.set('event', e.target.value)
            else next.delete('event')
            setParams(next, { replace: true })
          }}
        >
          <option value="">Semua aktivitas</option>
          {Object.entries(EVENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
      </div>
      <ErrorNote error={activity.error} onRetry={activity.refetch} />
      {activity.isLoading ? (
        <Skeleton className="h-64" />
      ) : list.length === 0 ? (
        <section className="panel"><Empty icon={Activity} title="Belum ada aktivitas yang cocok" /></section>
      ) : (
        <section className={cn('panel px-5 sm:px-6', activity.isFetching && 'opacity-60')}>
          <ul className="divide-y divide-line">
            {list.map((e) => <EventRow key={e.id} e={e} showUser />)}
          </ul>
          {list.length >= 200 && <p className="py-3 text-center text-xs text-faint">Menampilkan 200 aktivitas terbaru. Persempit dengan pencarian atau filter.</p>}
        </section>
      )}
    </div>
  )
}
