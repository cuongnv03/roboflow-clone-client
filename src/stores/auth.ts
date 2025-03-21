import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { user_id: number; username: string; token: string } | null,
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/users/login', {
          email,
          password,
        })
        this.user = {
          user_id: response.data.user_id,
          username: response.data.username,
          token: response.data.token,
        }
        localStorage.setItem('token', this.user.token)
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },
    async signup(username: string, email: string, password: string) {
      try {
        const response = await axios.post('http://localhost:3000/api/v1/users/register', {
          username,
          email,
          password,
        })
        this.user = { user_id: response.data.user_id, username: response.data.username, token: '' }
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    },
    logout() {
      this.user = null
      localStorage.removeItem('token')
    },
  },
})
