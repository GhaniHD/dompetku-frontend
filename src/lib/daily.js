const sum = (list) => list.reduce((s, t) => s + t.amount, 0)

// Jatah per anggaran = (sisa anggaran + yang sudah keluar hari ini) ÷ sisa hari,
// sehingga jatah tidak mengecil karena belanja hari ini sendiri.
function budgetRow(budget, todays, days) {
  const items = todays.filter((t) => t.category_id === budget.category.id)
  const spent = sum(items)
  const allowance = Math.max(0, budget.remain + spent) / days
  return { id: budget.category.id, name: budget.category.name, spent, allowance, left: allowance - spent, items }
}

export function dailyPlan({ todays, budgets, wallets, days, selectedIds = [], categories = [], until }) {
  const expenseBudgets = (budgets?.budgets || []).filter((b) => b.kind !== 'savings')

  if (selectedIds.length) {
    const byCategory = new Map(expenseBudgets.map((b) => [b.category.id, b]))
    const rows = selectedIds.filter((id) => byCategory.has(id)).map((id) => budgetRow(byCategory.get(id), todays, days))
    const missing = selectedIds
      .filter((id) => !byCategory.has(id))
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean)
    const counted = rows.flatMap((r) => r.items)
    const spent = sum(counted)
    const names = rows.map((r) => r.name)
    return {
      mode: 'pick',
      rows,
      missing,
      counted,
      spent,
      allowance: rows.length ? rows.reduce((s, r) => s + r.allowance, 0) : null,
      other: sum(todays) - spent,
      basis: rows.length ? `Sisa anggaran ${names.join(', ').replace(/, ([^,]*)$/, ' dan $1')} dibagi ${days} hari sampai ${until}` : '',
    }
  }

  if (expenseBudgets.length && budgets.total_budget > 0) {
    const budgeted = new Set(expenseBudgets.map((b) => b.category.id))
    const counted = todays.filter((t) => budgeted.has(t.category_id))
    const spent = sum(counted)
    return {
      mode: 'all',
      rows: [],
      missing: [],
      counted,
      spent,
      allowance: Math.max(0, budgets.total_remain + spent) / days,
      other: sum(todays) - spent,
      basis: `Sisa semua anggaran dibagi ${days} hari sampai ${until}`,
    }
  }

  const spendable = wallets.filter((w) => ['cash', 'bank', 'ewallet'].includes(w.type) && w.balance > 0).reduce((s, w) => s + w.balance, 0)
  const spent = sum(todays)
  return {
    mode: 'wallet',
    rows: [],
    missing: [],
    counted: todays,
    spent,
    allowance: wallets.length ? (spendable + spent) / days : null,
    other: 0,
    basis: `Saldo tunai, bank & dompet digital dibagi ${days} hari sampai ${until}`,
  }
}
