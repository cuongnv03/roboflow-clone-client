import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { useAuthStore } from './stores/auth'

import './assets/main.css'

// Create app instance
const app = createApp(App)

// Initialize Pinia
const pinia = createPinia()
app.use(pinia)

// Set up Axios interceptors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()

      // Only logout if user was previously authenticated
      if (authStore.isAuthenticated) {
        console.log('Token expired or invalid. Logging out.')
        authStore.logout()
        router.push({
          name: 'login',
          query: {
            expired: 'true',
            redirect: router.currentRoute.value.fullPath,
          },
        })
      }
    }

    return Promise.reject(error)
  },
)

// Initialize auth state (must come after pinia setup)
const authStore = useAuthStore()
authStore.checkAuth()

// Initialize router
app.use(router)

// Mount app
app.mount('#app')
