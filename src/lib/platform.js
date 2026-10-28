export const APK_URL = '/download/myfulus.apk'

export const isAndroid = () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)

export const isIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

// Sudah dibuka sebagai aplikasi (APK atau PWA terpasang), jadi ajakan unduh tidak perlu tampil.
export const isInstalledApp = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true || document.referrer.startsWith('android-app://')
}

export const showAppDownload = () => isAndroid() && !isInstalledApp()
