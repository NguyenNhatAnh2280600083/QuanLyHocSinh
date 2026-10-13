import * as React from 'react'
import type { UserAccount } from '@/types'
import { api } from '@/services/api'

interface AuthContextValue {
  user: UserAccount | null
  permissions: string[]
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('edumanage_user')
      return stored ? JSON.parse(stored) as UserAccount : null
    } catch {
      localStorage.removeItem('edumanage_user')
      return null
    }
  })
  const [permissions, setPermissions] = React.useState<string[]>(() => {
    try {
      const storedPerms = localStorage.getItem('edumanage_permissions')
      return storedPerms ? JSON.parse(storedPerms) as string[] : []
    } catch {
      localStorage.removeItem('edumanage_permissions')
      return []
    }
  })

  const login = React.useCallback(async (username: string, password: string) => {
    const result = await api.login(username, password)
    if (result) {
      setUser(result.user)
      setPermissions(result.permissions)
      localStorage.setItem('edumanage_user', JSON.stringify(result.user))
      localStorage.setItem('edumanage_permissions', JSON.stringify(result.permissions))
      return true
    }
    return false
  }, [])

  const logout = React.useCallback(() => {
    setUser(null)
    setPermissions([])
    localStorage.removeItem('edumanage_user')
    localStorage.removeItem('edumanage_permissions')
  }, [])

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
