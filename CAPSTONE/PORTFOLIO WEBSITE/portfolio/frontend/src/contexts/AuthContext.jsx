import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin-token'))

  async function login(email, password) {
    // Throws with meaningful message so AdminLoginForm can display it
    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/login`, { email, password })
      const t = res.data.access_token
      setToken(t)
      sessionStorage.setItem('admin-token', t)
    } catch (err) {
      // Re-throw with the server detail message attached
      const serverMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (err.message === 'Network Error' ? 'Cannot reach server. Is the backend running?' : 'Login failed')
      const e = new Error(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg))
      e.status = err.response?.status
      throw e
    }
  }

  function logout() {
    setToken(null)
    sessionStorage.removeItem('admin-token')
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}