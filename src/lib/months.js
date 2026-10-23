export function shiftMonth({ month, year }, delta) {
  const d = new Date(year, month - 1 + delta, 1)
  return { month: d.getMonth() + 1, year: d.getFullYear() }
}
