export interface User {
  userId: number
  username: string
  email: string
  isActive?: boolean
  createdAt?: string
}

export interface AuthResponse {
  status: string
  message?: string
  data?: {
    token: string
    user: User
  }
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
