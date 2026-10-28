export const STATUS = {
  pending: { label: 'Menunggu', tone: 'caution' },
  active: { label: 'Aktif', tone: 'income' },
  suspended: { label: 'Nonaktif', tone: 'expense' },
  rejected: { label: 'Ditolak', tone: 'neutral' },
}

export const EVENTS = {
  login: { label: 'Masuk', tone: 'income' },
  login_failed: { label: 'Gagal masuk', tone: 'expense' },
  login_locked: { label: 'Dikunci sementara', tone: 'expense' },
  logout: { label: 'Keluar', tone: 'neutral' },
  password_changed: { label: 'Ganti password', tone: 'violet' },
  password_reset: { label: 'Reset password', tone: 'violet' },
  forced_logout: { label: 'Dikeluarkan admin', tone: 'caution' },
  email_verified: { label: 'Email terverifikasi', tone: 'income' },
  email_changed: { label: 'Ganti email', tone: 'violet' },
}
