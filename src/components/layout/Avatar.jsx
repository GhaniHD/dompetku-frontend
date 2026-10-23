import { useState } from 'react'
import { assetUrl } from '../../api/client'
import { cn } from '../../lib/cn'

export default function Avatar({ name = '', src, className }) {
  const [broken, setBroken] = useState(false)
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  if (src && !broken) {
    return <img src={assetUrl(src)} alt="" onError={() => setBroken(true)} className={cn('size-9 shrink-0 rounded-full object-cover', className)} />
  }
  return (
    <span className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-violet-soft font-display text-sm font-semibold text-violet-ink', className)}>
      {initials}
    </span>
  )
}
