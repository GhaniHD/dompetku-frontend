import { get, post, put, patch, del, http, download, downloadPost, postForm } from './client'

export const authApi = {
  login: (body) => post('/auth/login', body),
  register: (body) => post('/auth/register', body),
  checkInvite: (code) => get(`/auth/invite/${encodeURIComponent(code)}`),
  resetPassword: (body) => post('/auth/reset-password', body),
}

export const adminApi = {
  summary: () => get('/admin/summary'),
  users: (params) => get('/admin/users', params),
  approve: (id) => post(`/admin/users/${id}/approve`),
  reject: (id, reason) => post(`/admin/users/${id}/reject`, { reason }),
  suspend: (id, reason) => post(`/admin/users/${id}/suspend`, { reason }),
  activate: (id) => post(`/admin/users/${id}/activate`),
  remove: (id) => del(`/admin/users/${id}`),
  resetLink: (id) => post(`/admin/users/${id}/reset-link`),
  invites: () => get('/admin/invites'),
  createInvite: (body) => post('/admin/invites', body),
  revokeInvite: (id) => del(`/admin/invites/${id}`),
  logs: () => get('/admin/logs'),
}

export const backupApi = {
  export: (body) => downloadPost('/backup/export', body, 'myfulus-backup.dpk'),
  preview: (form) => postForm('/backup/preview', form),
  restore: (form) => postForm('/backup/restore', form),
}

export const profileApi = {
  get: () => get('/profile'),
  update: (body) => put('/profile', body),
  changePassword: (body) => put('/profile/password', body),
  updateCycle: (startDay) => put('/profile/budget-cycle', { start_day: startDay }),
  updateIncome: (body) => put('/profile/income', body),
  updateDailyCategories: (ids) => put('/profile/daily-categories', { category_ids: ids }),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return http.post('/profile/avatar', form).then((r) => r.data.data)
  },
  remove: (password) => http.delete('/profile', { data: { password } }).then((r) => r.data.data),
}

export const walletApi = {
  list: (includeArchived) => get('/wallets', { include_archived: includeArchived ? 'true' : undefined }),
  get: (id) => get(`/wallets/${id}`),
  total: () => get('/wallets/total-balance'),
  create: (body) => post('/wallets', body),
  update: (id, body) => put(`/wallets/${id}`, body),
  remove: (id) => del(`/wallets/${id}`),
  adjust: (id, body) => post(`/wallets/${id}/adjust`, body),
  openingIncome: (id, body) => post(`/wallets/${id}/opening-income`, body),
  adjustments: (id) => get(`/wallets/${id}/adjustments`),
  history: (id, params) => get(`/wallets/${id}/history`, params),
}

export const categoryApi = {
  list: (type) => get('/categories', { type }),
  create: (body) => post('/categories', body),
  update: (id, body) => put(`/categories/${id}`, body),
  remove: (id) => del(`/categories/${id}`),
}

export const transactionApi = {
  list: (params) => get('/transactions', params),
  get: (id) => get(`/transactions/${id}`),
  create: (body) => post('/transactions', body),
  update: (id, body) => put(`/transactions/${id}`, body),
  remove: (id) => del(`/transactions/${id}`),
}

export const transferApi = {
  list: (params) => get('/transfers', params),
  create: (body) => post('/transfers', body),
  remove: (id) => del(`/transfers/${id}`),
}

export const budgetApi = {
  list: (month, year) => get('/budgets', { month, year }),
  current: () => get('/budgets/current'),
  create: (body) => post('/budgets', body),
  update: (id, body) => put(`/budgets/${id}`, body),
  remove: (id) => del(`/budgets/${id}`),
  copy: (body) => post('/budgets/copy', body),
}

export const reportApi = {
  monthly: (month, year, period) => get('/reports', { month, year, period }),
  yearly: (year) => get('/reports/yearly', { year }),
}

export const analysisApi = {
  get: (year) => get('/analysis', { year }),
}

export const notificationApi = {
  list: (page = 1, limit = 20) => get('/notifications', { page, limit }),
  read: (id) => patch(`/notifications/${id}/read`),
  readAll: () => patch('/notifications/read-all'),
  remove: (id) => del(`/notifications/${id}`),
  clear: () => del('/notifications/clear'),
}

export const recurringApi = {
  list: () => get('/recurring'),
  create: (body) => post('/recurring', body),
  update: (id, body) => put(`/recurring/${id}`, body),
  remove: (id) => del(`/recurring/${id}`),
}

export const debtApi = {
  list: (params) => get('/debts', params),
  get: (id) => get(`/debts/${id}`),
  create: (body) => post('/debts', body),
  update: (id, body) => put(`/debts/${id}`, body),
  remove: (id) => del(`/debts/${id}`),
  pay: (id, body) => post(`/debts/${id}/payments`, body),
  removePayment: (id, paymentId) => del(`/debts/${id}/payments/${paymentId}`),
}

export const goalApi = {
  list: () => get('/goals'),
  create: (body) => post('/goals', body),
  update: (id, body) => put(`/goals/${id}`, body),
  remove: (id) => del(`/goals/${id}`),
}

export const exportApi = {
  report: (start, end, name) => download('/export/report.xlsx', { start, end }, name),
  transactionsXlsx: (start, end, name) => download('/export/transactions.xlsx', { start, end }, name),
  transfersXlsx: (start, end, name) => download('/export/transfers.xlsx', { start, end }, name),
  transactions: (params, name) => download('/export/transactions.csv', params, name),
  transfers: (params, name) => download('/export/transfers.csv', params, name),
}
