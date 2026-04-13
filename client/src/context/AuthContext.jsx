import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const syncFighterIfNeeded = (userData) => {
    if (userData?.role === 'fighter') {
      api.post('/fighters/sync').catch(() => {})
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data)
          syncFighterIfNeeded(res.data)
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data)
    syncFighterIfNeeded(data)
    return data
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    localStorage.setItem('token', data.token)
    // Fetch full profile so fighter fields are immediately available
    const { data: me } = await api.get('/auth/me')
    setUser(me)
    return data
  }

  const updateUser = async (fields) => {
    const { data } = await api.put('/auth/me', fields)
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
