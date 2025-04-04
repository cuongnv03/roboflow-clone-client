import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios' // Import axios

// Define types for user data and API responses (adjust based on backend)
interface User {
  userId: number
  username: string
  email: string
}

// Matches the success response structure from the backend
interface AuthApiResponse {
  success: boolean
  message?: string
  token?: string
  user?: User
  // Add other potential fields if needed
}

// Matches the error response structure from the backend
interface ApiErrorResponse {
  success: false
  status: number
  message: string
  stack?: string // Optional stack trace in dev
}

// --- Axios Configuration ---
// Define the base URL for your API
const API_BASE_URL = 'http://localhost:5000/api/v1' // Ensure this matches your backend port
axios.defaults.baseURL = API_BASE_URL

// Function to set the default Authorization header for Axios
const setAxiosAuthHeader = (token: string | null) => {
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : ''
  console.log(
    'Axios Auth header set:',
    axios.defaults.headers.common['Authorization'] ? 'Token present' : 'Token removed',
  )
}
// --- End Axios Configuration ---

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
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
      const response = await axios.post<AuthApiResponse>('/auth/login', { identifier, password })
      if (response.data.success && response.data.token && response.data.user) {
        setAuthData(response.data.token, response.data.user) // This now also sets the header
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
      const response = await axios.post<AuthApiResponse>('/auth/register', {
        username,
        email,
        password,
      })
      if (response.data.success && response.data.token && response.data.user) {
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

  // checkAuth is now primarily for setting the initial header
  function checkAuth() {
    console.log('Checking auth status from localStorage...')
    setAxiosAuthHeader(token.value)
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
    checkAuth,
    setAuthData,
  }
})
