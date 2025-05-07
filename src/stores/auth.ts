import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type { User, AuthError } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<AuthError | null>(null)

  // Initialize user from localStorage if available
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('Failed to parse stored user:', e)
      localStorage.removeItem('user')
    }
  }

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)
  const isLoading = computed(() => loading.value)
  const authError = computed(() => error.value)

  // Actions
  const setAuthData = (newToken: string | null, newUser: User | null) => {
    token.value = newToken
    user.value = newUser
    error.value = null

    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }

    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }

    // Update authorization header
    authService.setAuthHeader(newToken)
  }

  const login = async (email: string, password: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(email, password)
      setAuthData(response.token, response.user)
    } catch (err: any) {
      const message = err.message || 'Failed to login'
      error.value = { message, errors: err.errors }
      setAuthData(null, null)
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.register(username, email, password)
      // Some APIs automatically log in the user after registration
      // Otherwise, just set a success message
      if (response.token && response.user) {
        setAuthData(response.token, response.user)
      }
    } catch (err: any) {
      const message = err.message || 'Failed to register'
      error.value = { message, errors: err.errors }
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = (): void => {
    authService.logout()
    setAuthData(null, null)
  }

  const checkAuth = (): void => {
    if (token.value) {
      authService.setAuthHeader(token.value)

      // Optionally verify the token with the server
      if (!user.value) {
        fetchUserProfile()
      }
    }
  }

  const fetchUserProfile = async (): Promise<void> => {
    if (!token.value) return

    loading.value = true
    try {
      const userData = await authService.fetchUserProfile()
      if (userData) {
        user.value = userData
      } else {
        // Token may be invalid
        logout()
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      logout()
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    token,
    user,
    loading,
    error,

    // Getters
    isAuthenticated,
    currentUser,
    isLoading,
    authError,

    // Actions
    login,
    register,
    logout,
    checkAuth,
    fetchUserProfile,
    setAuthData,
  }
})
