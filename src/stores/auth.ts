import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type { User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('authToken') || null)
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Initialize user from localStorage if available
  const storedUser = localStorage.getItem('authUser')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('Failed to parse stored user:', e)
      localStorage.removeItem('authUser')
    }
  }

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)
  const isLoading = computed(() => loading.value)
  const authError = computed(() => error.value)

  // Actions
  function setAuthData(newToken: string | null, newUser: User | null) {
    token.value = newToken
    user.value = newUser
    error.value = null

    if (newToken) {
      localStorage.setItem('authToken', newToken)
    } else {
      localStorage.removeItem('authToken')
    }

    if (newUser) {
      localStorage.setItem('authUser', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('authUser')
    }

    // Update Axios auth header
    authService.initializeAuthHeader(newToken)
  }

  async function login(identifier: string, password: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const authData = await authService.login(identifier, password)
      setAuthData(authData.token, authData.user)
    } catch (err: any) {
      const message = err.message || 'An unknown error occurred during login.'
      error.value = message
      setAuthData(null, null)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function register(username: string, email: string, password: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await authService.register(username, email, password)
      // Optionally, automatically login the user after registration
      await login(email, password)
    } catch (err: any) {
      const message = err.message || 'An unknown error occurred during registration.'
      error.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    authService.logout()
    setAuthData(null, null)
    // NOTE: Router redirect should happen where logout is called
  }

  async function fetchUserProfile() {
    if (!token.value) return

    loading.value = true
    try {
      const profile = await authService.fetchUserProfile()
      if (profile) {
        user.value = profile
      } else {
        logout() // Token may be invalid
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      logout() // Token may be invalid
    } finally {
      loading.value = false
    }
  }

  function checkAuth() {
    authService.initializeAuthHeader(token.value)
    if (token.value && !user.value) {
      fetchUserProfile()
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
    fetchUserProfile,
    checkAuth,
    setAuthData,
  }
})
