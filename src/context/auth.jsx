import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/endpoints'
import { session } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const [user, setUser] = useState(() => (session.token() ? session.user() : null))

  const finish = useCallback((res) => {
    session.save(res.token, res.user)
    setUser(res.user)
    return res
  }, [])

  const value = useMemo(
    () => ({
      user,
      login: (email, password) => authApi.login({ email, password }).then(finish),
      register: (name, email, password, inviteCode) =>
        authApi.register({ name, email, password, invite_code: inviteCode || undefined }).then((res) => (res.token ? finish(res) : res)),
      replaceToken: (token) => session.save(token, null),
      logout: () => {
        const token = session.token()
        if (token) authApi.logout(token).catch(() => {})
        session.clear()
        qc.clear()
        setUser(null)
      },
      patchUser: (patch) =>
        setUser((prev) => {
          const next = { ...prev, ...patch }
          session.save(null, next)
          return next
        }),
    }),
    [user, finish, qc]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
