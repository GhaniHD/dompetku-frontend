/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover:   '#4F46E5',
          light:   '#EEF2FF',
          ring:    '#C7D2FE',
        },
        success: {
          DEFAULT: '#10B981',
          light:   '#ECFDF5',
          text:    '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FFFBEB',
        },
        danger: {
          DEFAULT: '#EF4444',
          light:   '#FEF2F2',
          text:    '#B91C1C',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          light:   '#F5F3FF',
        },
        brand: {
          bg:      '#F8F9FF',
          surface: '#FFFFFF',
          border:  '#E5E7EB',
          dark:    '#1E1B4B',
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      borderRadius: {
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card:   '0 1px 4px rgba(0,0,0,0.06)',
        hover:  '0 8px 24px rgba(99,102,241,0.1)',
        button: '0 4px 14px rgba(99,102,241,0.3)',
      },
      keyframes: {
        floatAnim: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        float:    'floatAnim 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.4s ease both',
      },
    },
  },
  plugins: [],
};