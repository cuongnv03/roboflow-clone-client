// src/services/authService.ts
import axios from 'axios';

// Define types for user data and API responses (adjust based on backend)
interface User {
  userId: number;
  username: string;
  email: string;
}

interface AuthResponse {
  status: 'success' | 'fail' | 'error';
  data?: {
    token: string;
    user: User;
  };
  message?: string;
}

interface ProfileResponse {
  status: 'success' | 'fail' | 'error';
  data?: User;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
axios.defaults.baseURL = API_BASE_URL;

// Function to set the default Authorization header for Axios
const setAxiosAuthHeader = (token: string | null) => {
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  console.log(
    'AuthService - Axios Auth header set:',
    axios.defaults.headers.common['Authorization'] ? 'Token present' : 'Token removed',
  );
};

// Initialize Axios header on service load
const initializeAuthHeader = (token: string | null) => {
  setAxiosAuthHeader(token);
};

const login = async (identifier: string, password: string): Promise<{ token: string; user: User } | null> => {
  try {
    const response = await axios.post<AuthResponse>('/users/login', { email: identifier, password });
    if (response.data.status === 'success' && response.data.data?.token && response.data.data?.user) {
      setAxiosAuthHeader(response.data.data.token);
      return { token: response.data.data.token, user: response.data.data.user };
    } else {
      throw new Error(response.data.message || 'Login failed: Invalid response from server.');
    }
  } catch (error: any) {
    console.error('AuthService - Login API error:', error);
    throw error.response?.data?.message || error.message || 'An unknown error occurred during login.';
  }
};

const register = async (username: string, email: string, password: string): Promise<void> => {
  try {
    const response = await axios.post<AuthResponse>('/users/register', {
      username,
      email,
      password,
      password_confirm: password,
    });
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Registration failed.');
    }
  } catch (error: any) {
    console.error('AuthService - Registration API error:', error);
    throw error.response?.data?.message || error.message || 'Registration failed.';
  }
};

const fetchUserProfile = async (): Promise<User | null> => {
  try {
    const response = await axios.get<ProfileResponse>('/users/profile');
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    } else {
      console.warn('AuthService - Fetch Profile: Invalid response', response.data);
      return null;
    }
  } catch (error: any) {
    console.error('AuthService - Failed to fetch profile:', error);
    return null;
  }
};

const logout = () => {
  setAxiosAuthHeader(null);
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  console.log('AuthService - Logout: Token and user data removed.');
};

export default {
  initializeAuthHeader,
  login,
  register,
  fetchUserProfile,
  logout,
};
