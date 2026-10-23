import { useCallback, useState } from 'react'

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      try {
        localStorage.setItem('dompetku_theme', next ? 'dark' : 'light')
      } catch {
        /* mode privat */
      }
      return next
    })
  }, [])
  return { dark, toggle }
}
