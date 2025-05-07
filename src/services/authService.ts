import axios from 'axios'
import type { AuthResponse, User } from '@/types/auth'

// Default API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Set base URL for axios
axios.defaults.baseURL = API_URL

// Set auth header for requests
const setAuthHeader = (token: string | null): void => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

// Login user
const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<{ status: string; message?: string; data?: AuthResponse }>(
      '/auth/login',
      {
        email,
        password,
      },
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Login failed')
  } catch (error: any) {
    if (error.response?.data) {
      const { message, errors } = error.response.data
      const err = new Error(message || 'Login failed')
      ;(err as any).errors = errors
      throw err
    }
    throw error
  }
}

// Register user
const register = async (
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<{ status: string; message?: string; data?: AuthResponse }>(
      '/auth/register',
      {
        username,
        email,
        password,
      },
    )

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Registration failed')
  } catch (error: any) {
    if (error.response?.data) {
      const { message, errors } = error.response.data
      const err = new Error(message || 'Registration failed')
      ;(err as any).errors = errors
      throw err
    }
    throw error
  }
}

// Fetch user profile
const fetchUserProfile = async (): Promise<User | null> => {
  try {
    const response = await axios.get<{ status: string; message?: string; data?: User }>(
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

// Logout - no server call needed with JWT
const logout = (): void => {
  delete axios.defaults.headers.common['Authorization']
}

export default {
  setAuthHeader,
  login,
  register,
  fetchUserProfile,
  logout,
}
