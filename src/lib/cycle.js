import { ymd } from './format'

const daysIn = (y, m) => new Date(y, m + 1, 0).getDate()

const startOf = (startDay, y, m) => {
  const first = new Date(y, m, 1)
  const day = Math.min(startDay, daysIn(first.getFullYear(), first.getMonth()))
  return new Date(first.getFullYear(), first.getMonth(), day)
}

// Sama dengan pkg/budgetcycle di backend: periode diberi nama sesuai bulan mulainya.
export function periodOf(startDay = 1, date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  let y = d.getFullYear()
  let m = d.getMonth()
  if (d < startOf(startDay, y, m)) {
    const prev = new Date(y, m - 1, 1)
    y = prev.getFullYear()
    m = prev.getMonth()
  }
  return periodFor(startDay, y, m + 1)
}

export function periodFor(startDay = 1, year, month) {
  const start = startOf(startDay, year, month - 1)
  const next = startOf(startDay, year, month)
  const end = new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1)
  const length = Math.round((next - start) / 86400000)
  return { year, month, start, end, next, length, startYmd: ymd(start), endYmd: ymd(end) }
}

export function cycleProgress(startDay = 1, now = new Date()) {
  const p = periodOf(startDay, now)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayIndex = Math.round((todayStart - p.start) / 86400000) + 1
  return { ...p, dayIndex, daysLeft: p.length - dayIndex + 1 }
}
