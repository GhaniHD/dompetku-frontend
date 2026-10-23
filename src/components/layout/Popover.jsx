import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'

export default function Popover({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          className={cn(
            'animate-rise absolute top-full z-40 mt-2 rounded-2xl border border-line bg-surface shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
