/* ─────────────────────────────────────────────
   DompetKu — Data & Konstanta
   ───────────────────────────────────────────── */

export const WALLETS = [
  { id: 1, name: 'BCA',   icon: '🏦', balance: 12800000, color: '#6366F1', bg: '#EEF2FF' },
  { id: 2, name: 'GoPay', icon: '📱', balance: 560000,   color: '#10B981', bg: '#ECFDF5' },
  { id: 3, name: 'Tunai', icon: '💵', balance: 200000,   color: '#F59E0B', bg: '#FFFBEB' },
];

export const TRANSACTIONS = [
  { id: 1, name: 'Gaji April',   cat: 'Pemasukan',  amount: 6500000, type: 'inc', date: '1 Apr',  icon: '💼' },
  { id: 2, name: 'PLN Token',    cat: 'Tagihan',    amount: 150000,  type: 'exp', date: '10 Apr', icon: '⚡' },
  { id: 3, name: 'Warung Makan', cat: 'Makanan',    amount: 35000,   type: 'exp', date: '12 Apr', icon: '🍜' },
  { id: 4, name: 'Alfamart',     cat: 'Belanja',    amount: 87000,   type: 'exp', date: '13 Apr', icon: '🛒' },
  { id: 5, name: 'Freelance UI', cat: 'Pemasukan',  amount: 1200000, type: 'inc', date: '11 Apr', icon: '💻' },
  { id: 6, name: 'Ojek Online',  cat: 'Transport',  amount: 45000,   type: 'exp', date: '12 Apr', icon: '🚗' },
];

export const WEEKLY = [
  { day: 'Sen', amount: 125000 },
  { day: 'Sel', amount: 87000  },
  { day: 'Rab', amount: 210000 },
  { day: 'Kam', amount: 65000  },
  { day: 'Jum', amount: 180000 },
  { day: 'Sab', amount: 320000 },
  { day: 'Min', amount: 95000  },
];

export const CATEGORIES = [
  { name: 'Makanan',   pct: 29, color: '#6366F1' },
  { name: 'Belanja',   pct: 26, color: '#10B981' },
  { name: 'Tagihan',   pct: 20, color: '#F59E0B' },
  { name: 'Transport', pct: 13, color: '#EF4444' },
  { name: 'Lainnya',   pct: 12, color: '#8B5CF6' },
];

export const BUDGET = [
  { name: 'Makanan',   used: 620000,  total: 800000,  color: '#6366F1' },
  { name: 'Belanja',   used: 840000,  total: 1000000, color: '#10B981' },
  { name: 'Transport', used: 320000,  total: 400000,  color: '#F59E0B' },
  { name: 'Hiburan',   used: 180000,  total: 300000,  color: '#8B5CF6' },
  { name: 'Tagihan',   used: 650000,  total: 700000,  color: '#EF4444' },
];

/** Helper: format angka ke Rupiah */
export const fmt = (n) => 'Rp ' + Math.abs(n).toLocaleString('id-ID');
