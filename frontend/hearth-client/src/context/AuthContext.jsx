import { useState } from 'react'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hearth_token'))
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hearth_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = (authData) => {
    const userData = {
      email: authData.email,
      fullName: authData.fullName,
    }

    localStorage.setItem('hearth_token', authData.token)
    localStorage.setItem('hearth_user', JSON.stringify(userData))
    setToken(authData.token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('hearth_token')
    localStorage.removeItem('hearth_user')
    setToken(null)
    setUser(null)
  }

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: Boolean(token),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
