import axios from 'axios'

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: process.env.API_URL || 'http://pingcrm.test/api',
  // baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {}

    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to login page
      window.location.href = '/#/login'
    }

    return Promise.reject(error)
  },
)

export default {
  // Auth methods
  login(credentials) {
    return apiClient.post('/login', credentials)
  },

  logout() {
    return apiClient.post('/logout')
  },

  getCurrentUser() {
    return apiClient.get('/user')
  },

  // Contacts methods
  getContacts(
    page = 1,
    search = '',
    trashed = null,
    status = null,
    sortBy = '',
    sortOrder = 'asc',
  ) {
    let params = { page }
    if (search) params.search = search
    if (trashed) params.trashed = trashed
    if (status) params.status = status
    if (sortBy) {
      params.sort_by = sortBy
      params.sort_order = sortOrder
    }

    return apiClient.get('/contacts', { params })
  },

  getContact(id) {
    return apiClient.get(`/contacts/${id}`)
  },

  createContact(contact) {
    return apiClient.post('/contacts', contact)
  },

  updateContact(id, contact) {
    return apiClient.put(`/contacts/${id}`, contact)
  },

  deleteContact(id) {
    return apiClient.delete(`/contacts/${id}`)
  },

  restoreContact(id) {
    return apiClient.put(`/contacts/${id}/restore`)
  },

  // Dashboard methods
  getDashboardStats() {
    return apiClient.get('/dashboard/stats')
  },
}
