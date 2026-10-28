import axios from 'axios'

export const API_URL = (import.meta.env.VITE_API_URL || 'https://dompetku-backend.onrender.com/api').replace(/\/$/, '')
export const SERVER_URL = API_URL.replace(/\/api$/, '')

const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const NOTICE_KEY = 'logout_notice'

// Pesan alasan keluar paksa, ditampilkan sekali di halaman masuk.
export const logoutNotice = {
  set: (message) => {
    try {
      sessionStorage.setItem(NOTICE_KEY, message)
    } catch {
      /* penyimpanan diblokir: abaikan */
    }
  },
  take: () => {
    try {
      const message = sessionStorage.getItem(NOTICE_KEY)
      sessionStorage.removeItem(NOTICE_KEY)
      return message || ''
    } catch {
      return ''
    }
  },
}

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  },
  save: (token, user) => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

export const http = axios.create({ baseURL: API_URL, timeout: 30000 })

http.interceptors.request.use((config) => {
  const token = session.token()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export class ApiError extends Error {
  constructor(message, status, code = '', data = null) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}

// Respons berjenis blob (unduhan file) menyimpan pesan error sebagai JSON di dalam blob.
async function blobJSON(data) {
  try {
    return JSON.parse(await data.text())
  } catch {
    return null
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.data instanceof Blob) error.response.data = await blobJSON(error.response.data)
    const status = error.response?.status
    const url = error.config?.url || ''
    const isCredentialCheck = url.startsWith('/auth/') || url === '/profile/password'
    if (status === 401 && !isCredentialCheck) {
      session.clear()
      if (error.response?.data?.code) logoutNotice.set(error.response.data.message)
      if (!location.pathname.startsWith('/masuk')) location.assign('/masuk')
    }
    let message = error.response?.data?.message
    if (!message) {
      if (error.code === 'ECONNABORTED') message = 'Server lama merespons. Coba lagi sebentar lagi.'
      else if (!error.response) message = 'Tidak bisa terhubung ke server. Periksa koneksi internet.'
      else message = 'Terjadi kesalahan di server.'
    }
    const body = error.response?.data
    return Promise.reject(new ApiError(message, status, body?.code || '', body?.data ?? null))
  }
)

// Sebagian besar endpoint membungkus hasil dalam { success, message, data };
// login mengembalikan objeknya langsung.
const unwrap = (res) => (res.data && typeof res.data === 'object' && 'success' in res.data ? res.data.data : res.data)

export const get = (url, params) => http.get(url, { params: clean(params) }).then(unwrap)
export const post = (url, body) => http.post(url, body).then(unwrap)
export const put = (url, body) => http.put(url, body).then(unwrap)
export const patch = (url, body) => http.patch(url, body).then(unwrap)
export const del = (url) => http.delete(url).then(unwrap)

function clean(params) {
  if (!params) return undefined
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

function saveBlob(blob, filename) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}

export async function download(url, params, filename) {
  const res = await http.get(url, { params: clean(params), responseType: 'blob' })
  saveBlob(res.data, filename)
}

export async function downloadPost(url, body, fallbackName) {
  const res = await http.post(url, body, { responseType: 'blob', timeout: 120000 })
  const match = /filename="([^"]+)"/.exec(res.headers['content-disposition'] || '')
  saveBlob(res.data, match ? match[1] : fallbackName)
}

export const postForm = (url, form) => http.post(url, form, { timeout: 120000 }).then(unwrap)

export const assetUrl = (path) => (!path ? '' : /^https?:/.test(path) ? path : `${SERVER_URL}${path}`)
