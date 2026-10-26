// Kata-kata periode yang berbeda untuk pengguna bergaji tetap dan tidak tetap.
export function periodWords(profile) {
  const irregular = profile?.income_type === 'irregular'
  const startDay = profile?.budget_start_day || 1
  if (irregular) {
    return {
      irregular,
      startDay,
      badge: 'Periode bulanan',
      until: 'akhir bulan',
      countdown: (daysLeft) => (daysLeft <= 1 ? 'Hari terakhir bulan ini' : `${daysLeft - 1} hari lagi akhir bulan`),
      basis: 'Periode mengikuti bulan kalender, tanggal 1 sampai akhir bulan.',
      settingsLink: 'Ubah jenis pemasukan',
    }
  }
  return {
    irregular,
    startDay,
    badge: `Gajian tgl ${startDay}`,
    until: startDay === 1 ? 'akhir bulan' : 'gajian berikutnya',
    countdown: (daysLeft) => (daysLeft <= 1 ? 'Gajian besok' : `${daysLeft - 1} hari lagi gajian`),
    basis: `Periode mengikuti tanggal gajian (${startDay}).`,
    settingsLink: 'Ubah tanggal gajian',
  }
}
