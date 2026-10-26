import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/auth'
import { FeedbackProvider } from './components/ui/feedback'
import AppShell from './components/layout/AppShell'
import { Skeleton } from './components/ui'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'

const TransactionsPage = lazy(() => import('./pages/TransactionsPage'))
const WalletsPage = lazy(() => import('./pages/WalletsPage'))
const WalletDetailPage = lazy(() => import('./pages/WalletDetailPage'))
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const RecurringPage = lazy(() => import('./pages/RecurringPage'))
const DebtsPage = lazy(() => import('./pages/DebtsPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const MorePage = lazy(() => import('./pages/MorePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 60_000 },
  },
})

function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/masuk" replace state={{ from: location.pathname }} />
  return <Outlet />
}

function GuestOnly() {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : <Outlet />
}

function PageFallback() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-72" />
    </div>
  )
}

const LEGACY = {
  '/login': '/masuk',
  '/register': '/daftar',
  '/dashboard': '/',
  '/transactions': '/transaksi',
  '/wallets': '/dompet',
  '/budget': '/anggaran',
  '/reports': '/laporan',
  '/analysis': '/analisis',
  '/categories': '/kategori',
  '/profile': '/profil',
  '/more': '/lainnya',
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <FeedbackProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route element={<GuestOnly />}>
                  <Route path="/masuk" element={<LoginPage />} />
                  <Route path="/daftar" element={<RegisterPage />} />
                </Route>
                <Route path="/atur-ulang-password" element={<ResetPasswordPage />} />

                <Route element={<RequireAuth />}>
                  <Route element={<AppShell />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="transaksi" element={<TransactionsPage />} />
                    <Route path="dompet" element={<WalletsPage />} />
                    <Route path="dompet/:id" element={<WalletDetailPage />} />
                    <Route path="anggaran" element={<BudgetsPage />} />
                    <Route path="laporan" element={<ReportsPage />} />
                    <Route path="analisis" element={<AnalysisPage />} />
                    <Route path="rutin" element={<RecurringPage />} />
                    <Route path="hutang" element={<DebtsPage />} />
                    <Route path="target" element={<GoalsPage />} />
                    <Route path="kategori" element={<CategoriesPage />} />
                    <Route path="profil" element={<ProfilePage />} />
                    <Route path="notifikasi" element={<NotificationsPage />} />
                    <Route path="lainnya" element={<MorePage />} />
                    <Route path="admin" element={<AdminPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Route>

                {Object.entries(LEGACY).map(([from, to]) => (
                  <Route key={from} path={from} element={<Navigate to={to} replace />} />
                ))}
              </Routes>
            </Suspense>
          </FeedbackProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
