// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/services/authService'; // Import auth service

// Define types for user data (adjust based on backend)
interface User {
  userId: number;
  username: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  // Initialize state from localStorage
  const token = ref<string | null>(localStorage.getItem('authToken') || null);
  const user = ref<User | null>(() => {
    const storedUser = localStorage.getItem('authUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse stored user:', e);
      localStorage.removeItem('authUser'); // Clear invalid stored data
      return null;
    }
  });
  const loading = ref(false); // Add loading state
  const error = ref<string | null>(null); // Add error state

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value && !!user.value); // Check both token and user
  const authToken = computed(() => token.value);
  const currentUser = computed(() => user.value);
  const isLoading = computed(() => loading.value);
  const authError = computed(() => error.value);

  // --- Actions ---

  // Function to set auth data (token and user) and store it
  function setAuthData(newToken: string | null, newUser: User | null) {
    token.value = newToken;
    user.value = newUser;
    error.value = null; // Clear error on successful auth change

    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
    if (newUser) {
      localStorage.setItem('authUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('authUser');
    }
    // The Axios header is now managed in the authService
  }

  // Login Action
  async function login(identifier: string, password: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const authData = await authService.login(identifier, password);
      setAuthData(authData?.token, authData?.user);
    } catch (err: any) {
      const message = err.message || 'An unknown error occurred during login.';
      error.value = message;
      setAuthData(null, null); // Ensure logout on failure
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  }

  async function register(username: string, email: string, password: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await authService.register(username, email, password);
      console.log('Registration successful');
      // Optionally, automatically login the user after registration
      // await login(email, password);
    } catch (err: any) {
      const message = err.message || 'An unknown error occurred during registration.';
      error.value = message;
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    console.log('Logging out via store action');
    authService.logout(); // Clear token in service (and localStorage)
    setAuthData(null, null);
    // Actual redirection should happen where logout is called or via router guard
  }

  async function fetchUserProfile() {
    if (!token.value) return;

    loading.value = true;
    try {
      const profile = await authService.fetchUserProfile();
      if (profile) {
        user.value = profile;
      } else {
        logout(); // Token có thể không hợp lệ
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      logout(); // Token có thể không hợp lệ
    } finally {
      loading.value = false;
    }
  }

  // checkAuth is now primarily for initializing auth state on app load
  function checkAuth() {
    console.log('Checking auth status from localStorage...');
    authService.initializeAuthHeader(token.value); // Initialize Axios header
    if (token.value && !user.value) {
      fetchUserProfile();
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
  };
});
