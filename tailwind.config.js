const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: v('canvas'),
        surface: v('surface'),
        sunken: v('sunken'),
        ink: v('ink'),
        muted: v('muted'),
        faint: v('faint'),
        line: v('line'),
        violet: {
          DEFAULT: v('violet'),
          deep: v('violet-deep'),
          soft: v('violet-soft'),
          ink: v('violet-ink'),
        },
        income: { DEFAULT: v('income'), soft: v('income-soft') },
        expense: { DEFAULT: v('expense'), soft: v('expense-soft') },
        caution: { DEFAULT: v('caution'), soft: v('caution-soft') },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"Bricolage Grotesque"', '"Plus Jakarta Sans Variable"', 'sans-serif'],
      },
      borderRadius: {
        shell: '28px',
        panel: '20px',
      },
      boxShadow: {
        lift: '0 1px 0 rgb(var(--line)), 0 12px 32px -18px rgb(var(--ink) / 0.25)',
        pop: '0 24px 60px -20px rgb(29 25 49 / 0.35)',
      },
    },
  },
  plugins: [],
}
