import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('ct_token'))
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => { localStorage.removeItem('ct_token'); setToken(null) }).finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])
  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    localStorage.setItem('ct_token', r.data.access_token); setToken(r.data.access_token); setUser(r.data.user); return r.data.user
  }
  const signup = async (name, email, password, ward) => {
    const r = await api.post('/auth/signup', { name, email, password, ward })
    localStorage.setItem('ct_token', r.data.access_token); setToken(r.data.access_token); setUser(r.data.user); return r.data.user
  }
  const logout = () => { localStorage.removeItem('ct_token'); setToken(null); setUser(null) }
  return <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)