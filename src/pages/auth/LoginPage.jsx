// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Login gagal. Silakan coba lagi.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8f0fe] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex">
        
        {/* LEFT: Form Panel */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-blue-600">DompetKu</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Selamat Datang Kembali</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Masuk Akun</h1>
            <p className="text-gray-500 text-sm mt-1">Lanjutkan pengelolaan aset Anda</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
                <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="nama@email.com"
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
                <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <a href="#" className="text-sm text-blue-500 hover:underline font-medium">Lupa password?</a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Loading...
                </span>
              ) : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-bold">
              Daftar gratis
            </Link>
          </p>
        </div>

        {/* RIGHT: Info Panel — hidden on mobile */}
        <div className="hidden lg:flex w-1/2 bg-blue-600 rounded-r-3xl flex-col items-center justify-center p-10 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -translate-y-1/3 translate-x-1/3 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-700 rounded-full translate-y-1/3 -translate-x-1/3 opacity-50" />

          {/* Icon */}
          <div className="relative z-10 bg-blue-500 rounded-3xl p-6 mb-6 shadow-xl">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Wallet body */}
              <rect x="4" y="12" width="40" height="28" rx="6" fill="white" fillOpacity="0.25"/>
              <rect x="4" y="12" width="40" height="28" rx="6" stroke="white" strokeWidth="2.5" strokeOpacity="0.6"/>
              {/* Wallet flap */}
              <path d="M4 20H44" stroke="white" strokeWidth="2.5" strokeOpacity="0.6"/>
              {/* Coin pocket */}
              <rect x="30" y="24" width="14" height="10" rx="4" fill="white" fillOpacity="0.35"/>
              {/* Coin dot */}
              <circle cx="37" cy="29" r="2.5" fill="white" fillOpacity="0.9"/>
              {/* Card lines */}
              <rect x="10" y="26" width="12" height="2" rx="1" fill="white" fillOpacity="0.7"/>
              <rect x="10" y="31" width="8" height="2" rx="1" fill="white" fillOpacity="0.5"/>
              {/* Top flap */}
              <path d="M12 12V10C12 7.79 13.79 6 16 6H32C34.21 6 36 7.79 36 10V12" stroke="white" strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 className="relative z-10 text-2xl font-extrabold text-center mb-3">Keamanan Prioritas</h2>
          <p className="relative z-10 text-blue-100 text-sm text-center leading-relaxed max-w-xs mb-8">
            Akses akun Anda dengan enkripsi tingkat tinggi untuk keamanan maksimal.
          </p>

          {/* Stats */}
          <div className="relative z-10 w-full space-y-3 max-w-xs">
            <div className="bg-blue-500 bg-opacity-60 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Uptime Sistem</p>
                <p className="text-white font-extrabold text-lg">99.9%</p>
              </div>
            </div>
            <div className="bg-blue-500 bg-opacity-60 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-blue-300 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Proteksi Akun</p>
                <p className="text-white font-extrabold text-lg">Aktif</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;