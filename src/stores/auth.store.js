import { defineStore } from 'pinia'
import api from 'src/services/api.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || '',
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    username: (state) => (state.user ? state.user.name : ''),
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.login({
          email,
          password,
          device_name: 'quasar-app',
        })

        const { token, user } = response.data

        // Store user data
        this.user = user
        this.token = token

        // Persist data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        console.error('Login error:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await api.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear user data regardless of API success
        this.user = null
        this.token = ''
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    async checkAuth() {
      if (!this.token) return false

      try {
        const response = await api.getCurrentUser()
        this.user = response.data
        return true
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.user = null
        this.token = ''
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return false
      }
    },
  },
})
