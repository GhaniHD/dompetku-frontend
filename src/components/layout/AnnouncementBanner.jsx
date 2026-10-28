import { useState } from 'react'
import { Megaphone, TriangleAlert, X } from 'lucide-react'
import { useActiveAnnouncements } from '../../hooks/queries'
import { cn } from '../../lib/cn'

const KEY = 'dismissed_announcements'

function readDismissed() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export default function AnnouncementBanner() {
  const { data = [] } = useActiveAnnouncements()
  const [dismissed, setDismissed] = useState(readDismissed)
  const visible = data.filter((a) => !dismissed.includes(a.id))
  if (!visible.length) return null

  const dismiss = (id) => {
    const next = [...dismissed, id].slice(-20)
    setDismissed(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* penyimpanan diblokir: cukup sembunyikan untuk sesi ini */
    }
  }

  return (
    <div className="mb-4 space-y-2">
      {visible.map((a) => {
        const warn = a.level === 'warning'
        const Icon = warn ? TriangleAlert : Megaphone
        return (
          <div key={a.id} role="status" className={cn('flex items-start gap-3 rounded-2xl px-4 py-3 text-sm', warn ? 'bg-caution-soft text-ink' : 'bg-violet-soft text-ink')}>
            <Icon className={cn('mt-0.5 size-4 shrink-0', warn ? 'text-caution' : 'text-violet-ink')} />
            <p className="min-w-0 flex-1">{a.message}</p>
            <button type="button" onClick={() => dismiss(a.id)} aria-label="Tutup pengumuman" className="-m-1 rounded-full p-1 text-muted hover:bg-black/5 hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
