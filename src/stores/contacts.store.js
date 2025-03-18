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
    },
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
  },

  actions: {
    async fetchContacts(page = 1, search = null, trashed = null) {
      this.loading = true
      this.error = null

      // Update filters if provided
      if (search !== null) this.filters.search = search
      if (trashed !== null) this.filters.trashed = trashed

      try {
        const response = await api.getContacts(page, this.filters.search, this.filters.trashed)

        // Extract data and pagination info directly from the response
        const { data, meta } = response.data

        this.contacts = data
        this.pagination = {
          currentPage: meta.current_page,
          total: meta.total,
          perPage: meta.per_page, // Use the per_page value from the backend
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
      }
    },
  },
})
