import { forwardRef, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { groupThousands, rupiah } from '../../lib/format'

const BUTTON = {
  primary: 'bg-violet text-white hover:bg-violet-deep disabled:bg-violet/50',
  dark: 'bg-ink text-canvas hover:bg-ink/85',
  soft: 'bg-violet-soft text-violet-ink hover:bg-violet-soft/70',
  outline: 'border border-line bg-surface text-ink hover:bg-sunken',
  ghost: 'text-muted hover:bg-sunken hover:text-ink',
  danger: 'bg-expense text-white hover:bg-expense/90',
  'danger-soft': 'bg-expense-soft text-expense hover:bg-expense-soft/70',
}

const SIZE = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading, icon: Icon, className, children, disabled, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-semibold transition-colors disabled:cursor-not-allowed',
        BUTTON[variant],
        SIZE[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" strokeWidth={2.2} />}
      {children}
    </button>
  )
})

export function IconButton({ icon: Icon, label, className, badge, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink',
        className
      )}
      {...props}
    >
      <Icon className="size-[18px]" strokeWidth={2} />
      {badge ? (
        <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-expense px-1 text-center text-[10px] font-bold leading-4 text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  )
}

export function Field({ label, hint, error, children, className }) {
  const id = useId()
  const child = typeof children === 'function' ? children(id) : children
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
          {label}
        </label>
      )}
      {child}
      {error ? <p className="text-[13px] text-expense">{error}</p> : hint ? <p className="text-[13px] text-muted">{hint}</p> : null}
    </div>
  )
}

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn('field', className)} {...props} />
})

export function Select({ className, children, ...props }) {
  return (
    <select className={cn('field appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9', className)} style={{ backgroundImage: CHEVRON }} {...props}>
      {children}
    </select>
  )
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239A96B0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`

export function Textarea({ className, ...props }) {
  return <textarea className={cn('field h-auto min-h-[84px] resize-y py-2.5', className)} {...props} />
}

export function MoneyInput({ value, onChange, allowNegative, className, ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-faint">Rp</span>
      <input
        inputMode={allowNegative ? 'text' : 'numeric'}
        className={cn('field num pl-10 text-[17px] font-semibold', className)}
        value={groupThousands(value)}
        onChange={(e) => {
          const raw = allowNegative ? e.target.value : e.target.value.replace('-', '')
          onChange(raw.trim() === '-' ? '-' : raw.replace(/[^\d-]/g, ''))
        }}
        {...props}
      />
    </div>
  )
}

export function Segmented({ options, value, onChange, className, size = 'md' }) {
  return (
    <div role="tablist" className={cn('inline-flex rounded-full bg-sunken p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-full font-semibold transition-colors',
              size === 'sm' ? 'px-2 py-1.5 text-[13px] min-[360px]:px-3' : 'px-4 py-2 text-sm',
              active ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-muted hover:text-ink'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Modal({ open, onClose, title, description, children, footer, wide }) {
  const panel = useRef(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && closeRef.current?.()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = panel.current?.querySelector('input, select, textarea, button:not([data-close])')
    first?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="animate-fade absolute inset-0 bg-[rgb(20_16_36/0.45)] backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'animate-rise relative flex max-h-[92dvh] w-full flex-col rounded-t-[26px] bg-surface shadow-pop sm:rounded-[26px]',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button data-close type="button" onClick={onClose} aria-label="Tutup" className="-mr-2 -mt-1 rounded-full p-2 text-muted hover:bg-sunken hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6 pt-3">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export function Badge({ tone = 'neutral', children, className }) {
  const tones = {
    neutral: 'bg-sunken text-muted',
    violet: 'bg-violet-soft text-violet-ink',
    income: 'bg-income-soft text-income',
    expense: 'bg-expense-soft text-expense',
    caution: 'bg-caution-soft text-caution',
  }
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>{children}</span>
}

export function Progress({ value, tone = 'violet', className, animate = true }) {
  const pct = Math.max(0, Math.min(100, value || 0))
  const tones = { violet: 'bg-violet', income: 'bg-income', expense: 'bg-expense', caution: 'bg-caution', ink: 'bg-ink' }
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-sunken', className)}>
      <div className={cn('h-full rounded-full', tones[tone], animate && 'animate-fill')} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Money({ value, sign, className, tone }) {
  const tones = { income: 'text-income', expense: 'text-expense', auto: value < 0 ? 'text-expense' : value > 0 ? 'text-income' : '' }
  return <span className={cn('num whitespace-nowrap', tone && tones[tone], className)}>{rupiah(value, { sign })}</span>
}

export function Empty({ icon: Icon, title, children, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-violet-soft text-violet-ink">
          <Icon className="size-6" strokeWidth={1.8} />
        </div>
      )}
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-sunken', className)} />
}

export function ErrorNote({ error, onRetry }) {
  if (!error) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-expense-soft px-4 py-3 text-sm text-expense">
      <span>{error.message || 'Data gagal dimuat.'}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">
          Muat ulang
        </button>
      )}
    </div>
  )
}

export function PageHeader({ title, description, actions, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold leading-tight sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-muted">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, action, children, className, bodyClassName }) {
  return (
    <section className={cn('panel', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pb-1 pt-5 sm:px-6">
          {title && <h2 className="text-[17px] font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      <div className={cn('p-5 sm:p-6', title && 'pt-3 sm:pt-3', bodyClassName)}>{children}</div>
    </section>
  )
}
