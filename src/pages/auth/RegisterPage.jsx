// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }) => register(name, email, password),
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (error) => {
      setError(error.message || 'Registrasi gagal. Silakan coba lagi.');
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Semua field harus diisi');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8f0fe] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex">
        
        {/* LEFT: Info Panel — hidden on mobile */}
        <div className="hidden lg:flex w-1/2 bg-blue-600 rounded-l-3xl flex-col items-center justify-center p-10 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full -translate-y-1/3 -translate-x-1/3 opacity-50" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-700 rounded-full translate-y-1/3 translate-x-1/3 opacity-50" />

          {/* Icon */}
          <div className="relative z-10 bg-blue-500 rounded-3xl p-6 mb-6 shadow-xl">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="6" y1="40" x2="42" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6"/>
              <rect x="9" y="26" width="7" height="14" rx="3" fill="white" fillOpacity="0.35"/>
              <rect x="20" y="14" width="7" height="26" rx="3" fill="white" fillOpacity="0.7"/>
              <rect x="31" y="20" width="7" height="20" rx="3" fill="white" fillOpacity="0.5"/>
              <path d="M12.5 28 L23.5 16 L34.5 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9"/>
              <circle cx="12.5" cy="28" r="2" fill="white" fillOpacity="0.9"/>
              <circle cx="23.5" cy="16" r="2" fill="white" fillOpacity="0.9"/>
              <circle cx="34.5" cy="22" r="2" fill="white" fillOpacity="0.9"/>
              <path d="M38 8 L42 4 M42 4 L38 4 M42 4 L42 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7"/>
            </svg>
          </div>

          <h2 className="relative z-10 text-2xl font-extrabold text-center mb-3">Kelola Keuangan Anda</h2>
          <p className="relative z-10 text-blue-100 text-sm text-center leading-relaxed max-w-xs mb-8">
            Pantau pemasukan dan pengeluaran dengan mudah. Mulai perjalanan finansial Anda hari ini.
          </p>

          {/* Features */}
          <div className="relative z-10 w-full space-y-3 max-w-xs">
            <div className="bg-blue-500 bg-opacity-60 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-green-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Gratis Selamanya</p>
                <p className="text-white font-extrabold text-lg">Tanpa Biaya</p>
              </div>
            </div>
            <div className="bg-blue-500 bg-opacity-60 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-purple-300 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Laporan Otomatis</p>
                <p className="text-white font-extrabold text-lg">Real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
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
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Bergabung Sekarang</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Buat Akun</h1>
            <p className="text-gray-500 text-sm mt-1">Daftar gratis dan mulai kelola keuangan Anda</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Nama Lengkap
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
                <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="John Doe"
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="nama@email.com"
                  disabled={registerMutation.isPending}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={registerMutation.isPending}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 ml-2">
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Konfirmasi Password
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
                <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={registerMutation.isPending}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 ml-2">
                  {showConfirm ? (
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200 mt-2"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Loading...
                </span>
              ) : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-bold">
              Masuk
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;