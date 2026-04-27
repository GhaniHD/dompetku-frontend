// src/services/api.js
import axiosInstance from '../config/axios';

// ============================================
// AUTH APIs
// ============================================
export const authAPI = {
  // Login
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      // Simpan token dan user ke localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login gagal' };
    }
  },

  // Register
  register: async (name, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
      });
      
      // Simpan token dan user ke localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registrasi gagal' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user dari localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Gagal parsing user dari localStorage', error);
        return null;
      }
    }
    return null;
  },

  // Get user profile dari server
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil profile', error);
      throw error.response?.data || { message: 'Gagal mengambil profile' };
    }
  },

  // Check apakah user sudah login
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
};

// ============================================
// TRANSACTION APIs
// ============================================
export const transactionAPI = {
  // Get all transactions
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil transaksi' };
    }
  },

  // Get transaction by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil detail transaksi' };
    }
  },

  // Create new transaction
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/transactions', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal membuat transaksi' };
    }
  },

  // Update transaction
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengupdate transaksi' };
    }
  },

  // Delete transaction
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal menghapus transaksi' };
    }
  },

  // Get transactions by date range
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await axiosInstance.get('/transactions', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil transaksi' };
    }
  },

  // Get transactions by category
  getByCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.get('/transactions', {
        params: { category_id: categoryId },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil transaksi' };
    }
  },
};

// ============================================
// WALLET APIs
// ============================================
export const walletAPI = {
  // Get all wallets
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/wallets');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil dompet' };
    }
  },

  // Get wallet by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/wallets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil detail dompet' };
    }
  },

  // Create new wallet
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/wallets', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal membuat dompet' };
    }
  },

  // Update wallet
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/wallets/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengupdate dompet' };
    }
  },

  // Delete wallet
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/wallets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal menghapus dompet' };
    }
  },

  // Get wallet balance
  getBalance: async (id) => {
    try {
      const response = await axiosInstance.get(`/wallets/${id}/balance`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil saldo' };
    }
  },
};

// ============================================
// BUDGET APIs
// ============================================
export const budgetAPI = {
  // Get all budgets
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/budgets', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil budget' };
    }
  },

  // Get budget by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil detail budget' };
    }
  },

  // Create new budget
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/budgets', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal membuat budget' };
    }
  },

  // Update budget
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/budgets/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengupdate budget' };
    }
  },

  // Delete budget
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal menghapus budget' };
    }
  },

  // Get budget status/progress
  getStatus: async (id) => {
    try {
      const response = await axiosInstance.get(`/budgets/${id}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil status budget' };
    }
  },

 copy: async (data) => {
  try {
    console.log('Headers yang akan dikirim:', axiosInstance.defaults.headers);
    console.log('Token saat copy:', localStorage.getItem('token'));
    const response = await axiosInstance.post('/budgets/copy', data);
    return response.data;
  } catch (error) {
    console.log('Error response:', error.response);
    throw error.response?.data || { message: 'Gagal menyalin budget' };
  }
},
 
};

// ============================================
// CATEGORY APIs
// ============================================
export const categoryAPI = {
  // Get all categories
  getAll: async (type = null) => {
    try {
      const params = type ? { type } : {};
      const response = await axiosInstance.get('/categories', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil kategori' };
    }
  },

  // Get category by ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil detail kategori' };
    }
  },

  // Create new category
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/categories', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal membuat kategori' };
    }
  },

  // Update category
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengupdate kategori' };
    }
  },

  // Delete category
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal menghapus kategori' };
    }
  },

  // Get income categories
  getIncomeCategories: async () => {
    return categoryAPI.getAll('income');
  },

  // Get expense categories
  getExpenseCategories: async () => {
    return categoryAPI.getAll('expense');
  },
};

// src/services/api.js — bagian profileAPI (tambahkan / ganti section ini di file api.js kamu)

// ============================================
// PROFILE APIs
// ============================================
export const profileAPI = {
  // Get user profile
  get: async () => {
    try {
      const response = await axiosInstance.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil profile' };
    }
  },

  // Update nama & email
  update: async (data) => {
    try {
      const response = await axiosInstance.put('/profile', data);
      // Sinkronkan cache 'user' di localStorage
      if (response.data?.data) {
        const existing = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...existing, ...response.data.data }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengupdate profile' };
    }
  },

  // Ganti password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await axiosInstance.put('/profile/password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengubah password' };
    }
  },

  // Upload foto avatar (multipart/form-data)
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axiosInstance.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Simpan avatar_url ke cache user
      if (response.data?.data?.avatar_url) {
        const existing = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...existing,
          avatar_url: response.data.data.avatar_url,
        }));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal upload avatar' };
    }
  },

  // Hapus akun (soft delete)
  deleteAccount: async () => {
    try {
      const response = await axiosInstance.delete('/profile');
      // Bersihkan semua data lokal setelah hapus
      localStorage.clear();
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal menghapus akun' };
    }
  },
};

// ============================================
// REPORT/ANALYSIS APIs
// ============================================
export const reportAPI = {
  // GET /api/reports?month=&year=
  getMonthly: async (year, month) => {
    try {
      const response = await axiosInstance.get('/reports', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil laporan bulanan' };
    }
  },
 
  // GET /api/reports/yearly?year=
  getYearly: async (year) => {
    try {
      const response = await axiosInstance.get('/reports/yearly', {
        params: { year },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil laporan tahunan' };
    }
  },
};
 

// ============================================
// DASHBOARD APIs
// ============================================
export const dashboardAPI = {
  // Get dashboard overview
  getOverview: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil data dashboard' };
    }
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 5) => {
    try {
      const response = await axiosInstance.get('/dashboard/recent-transactions', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil transaksi terbaru' };
    }
  },

  // Get spending chart data
  getSpendingChart: async (period = 'month') => {
    try {
      const response = await axiosInstance.get('/dashboard/spending-chart', {
        params: { period }, // 'week', 'month', 'year'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mengambil data chart' };
    }
  },
};