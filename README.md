# Dompetku — Frontend

Frontend aplikasi **Dompetku**, pencatatan keuangan pribadi (personal finance
tracker) dengan dashboard, transaksi, budget, laporan, dan analisis keuangan
berbasis AI. Dibangun dengan **React 19 + Vite + Tailwind CSS**, dipasang
sebagai **PWA** (bisa di-install & dipakai layaknya aplikasi mobile).

Backend-nya ada di repo terpisah:
[dompetku-backend](https://github.com/GhaniHD/dompetku-backend) (Go + Gin +
PostgreSQL).

## Fitur

- **Autentikasi**: login & register, route publik/privat dipisah lewat
  `PublicRoute` & `ProtectedRoute`, sesi disimpan via token JWT.
- **Dashboard**: ringkasan keuangan, grafik (Chart.js via `react-chartjs-2`).
- **Multi-wallet**: kelola beberapa dompet/rekening dan lihat total saldo.
- **Transaksi**: catat, edit, hapus transaksi income/expense per wallet &
  kategori.
- **Kategori**: kelola kategori custom (income/expense).
- **Budget**: atur budget bulanan per kategori, termasuk fitur duplikasi
  budget dari bulan lain.
- **Laporan**: laporan bulanan & tahunan, dengan kemampuan **export ke
  Excel** (`exceljs`).
- **Analisis keuangan berbasis AI**: memanggil endpoint `/analysis` di
  backend (yang diproses oleh Claude API) untuk menampilkan insight
  keuangan dalam bahasa natural.
- **Notifikasi** in-app (lonceng notifikasi, tandai terbaca, hapus).
- **Profil**: update profil, ganti password, upload avatar.
- **PWA**: punya `manifest.json` + service worker (`sw.js`) sederhana untuk
  cache offline dasar, bisa di-install ke home screen.
- **Responsive**: layout dengan sidebar (desktop) dan bottom navigation
  (mobile) — lihat `components/layout/AppLayout.jsx`,
  `components/ui/Sidebar.jsx`, `components/ui/BottomNav.jsx`.

## Tech Stack

| Komponen | Teknologi |
| --- | --- |
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| Data fetching & cache | TanStack React Query v5 (+ devtools) |
| Styling | Tailwind CSS 3 |
| Grafik | Chart.js + react-chartjs-2 |
| Export data | ExcelJS |
| HTTP client | Axios (instance custom dengan interceptor JWT & auto-logout 401) |
| Ikon | lucide-react, react-icons |

## Struktur Proyek

```
src/
  App.jsx                  routing utama (public vs protected routes)
  main.jsx                 entry point
  config/
    axios.js                instance axios (base URL backend, interceptor JWT & 401)
  context/
    AuthContext.jsx / AuthProvider.jsx   state autentikasi global
  components/
    layout/AppLayout.jsx    shell halaman privat (sidebar + bottom nav + konten)
    ui/                     Sidebar, BottomNav, NotificationBell, PageLayout, dll
    charts/                 wrapper komponen chart.js
    ProtectedRoute.jsx / PublicRoute.jsx   guard routing berdasar status login
  hooks/
    useAuth.js, useWallets.js, useTransactions.js, useCategories.js,
    useBudgets.js, useReports.js, useAnalysis.js, useNotifications.js,
    useProfile.js, useIsMobile.js, useAnimations.js
                            React Query hooks per resource (fetch, mutate, invalidate)
  services/
    api.js                  fungsi request generik ke backend
    analysisService.js      request khusus fitur analisis AI
    notificationService.js  request khusus notifikasi
  pages/
    auth/                   LoginPage, RegisterPage
    dashboard/              DashboardPage
    wallet/                 WalletPage
    transactions/           TransactionsPage, TransactionForm
    categories/             CategoriesPage
    budget/                 BudgetPage
    reports/                ReportsPage (termasuk export Excel)
    analysis/               AnalysisPage (insight AI)
    profile/                ProfilePage, SettingsModal
    more/                   OtherPage (menu tambahan, biasanya untuk mobile)
    NotFoundPage.jsx
  constants/data.js         konstanta/data statis (kategori default, dll)
  styles/                   CSS global & variabel tema
public/
  manifest.json, sw.js      konfigurasi PWA
```

## Menjalankan Proyek

```bash
npm install
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) (port default Vite).

Build untuk production:

```bash
npm run build
npm run preview
```

## Konfigurasi Backend URL

Base URL backend saat ini **hardcoded** di `src/config/axios.js`:

```js
const API_BASE_URL = 'https://dompetku-backend.onrender.com/api';
```

Untuk development melawan backend lokal, ubah nilai ini sementara ke
`http://localhost:8090/api` (sesuaikan port dengan `PORT`/`SERVER_PORT` di
backend), atau — lebih baik — refactor jadi environment variable Vite
(`import.meta.env.VITE_API_URL`) supaya tidak perlu ubah kode setiap ganti
environment.

## Autentikasi

Token JWT dari backend disimpan di `localStorage` (`token`, `user`).
`axiosInstance` otomatis menyisipkan token ke header `Authorization` di
setiap request, dan otomatis logout (hapus token + redirect ke `/login`)
kalau backend membalas `401 Unauthorized`.

## Catatan

- Deploy saat ini menunjuk ke backend production di `onrender.com` —
  pastikan file `vercel.json` (kalau dipakai untuk deploy ke Vercel) sudah
  menangani client-side routing (rewrite semua path ke `index.html`) supaya
  React Router tidak 404 saat direct link/refresh halaman non-root.
- Service worker (`public/sw.js`) baru cache dua path statis (`/` dan
  `/index.html`) — masih level dasar, belum full offline-first untuk data
  API.
