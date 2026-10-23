import axios from 'axios'

export const API_URL = (import.meta.env.VITE_API_URL || 'https://dompetku-backend.onrender.com/api').replace(/\/$/, '')
export const SERVER_URL = API_URL.replace(/\/api$/, '')

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

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
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const isAuthCall = error.config?.url?.startsWith('/auth/')
    if (status === 401 && !isAuthCall) {
      session.clear()
      if (!location.pathname.startsWith('/masuk')) location.assign('/masuk')
    }
    let message = error.response?.data?.message
    if (!message) {
      if (error.code === 'ECONNABORTED') message = 'Server lama merespons. Coba lagi sebentar lagi.'
      else if (!error.response) message = 'Tidak bisa terhubung ke server. Periksa koneksi internet.'
      else message = 'Terjadi kesalahan di server.'
    }
    return Promise.reject(new ApiError(message, status))
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

export async function download(url, params, filename) {
  const res = await http.get(url, { params: clean(params), responseType: 'blob' })
  const href = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}

export const assetUrl = (path) => (!path ? '' : /^https?:/.test(path) ? path : `${SERVER_URL}${path}`)
