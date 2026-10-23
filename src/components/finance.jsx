import { ArrowDownLeft, ArrowUpRight, Repeat } from 'lucide-react'
import { cn } from '../lib/cn'
import { relativeDay, rupiah } from '../lib/format'
import { walletType } from '../lib/walletTypes'

export function FlowIcon({ type, className }) {
  const income = type === 'income' || type === 'transfer_in'
  const Icon = income ? ArrowDownLeft : ArrowUpRight
  return (
    <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', income ? 'bg-income-soft text-income' : 'bg-sunken text-ink', className)}>
      <Icon className="size-[18px]" strokeWidth={2.2} />
    </span>
  )
}

export function TransactionRow({ tx, onClick, showDate = true }) {
  const income = tx.type === 'income'
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-sunken sm:px-3">
      <FlowIcon type={tx.type} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate font-semibold">
          <span className="truncate">{tx.note || tx.category_name}</span>
          {tx.recurring_id && <Repeat className="size-3.5 shrink-0 text-faint" aria-label="Transaksi rutin" />}
        </span>
        <span className="block truncate text-[13px] text-muted">
          {tx.note ? `${tx.category_name} ` : ''}
          {income ? 'ke' : 'dari'} {tx.wallet_name}
        </span>
      </span>
      <span className="text-right">
        <span className={cn('num block font-semibold', income && 'text-income')}>{rupiah(income ? tx.amount : -tx.amount, { sign: income })}</span>
        {showDate && <span className="block text-xs text-faint">{relativeDay(tx.date)}</span>}
      </span>
    </button>
  )
}

export function WalletGlyph({ type, className }) {
  const Icon = walletType(type).icon
  return (
    <span className={cn('grid size-10 shrink-0 place-items-center rounded-2xl bg-violet-soft text-violet-ink', className)}>
      <Icon className="size-[18px]" strokeWidth={2} />
    </span>
  )
}
