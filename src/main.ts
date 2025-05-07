import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './assets/main.css'

// Create app
const app = createApp(App)

// Setup Pinia
const pinia = createPinia()
app.use(pinia)

// Setup Router
app.use(router)

// Setup Axios interceptors for handling authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      console.log('Unauthorized access, redirecting to login')

      // Clear authentication
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Redirect to login
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

// Mount app
app.mount('#app')
