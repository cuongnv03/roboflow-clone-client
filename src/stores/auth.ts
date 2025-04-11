import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios' // Import axios

// Define types for user data and API responses (adjust based on backend)
interface User {
  userId: number
  username: string
  email: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1' // Ensure this matches your backend port
axios.defaults.baseURL = API_BASE_URL

// Function to set the default Authorization header for Axios
const setAxiosAuthHeader = (token: string | null) => {
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : ''
  console.log(
    'Axios Auth header set:',
    axios.defaults.headers.common['Authorization'] ? 'Token present' : 'Token removed',
  )
}

export const useAuthStore = defineStore('auth', () => {
  // Initialize state from localStorage
  const token = ref<string | null>(localStorage.getItem('authToken') || null)
  const user = ref<User | null>(() => {
    const storedUser = localStorage.getItem('authUser')
    try {
      return storedUser ? JSON.parse(storedUser) : null
    } catch (e) {
      console.error('Failed to parse stored user:', e)
      localStorage.removeItem('authUser') // Clear invalid stored data
      return null
    }
  })
  const loading = ref(false) // Add loading state
  const error = ref<string | null>(null) // Add error state

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value && !!user.value) // Check both token and user
  const authToken = computed(() => token.value)
  const currentUser = computed(() => user.value)
  const isLoading = computed(() => loading.value)
  const authError = computed(() => error.value)

  // --- Actions ---

  // Function to set auth data (token and user) and store it
  function setAuthData(newToken: string | null, newUser: User | null) {
    token.value = newToken
    user.value = newUser
    error.value = null // Clear error on successful auth change

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
    // Set Axios default header whenever auth data changes
    console.log('setAuthData - New Token:', newToken)
    console.log(
      'setAuthData - Axios Header BEFORE set:',
      axios.defaults.headers.common['Authorization'],
    )
    setAxiosAuthHeader(newToken)
    console.log(
      'setAuthData - Axios Header AFTER set:',
      axios.defaults.headers.common['Authorization'],
    )
  }

  // Initialize Axios header on store creation/hydration
  setAxiosAuthHeader(token.value)

  // Login Action
  async function login(identifier: string, password: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/users/login', { email: identifier, password })
      if (
        response.data.status === 'success' &&
        response.data.data.token &&
        response.data.data.user
      ) {
        setAuthData(response.data.data.token, response.data.data.user) // This now also sets the header
      } else {
        throw new Error(response.data.message || 'Login failed: Invalid response from server.')
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'An unknown error occurred during login.'
      error.value = message
      setAuthData(null, null) // Ensure logout on failure
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function register(username: string, email: string, password: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/users/register', {
        username,
        email,
        password,
        password_confirm: password,
      })
      if (response.data.status === 'success') {
        console.log('Registration successful')
      } else {
        throw new Error(
          response.data.message || 'Registration failed: Invalid response from server.',
        )
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred during registration.'
      error.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  function logout() {
    console.log('Logging out via store action')
    setAuthData(null, null)
    // Actual redirection should happen where logout is called or via interceptor
  }

  async function fetchUserProfile() {
    if (!token.value) return

    loading.value = true
    try {
      const response = await axios.get('/users/profile')
      if (response.data.status === 'success') {
        user.value = response.data.data
      } else {
        throw new Error('Invalid profile response')
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      // Token không hợp lệ hoặc hết hạn, logout
      logout()
    } finally {
      loading.value = false
    }
  }

  // checkAuth is now primarily for setting the initial header
  function checkAuth() {
    console.log('Checking auth status from localStorage...')

    if (token.value) {
      setAxiosAuthHeader(token.value)
      fetchUserProfile()
    }
  }

  return {
    // State
    token,
    user,
    loading, // Expose loading state
    error, // Expose error state

    // Getters
    isAuthenticated,
    authToken,
    currentUser,
    isLoading, // Expose computed loading state
    authError, // Expose computed error state

    // Actions
    login,
    register,
    logout,
    fetchUserProfile,
    checkAuth,
    setAuthData,
  }
})
