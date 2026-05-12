import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthUser { id: number; firstName: string; lastName: string; email: string; token: string }
interface AuthContextType { user: AuthUser | null; login: (u: AuthUser) => void; logout: () => void }

const AuthContext = createContext<AuthContextType>(null!)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (u: AuthUser) => {
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('token', u.token)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

