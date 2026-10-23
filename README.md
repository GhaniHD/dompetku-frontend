# DompetKu (frontend)

Frontend aplikasi pencatat keuangan pribadi DompetKu. React 19, Vite, Tailwind CSS 3, TanStack Query, Chart.js.

## Menjalankan

```bash
npm install
cp .env.example .env      # isi VITE_API_URL bila backend bukan production
npm run dev               # http://localhost:5173
npm run build             # hasil di dist/
```

`VITE_API_URL` default ke `https://dompetku-backend.onrender.com/api`. Untuk backend lokal pakai `http://localhost:8090/api`
(origin `http://localhost:5173` sudah diizinkan CORS di backend).

## Struktur

```
src/
  api/          client axios (unwrap {success, message, data}) dan semua endpoint
  hooks/        hook TanStack Query per resource + useAction (mutasi + refresh cache)
  context/      auth dan tema gelap/terang
  lib/          format rupiah & tanggal, siklus gajian (sama dengan pkg/budgetcycle backend)
  components/
    ui/         tombol, input, modal, toast/konfirmasi, dsb.
    layout/     AppShell: rail ikon kiri, nav pil atas, bottom nav mobile, notifikasi
    forms/      form transaksi, transfer, dompet, penyesuaian saldo
    charts/     grafik Chart.js yang membaca warna dari CSS variable
  pages/        satu file per halaman
```

## Halaman

| Rute | Isi |
|---|---|
| `/` | Ringkasan: saldo, progres siklus gajian, arus kas, anggaran, jadwal mendatang |
| `/transaksi` | Pemasukan/pengeluaran dan pindahan per periode, filter, unduh CSV |
| `/dompet`, `/dompet/:id` | Dompet per jenis, arsip, sesuaikan saldo, riwayat dengan saldo berjalan |
| `/anggaran` | Anggaran per periode gajian, salin dari periode lalu |
| `/laporan` | Laporan bulanan (kalender/periode gajian) dan tahunan |
| `/analisis` | Analisis AI dan prediksi |
| `/rutin`, `/hutang`, `/target`, `/kategori` | Transaksi rutin, hutang & piutang, target tabungan, kategori |
| `/profil`, `/notifikasi`, `/lainnya` | Akun, tanggal gajian, password; notifikasi; menu mobile |

Rute lama (`/dashboard`, `/login`, `/wallets`, …) dialihkan otomatis ke rute baru.
