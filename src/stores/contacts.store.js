import { defineStore } from 'pinia'
import api from 'src/services/api.service'

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    contacts: [],
    contact: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      total: 0,
      perPage: 5,
      lastPage: 1,
    },
    filters: {
      search: '',
      trashed: null,
      status: null,
    },
    // Dashboard statistics
    dashboardStats: {
      totalContacts: 0,
      contactsToday: 0,
      contactsYesterday: 0,
      contactsThisWeek: 0,
      contactsLastWeek: 0,
      contactsThisMonth: 0,
      contactsLastMonth: 0,
      avgPerDay: 0,
    },
    recentContacts: [],
  }),

  getters: {
    // Convert pagination data for Quasar pagination component
    paginationData: (state) => ({
      rowsPerPage: state.pagination.perPage,
      sortBy: 'name',
      descending: false,
      page: state.pagination.currentPage,
      rowsNumber: state.pagination.total,
    }),

    // Dashboard stats getters
    weekTrend: (state) => {
      if (state.dashboardStats.contactsLastWeek === 0) return 100
      const change = state.dashboardStats.contactsThisWeek - state.dashboardStats.contactsLastWeek
      return Math.round((change / state.dashboardStats.contactsLastWeek) * 100)
    },

    monthTrend: (state) => {
      if (state.dashboardStats.contactsLastMonth === 0) return 100
      const change = state.dashboardStats.contactsThisMonth - state.dashboardStats.contactsLastMonth
      return Math.round((change / state.dashboardStats.contactsLastMonth) * 100)
    },
  },

  actions: {
    async fetchContacts(page = 1, search = null, trashed = null, status = null) {
      this.loading = true
      this.error = null

      // Update filters if provided
      if (search !== null) this.filters.search = search
      if (trashed !== null) this.filters.trashed = trashed
      if (status !== undefined) this.filters.status = status

      console.log('Fetching contacts with filters:', {
        page,
        search: this.filters.search,
        trashed: this.filters.trashed,
        status: this.filters.status,
      })

      try {
        const response = await api.getContacts(
          page,
          this.filters.search,
          this.filters.trashed,
          this.filters.status,
        )

        // Extract data and pagination info directly from the response
        const { data, meta } = response.data

        this.contacts = data
        this.pagination = {
          currentPage: meta.current_page,
          total: meta.total,
          perPage: meta.per_page,
          lastPage: meta.last_page,
        }

        console.log('Pagination from backend:', this.pagination)

        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch contacts'
        console.error('Error fetching contacts:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchContact(id) {
      this.loading = true
      this.error = null

      try {
        const response = await api.getContact(id)
        this.contact = response.data.data
        return this.contact
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch contact'
        console.error('Error fetching contact:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async createContact(contactData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.createContact(contactData)
        // Refresh the contacts list
        await this.fetchContacts(this.pagination.currentPage)
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create contact'
        console.error('Error creating contact:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateContact(id, contactData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.updateContact(id, contactData)

        // Update the local contact if we're viewing it
        if (this.contact && this.contact.id === id) {
          this.contact = response.data.data
        }

        // Refresh the contacts list
        await this.fetchContacts(this.pagination.currentPage)

        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update contact'
        console.error('Error updating contact:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteContact(id) {
      this.loading = true
      this.error = null

      try {
        await api.deleteContact(id)

        // Refresh the contacts list
        await this.fetchContacts(this.pagination.currentPage)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete contact'
        console.error('Error deleting contact:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    async restoreContact(id) {
      this.loading = true
      this.error = null

      try {
        await api.restoreContact(id)

        // Refresh the contacts list
        await this.fetchContacts(this.pagination.currentPage)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to restore contact'
        console.error('Error restoring contact:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    resetFilters() {
      this.filters = {
        search: '',
        trashed: null,
        status: null,
      }
    },

    // Dashboard actions
    async fetchDashboardStats() {
      this.loading = true
      this.error = null

      try {
        const response = await api.getDashboardStats()
        this.dashboardStats = response.data

        return this.dashboardStats
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch dashboard statistics'
        console.error('Error fetching dashboard stats:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchRecentContacts() {
      this.loading = true
      this.error = null

      try {
        // Get most recent contacts
        const response = await api.getContacts(1, '', null, null, 'created_at', 'desc')
        this.recentContacts = response.data.data.slice(0, 5)

        return this.recentContacts
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch recent contacts'
        console.error('Error fetching recent contacts:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchAllDashboardData() {
      this.loading = true

      try {
        // Fetch both stats and recent contacts in parallel
        await Promise.all([this.fetchDashboardStats(), this.fetchRecentContacts()])

        return {
          stats: this.dashboardStats,
          recentContacts: this.recentContacts,
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
