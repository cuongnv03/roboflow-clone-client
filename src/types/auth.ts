export interface User {
  id: number
  username: string
  email: string
  isActive?: boolean
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface AuthError {
  message: string
  errors?: Record<string, string>
}
