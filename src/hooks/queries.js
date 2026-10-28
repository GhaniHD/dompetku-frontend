import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminApi, announcementApi,
  analysisApi, budgetApi, categoryApi, debtApi, goalApi, notificationApi, profileApi,
  recurringApi, reportApi, transactionApi, transferApi, walletApi,
} from '../api/endpoints'

const list = (v) => (Array.isArray(v) ? v : [])

export const useProfile = () => useQuery({ queryKey: ['profile'], queryFn: profileApi.get })

export const useWallets = (includeArchived = false) =>
  useQuery({ queryKey: ['wallets', { includeArchived }], queryFn: () => walletApi.list(includeArchived), select: list })

export const useWallet = (id) => useQuery({ queryKey: ['wallets', id], queryFn: () => walletApi.get(id), enabled: !!id })

export const useWalletHistory = (id, params) =>
  useQuery({ queryKey: ['history', id, params], queryFn: () => walletApi.history(id, params), enabled: !!id, placeholderData: (prev) => prev })

export const useCategories = (type) =>
  useQuery({ queryKey: ['categories', type || 'all'], queryFn: () => categoryApi.list(type), select: list })

export const useTransactions = (params) =>
  useQuery({ queryKey: ['transactions', params], queryFn: () => transactionApi.list(params), select: list, placeholderData: (prev) => prev })

export const useTransfers = (params) =>
  useQuery({ queryKey: ['transfers', params], queryFn: () => transferApi.list(params), select: list })

export const useBudgets = (month, year) =>
  useQuery({ queryKey: ['budgets', month, year], queryFn: () => budgetApi.list(month, year), placeholderData: (prev) => prev })

export const useCurrentBudgets = () => useQuery({ queryKey: ['budgets', 'current'], queryFn: budgetApi.current })

export const useMonthlyReport = (month, year, period = 'calendar') =>
  useQuery({ queryKey: ['reports', 'monthly', month, year, period], queryFn: () => reportApi.monthly(month, year, period), enabled: !!month && !!year, placeholderData: (prev) => prev })

export const useYearlyReport = (year) =>
  useQuery({ queryKey: ['reports', 'yearly', year], queryFn: () => reportApi.yearly(year), placeholderData: (prev) => prev })

export const useAnalysis = (year, enabled = true) =>
  useQuery({ queryKey: ['analysis', year], queryFn: () => analysisApi.get(year), enabled, staleTime: 30 * 60 * 1000, retry: 0 })

export const useNotifications = (page = 1, limit = 20) =>
  useQuery({ queryKey: ['notifications', page, limit], queryFn: () => notificationApi.list(page, limit), refetchInterval: 60_000 })

export const useRecurring = () => useQuery({ queryKey: ['recurring'], queryFn: recurringApi.list, select: list })

export const useDebts = (params) => useQuery({ queryKey: ['debts', params], queryFn: () => debtApi.list(params) })

export const useDebt = (id) => useQuery({ queryKey: ['debts', 'detail', id], queryFn: () => debtApi.get(id), enabled: !!id })

export const useAdminSummary = () => useQuery({ queryKey: ['admin', 'summary'], queryFn: adminApi.summary, refetchInterval: 60_000 })

export const useAdminUsers = (params) =>
  useQuery({ queryKey: ['admin', 'users', params], queryFn: () => adminApi.users(params), select: list, placeholderData: (prev) => prev })

export const useAdminInvites = () => useQuery({ queryKey: ['admin', 'invites'], queryFn: adminApi.invites, select: list })

export const useAdminLogs = () => useQuery({ queryKey: ['admin', 'logs'], queryFn: adminApi.logs, select: list })

export const useAdminUser = (id) => useQuery({ queryKey: ['admin', 'user', id], queryFn: () => adminApi.user(id), enabled: !!id })

export const useAdminActivity = (params) =>
  useQuery({ queryKey: ['admin', 'activity', params], queryFn: () => adminApi.activity(params), select: list, placeholderData: (prev) => prev, refetchInterval: 60_000 })

export const useAdminAnnouncements = () => useQuery({ queryKey: ['admin', 'announcements'], queryFn: adminApi.announcements, select: list })

export const useActiveAnnouncements = () =>
  useQuery({ queryKey: ['announcements'], queryFn: announcementApi.active, select: list, staleTime: 5 * 60_000, refetchInterval: 5 * 60_000 })

export const useGoals = () => useQuery({ queryKey: ['goals'], queryFn: goalApi.list, select: list })

// Hampir semua perubahan data menggeser saldo, anggaran, dan laporan sekaligus,
// jadi setelah mutasi semua cache disegarkan kecuali analisis AI yang mahal.
export function useAction(fn, options = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    ...options,
    onSuccess: async (data, vars, ctx) => {
      await qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'analysis' })
      options.onSuccess?.(data, vars, ctx)
    },
  })
}
