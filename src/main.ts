import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import axios from 'axios' // Import axios
import router from './router'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

// Create Vue app
const app = createApp(App)

// 1. Use Pinia
app.use(createPinia())

// 2. Initialize auth store *after* Pinia is installed
// This ensures Axios headers are set correctly if a token exists in localStorage
const authStore = useAuthStore()
authStore.checkAuth() // Initialize header from localStorage token

// --- Setup Axios Interceptor ---
// This runs *after* the store is initialized and checkAuth has run
axios.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do nothing, just return response
    return response
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.log(
      'Axios error interceptor caught:',
      error.response?.status,
      error.response?.data?.message,
    )
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.log('Interceptor: Detected 401 Unauthorized. Logging out.')
      // Access the store instance directly (since Pinia is already installed)
      const store = useAuthStore()
      // Only logout if user was previously considered authenticated
      if (store.isAuthenticated) {
        store.logout() // Clear token and user data from store and localStorage
        // Use router instance to redirect. Ensure router is available here.
        // Using router.push directly might be tricky if router isn't ready.
        // A common pattern is to redirect via window.location or have App.vue watch isAuthenticated
        // window.location.href = '/login'; // Force reload to login page
        // Or better: Use router instance if readily available
        router.push({ name: 'login', query: { sessionExpired: 'true' } }).catch((err) => {
          // Catch navigation errors if already on login page etc.
          console.warn('Redirect to login failed:', err.message)
        })
      }
    }
    // Important: Promise.reject(error) forwards the error to the original catch block (e.g., in store actions)
    return Promise.reject(error)
  },
)
// --- End Axios Interceptor Setup ---

// 3. Use Router (Navigation guards might depend on initialized store)
app.use(router)

// 4. Mount App
app.mount('#app')
