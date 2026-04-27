// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // State untuk form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Mutation untuk login menggunakan TanStack Query
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      // Redirect ke dashboard jika sukses
      navigate('/dashboard');
    },
    onError: (error) => {
      // Tampilkan error jika gagal
      setError(error.message || 'Login gagal. Silakan coba lagi.');
    },
  });

  // Handle submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validasi sederhana
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    // Panggil mutation
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">DompetKu</h1>
          <p className="text-gray-600 mt-2">Masuk ke akun Anda</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nama@email.com"
              disabled={loginMutation.isPending}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loginMutation.isPending}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? 'Loading...' : 'Masuk'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;