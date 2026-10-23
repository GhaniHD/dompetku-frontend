import { ArrowLeftRight, BarChart3, HandCoins, LayoutGrid, PieChart, Repeat, Sparkles, Tags, Target, Wallet } from 'lucide-react'

export const PRIMARY_NAV = [
  { to: '/', label: 'Ringkasan', icon: LayoutGrid, end: true },
  { to: '/transaksi', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/dompet', label: 'Dompet', icon: Wallet },
  { to: '/anggaran', label: 'Anggaran', icon: PieChart },
  { to: '/laporan', label: 'Laporan', icon: BarChart3 },
]

export const SECONDARY_NAV = [
  { to: '/rutin', label: 'Transaksi rutin', icon: Repeat, hint: 'Gaji, tagihan, langganan' },
  { to: '/hutang', label: 'Hutang & piutang', icon: HandCoins, hint: 'Catat pinjaman dan cicilan' },
  { to: '/target', label: 'Target tabungan', icon: Target, hint: 'Pantau progres menabung' },
  { to: '/analisis', label: 'Analisis AI', icon: Sparkles, hint: 'Insight dan prediksi' },
  { to: '/kategori', label: 'Kategori', icon: Tags, hint: 'Atur kategori transaksi' },
]
