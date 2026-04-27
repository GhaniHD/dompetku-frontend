import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthProvider';

import ProtectedRoute   from './components/ProtectedRoute';
import PublicRoute      from './components/PublicRoute';
import AppLayout        from './components/layout/AppLayout';

import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage    from './pages/dashboard/DashboardPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import AnalysisPage from './pages/analysis/AnalysisPage'
import BudgetPage       from './pages/budget/BudgetPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/profile/ProfilePage';
import CategoriesPage from './pages/categories/CategoriesPage';
import WalletPage from './pages/wallet/WalletPage';
import ReportsPage from './pages/reports/ReportsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Wrapper: ProtectedRoute + AppLayout digabung agar tidak nested berulang
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public routes (tanpa sidebar) ── */}
            <Route path="/login" element={
              <PublicRoute><LoginPage /></PublicRoute>
            }/>
            <Route path="/register" element={
              <PublicRoute><RegisterPage /></PublicRoute>
            }/>

            {/* ── Protected routes (dengan sidebar via AppLayout) ── */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard"    element={<DashboardPage />} />
              <Route path="/transactions"    element={<TransactionsPage />} />
              <Route path="/budget"       element={<BudgetPage />} />
              {/* Tambahkan route lain di sini saat siap: */}
              <Route path="/wallets"   element={<WalletPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/reports" element = {<ReportsPage/>} />
              <Route path="/analysis" element = {<AnalysisPage/>} />
            </Route>

            {/* ── Redirect & fallback ── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;