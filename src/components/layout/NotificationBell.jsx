import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationApi } from '../../api/endpoints'
import { useAction, useNotifications } from '../../hooks/queries'
import { timeAgo } from '../../lib/format'
import { cn } from '../../lib/cn'
import { IconButton } from '../ui'
import Popover from './Popover'

export default function NotificationBell() {
  const { data } = useNotifications(1, 8)
  const readAll = useAction(notificationApi.readAll)
  const read = useAction(notificationApi.read)
  const items = data?.notifications || []
  const unread = data?.total_unread || 0

  return (
    <Popover
      className="w-[380px] max-sm:fixed max-sm:inset-x-3 max-sm:top-[72px] max-sm:mt-0 max-sm:w-auto"
      trigger={({ toggle }) => <IconButton icon={Bell} label="Notifikasi" onClick={toggle} badge={unread} />}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <p className="font-display text-base font-semibold">Notifikasi</p>
            {unread > 0 && (
              <button type="button" onClick={() => readAll.mutate()} className="flex items-center gap-1 text-[13px] font-semibold text-violet-ink hover:underline">
                <CheckCheck className="size-4" /> Tandai semua dibaca
              </button>
            )}
          </div>
          <ul className="max-h-[360px] overflow-y-auto px-2">
            {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">Belum ada notifikasi.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => !n.read && read.mutate(n.id)}
                  className="flex w-full gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-sunken"
                >
                  <span className={cn('mt-2 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-violet')} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{n.title}</span>
                    <span className="block text-[13px] leading-snug text-muted">{n.message}</span>
                    <span className="mt-0.5 block text-xs text-faint">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link to="/notifikasi" onClick={close} className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-violet-ink hover:bg-sunken">
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </Popover>
  )
}
