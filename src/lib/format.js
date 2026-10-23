const idr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 })

export const rupiah = (n, { sign = false } = {}) => {
  const value = Number(n) || 0
  const prefix = value < 0 ? '−' : sign && value > 0 ? '+' : ''
  return `${prefix}Rp${idr.format(Math.abs(value))}`
}

export const rupiahShort = (n) => {
  const value = Number(n) || 0
  return `${value < 0 ? '−' : ''}Rp${compact.format(Math.abs(value))}`
}

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const pad = (n) => String(n).padStart(2, '0')

export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const today = () => ymd(new Date())

export const parseYmd = (s) => {
  if (!s) return null
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const toDay = (value) => {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return parseYmd(value)
  return new Date(value)
}

export const dateLabel = (value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  const d = toDay(value)
  return d ? d.toLocaleDateString('id-ID', opts) : '–'
}

export const shortDate = (value) => dateLabel(value, { day: 'numeric', month: 'short' })

export const relativeDay = (value) => {
  const d = toDay(value)
  if (!d) return '–'
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const that = new Date(d)
  that.setHours(0, 0, 0, 0)
  const diff = Math.round((that - start) / 86400000)
  if (diff === 0) return 'Hari ini'
  if (diff === -1) return 'Kemarin'
  if (diff === 1) return 'Besok'
  if (diff > 1 && diff < 7) return `${diff} hari lagi`
  return dateLabel(d, { day: 'numeric', month: 'short', year: d.getFullYear() === start.getFullYear() ? undefined : 'numeric' })
}

export const timeAgo = (value) => {
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`
  return dateLabel(value)
}

// Backend memakai time.Time (RFC3339). Tanggal dari <input type="date"> dikirim
// sebagai jam 12 siang waktu lokal agar tidak bergeser hari karena zona waktu.
export const dayToISO = (s) => (s ? new Date(`${s}T12:00:00`).toISOString() : undefined)
export const dayStartISO = (s) => (s ? new Date(`${s}T00:00:00`).toISOString() : undefined)
export const dayEndISO = (s) => (s ? new Date(`${s}T23:59:59`).toISOString() : undefined)

export const isoToDay = (value) => {
  const d = toDay(value)
  return d ? ymd(d) : ''
}

export const parseAmount = (s) => {
  const digits = String(s ?? '').replace(/[^\d-]/g, '')
  return digits ? Number(digits) : 0
}

export const groupThousands = (s) => {
  const raw = String(s ?? '')
  const negative = raw.trim().startsWith('-')
  const digits = raw.replace(/\D/g, '')
  if (!digits) return negative ? '-' : ''
  return (negative ? '-' : '') + idr.format(Number(digits))
}
