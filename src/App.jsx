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
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UnsubscribePage from './pages/UnsubscribePage'
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
const AdminShell = lazy(() => import('./admin/AdminShell'))
const AdminDashboardPage = lazy(() => import('./admin/DashboardPage'))
const AdminApprovalsPage = lazy(() => import('./admin/ApprovalsPage'))
const AdminUsersPage = lazy(() => import('./admin/UsersPage'))
const AdminActivityPage = lazy(() => import('./admin/ActivityPage'))
const AdminInvitesPage = lazy(() => import('./admin/InvitesPage'))
const AdminAnnouncementsPage = lazy(() => import('./admin/AnnouncementsPage'))
const AdminLogsPage = lazy(() => import('./admin/LogsPage'))
const AdminEmailPage = lazy(() => import('./admin/EmailPage'))
const AdminAccountPage = lazy(() => import('./admin/AccountPage'))

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
  if (!user) return <Outlet />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
}

// Akun admin hanya membuka konsol admin; akun biasa tidak bisa membuka konsol.
function RoleGate({ admin }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  if (admin && !isAdmin) return <Navigate to="/" replace />
  if (!admin && isAdmin) return <Navigate to="/admin" replace />
  return <Outlet />
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
                  <Route path="/lupa-password" element={<ForgotPasswordPage />} />
                </Route>
                <Route path="/atur-ulang-password" element={<ResetPasswordPage />} />
                <Route path="/berhenti-langganan" element={<UnsubscribePage />} />

                <Route element={<RequireAuth />}>
                  <Route path="admin" element={<RoleGate admin />}>
                    <Route element={<AdminShell />}>
                      <Route index element={<AdminDashboardPage />} />
                      <Route path="persetujuan" element={<AdminApprovalsPage />} />
                      <Route path="pengguna" element={<AdminUsersPage />} />
                      <Route path="aktivitas" element={<AdminActivityPage />} />
                      <Route path="undangan" element={<AdminInvitesPage />} />
                      <Route path="pengumuman" element={<AdminAnnouncementsPage />} />
                      <Route path="log" element={<AdminLogsPage />} />
                      <Route path="email" element={<AdminEmailPage />} />
                      <Route path="akun" element={<AdminAccountPage />} />
                      <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Route>
                  </Route>
                  <Route element={<RoleGate />}>
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
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
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
