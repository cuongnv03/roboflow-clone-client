import axios from 'axios'
import type { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/user'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Initialize Axios with base URL
axios.defaults.baseURL = API_BASE_URL

// Function to set the Authorization header
const initializeAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

// Login user
const login = async (
  identifier: string,
  password: string,
): Promise<{ token: string; user: User }> => {
  try {
    const response = await axios.post<AuthResponse>('/auth/login', { email: identifier, password })

    if (response.data.status === 'success' && response.data.data) {
      return {
        token: response.data.data.token,
        user: response.data.data.user,
      }
    }

    throw new Error(response.data.message || 'Login failed')
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Authentication failed')
    }
    throw error
  }
}

// Register user
const register = async (username: string, email: string, password: string): Promise<void> => {
  try {
    const response = await axios.post<AuthResponse>('/auth/register', {
      username,
      email,
      password,
    })

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Registration failed')
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed')
    }
    throw error
  }
}

// Fetch user profile
const fetchUserProfile = async (): Promise<User | null> => {
  try {
    const response = await axios.get<{ status: string; data?: User; message?: string }>(
      '/users/profile',
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    return null
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }
}

// Logout
const logout = () => {
  // Clear token from headers
  delete axios.defaults.headers.common['Authorization']
  // No server call needed as we're using JWT
}

export default {
  initializeAuthHeader,
  login,
  register,
  fetchUserProfile,
  logout,
}
