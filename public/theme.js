try {
  const t = localStorage.getItem('dompetku_theme')
  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
} catch {
  // localStorage diblokir: pakai tema terang
}
