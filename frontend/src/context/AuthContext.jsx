import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService.js'
import { getAccessToken, removeAccessToken } from '../utils/storage.js'

const AuthContext = createContext(undefined)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setIsLoading(false)
      return null
    }

    try {
      const responseData = await getCurrentUser()
      setUser(responseData.user)
      return responseData.user
    } catch (error) {
      const status = error?.response?.status

      if ([401, 404, 422].includes(status)) {
        removeAccessToken()
      }

      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => {
      void refreshUser()
    }, 0)

    return () => window.clearTimeout(initializationTimer)
  }, [refreshUser])

  const login = useCallback(async (credentials) => {
    const responseData = await loginRequest(credentials)
    setUser(responseData.user)
    return responseData
  }, [])

  const register = useCallback((credentials) => registerRequest(credentials), [])

  const logout = useCallback(() => {
    logoutRequest()
    setUser(null)
  }, [])

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    refreshUser,
    register,
  }), [isLoading, login, logout, refreshUser, register, user])

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export { AuthContext }
export default AuthProvider
