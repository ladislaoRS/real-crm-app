<template>
  <q-page class="bg-gray-100 min-h-screen">
    <div class="container mx-auto py-6 px-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-800">Contacts</h1>
        <q-btn round color="primary" icon="add" @click="navigateToCreate" />
      </div>

      <!-- Search -->
      <div class="bg-white rounded-lg shadow-sm mb-4">
        <q-input
          v-model="search"
          placeholder="Search contacts..."
          clearable
          dense
          class="q-pa-sm"
          @update:model-value="debouncedSearch"
          :loading="searchLoading"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- WhatsApp Style Filter Chips - All Light Gray Base -->
      <div class="filter-chips-container bg-white rounded-lg shadow-sm mb-4 p-3 overflow-x-auto">
        <!-- All/Active filter chip -->
        <q-chip
          clickable
          :class="{
            'active-chip': !hasActiveFilters,
            'inactive-chip': hasActiveFilters,
          }"
          @click="resetFilters"
        >
          Active
        </q-chip>

        <!-- Trashed Status Chips -->
        <q-chip
          clickable
          :class="{
            'active-chip': activeTrashedFilter === 'with',
            'inactive-chip': activeTrashedFilter !== 'with',
          }"
          @click="setTrashedFilter('with')"
        >
          All
        </q-chip>

        <q-chip
          clickable
          :class="{
            'active-chip': activeTrashedFilter === 'only',
            'inactive-chip': activeTrashedFilter !== 'only',
          }"
          @click="setTrashedFilter('only')"
        >
          Deleted
        </q-chip>

        <!-- Status Filter Chips -->
        <q-chip
          v-for="status in statusList"
          :key="status.value"
          clickable
          :class="{
            'active-chip': activeStatusFilter === status.value,
            'inactive-chip': activeStatusFilter !== status.value,
          }"
          @click="setStatusFilter(status.value)"
        >
          {{ status.label }}
        </q-chip>
      </div>

      <!-- Active Filters (only show when filters are active) -->
      <div v-if="hasActiveFilters" class="bg-white rounded-lg shadow-sm mb-4 p-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 font-medium">Active filters:</span>
          <div class="flex flex-wrap gap-2">
            <q-chip
              v-if="activeStatusFilter"
              dense
              removable
              color="primary"
              text-color="white"
              @remove="setStatusFilter(null)"
              size="sm"
            >
              {{ activeStatusFilter }}
            </q-chip>
            <q-chip
              v-if="activeTrashedFilter"
              dense
              removable
              color="primary"
              text-color="white"
              @remove="setTrashedFilter(null)"
              size="sm"
            >
              {{ activeTrashedFilter === 'only' ? 'Deleted' : 'All Records' }}
            </q-chip>
          </div>
          <q-btn
            flat
            dense
            color="primary"
            label="Clear All"
            @click="resetFilters"
            size="sm"
            class="ml-auto"
            v-if="hasActiveFilters"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading state -->
        <template v-if="contactsStore.loading && !hasLoadedInitially">
          <div class="p-2">
            <q-list separator>
              <q-item v-for="i in 7" :key="i" class="q-py-md">
                <q-item-section avatar>
                  <q-skeleton type="circle" size="40px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    <q-skeleton type="text" width="40%" />
                  </q-item-label>
                  <q-item-label caption>
                    <q-skeleton type="text" width="70%" />
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-skeleton type="text" width="30px" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </template>

        <!-- Error state -->
        <template v-else-if="contactsStore.error">
          <div class="bg-red-100 border border-red-400 text-red-700 p-4">
            {{ contactsStore.error }}
            <div class="mt-3">
              <q-btn color="primary" @click="fetchContacts">Retry</q-btn>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="contactsStore.contacts.length === 0">
          <div class="p-8 text-center">
            <div class="text-gray-500 mb-4">No contacts found.</div>
            <q-btn color="primary" label="Create Your First Contact" @click="navigateToCreate" />
          </div>
        </template>

        <!-- Contact list with custom tailwind-style badges -->
        <template v-else>
          <q-list separator class="contact-list" v-if="!tableLoading">
            <q-item
              v-for="contact in contactsStore.contacts"
              :key="contact.id"
              clickable
              v-ripple
              @click="navigateToEdit(contact.id)"
              :class="{ 'deleted-contact': contact.deleted_at }"
            >
              <q-item-section avatar>
                <q-avatar
                  color="primary"
                  text-color="white"
                  size="48px"
                  font-size="16px"
                  class="shadow-sm"
                >
                  {{ getInitials(contact.name) }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <!-- Name with inline custom tailwind-style badges -->
                <q-item-label class="text-weight-medium flex items-center text-gray-600">
                  {{ contact.name }}
                  <!-- Custom status badge using tailwind classes -->
                  <span
                    v-if="contact.status"
                    class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ml-2 ring-1 ring-inset"
                    :class="getStatusTailwindClasses(contact.status)"
                  >
                    {{ contact.status }}
                  </span>
                  <!-- Custom deleted badge -->
                  <span
                    v-if="contact.deleted_at"
                    class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 ml-2"
                  >
                    Deleted
                  </span>
                </q-item-label>
                <q-item-label caption>
                  {{ contact.phone ? contact.phone : 'Missing phone...' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="flex flex-col items-end">
                  <q-item-label caption>
                    {{ formatDate(contact.created_at) }}
                  </q-item-label>

                  <!-- Action buttons with Tailwind styling -->
                  <div class="flex items-center space-x-2 mt-1">
                    <button
                      class="w-7 h-7 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      @click="navigateToEditStatus(contact.id)"
                    >
                      <i class="material-icons text-sm">sync_alt</i>
                    </button>
                    <button
                      v-if="!contact.deleted_at"
                      class="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      @click.stop="confirmDelete(contact)"
                    >
                      <i class="material-icons text-sm">delete</i>
                    </button>
                    <button
                      v-else
                      class="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      @click.stop="confirmRestore(contact)"
                    >
                      <i class="material-icons text-sm">restore</i>
                    </button>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="flex justify-center items-center p-4">
            <q-spinner color="primary" size="2em" />
          </div>

          <!-- Pagination controls -->
          <div class="flex justify-center p-3 bg-gray-50">
            <q-pagination
              v-model="currentPage"
              :max="contactsStore.pagination.lastPage"
              :max-pages="6"
              direction-links
              boundary-links
              @update:model-value="onPageChange"
            />
            <div class="text-caption text-grey q-ml-md self-center">
              {{ contactsStore.pagination.perPage }} per page / Total:
              {{ contactsStore.pagination.total }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Delete Confirmation Dialog with Tailwind styling -->
    <q-dialog v-model="deleteDialog" persistent>
      <div class="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
        <!-- Dialog header -->
        <div class="p-4 flex items-center border-b border-gray-200">
          <div class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <i class="material-icons text-red-600">delete</i>
          </div>
          <h3 class="text-lg font-medium text-gray-900">
            Delete {{ selectedContact?.name || 'this contact' }}?
          </h3>
        </div>

        <!-- Dialog actions -->
        <div class="px-4 py-3 bg-gray-50 flex justify-end space-x-3">
          <button
            class="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            v-close-popup
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            @click="deleteContact"
            v-close-popup
          >
            Delete
          </button>
        </div>
      </div>
    </q-dialog>

    <!-- Restore Confirmation Dialog with Tailwind styling -->
    <q-dialog v-model="restoreDialog" persistent>
      <div class="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
        <!-- Dialog header -->
        <div class="p-4 flex items-center border-b border-gray-200">
          <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <i class="material-icons text-green-600">restore</i>
          </div>
          <h3 class="text-lg font-medium text-gray-900">
            Restore {{ selectedContact?.name || 'this contact' }}?
          </h3>
        </div>

        <!-- Dialog actions -->
        <div class="px-4 py-3 bg-gray-50 flex justify-end space-x-3">
          <button
            class="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            v-close-popup
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            @click="restoreContact"
            v-close-popup
          >
            Restore
          </button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useContactsStore } from 'src/stores/contacts.store'
import { format, isToday, isYesterday, isThisYear } from 'date-fns'

const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()

// Status options
const statusList = [
  { label: 'New', value: 'New' },
  { label: 'Initiated', value: 'Initiated' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'In Review', value: 'In Review' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'Finalized', value: 'Finalized' },
]

// State
const search = ref('')
const activeStatusFilter = ref(null)
const activeTrashedFilter = ref(null)
const deleteDialog = ref(false)
const restoreDialog = ref(false)
const selectedContact = ref(null)
const searchLoading = ref(false)
const tableLoading = ref(false)
const hasLoadedInitially = ref(false)
const currentPage = ref(1)

// Computed properties
const hasActiveFilters = computed(() => {
  return activeStatusFilter.value !== null || activeTrashedFilter.value !== null
})

// Load data on mount
onMounted(async () => {
  console.log('Loading contacts...')
  await fetchContacts()
  console.log('Contacts loaded, per page:', contactsStore.pagination.perPage)
  hasLoadedInitially.value = true
})

// Methods
const fetchContacts = async () => {
  tableLoading.value = true
  await contactsStore.fetchContacts()
  currentPage.value = contactsStore.pagination.currentPage
  tableLoading.value = false
}

// Page navigation
const onPageChange = async (page) => {
  tableLoading.value = true
  await contactsStore.fetchContacts(page)
  tableLoading.value = false
}

// Create a debounced search function
let searchTimeout = null
const debouncedSearch = (value) => {
  searchLoading.value = true

  // Clear any existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Set a new timeout
  searchTimeout = setTimeout(async () => {
    await contactsStore.fetchContacts(1, value)
    currentPage.value = 1
    searchLoading.value = false
  }, 500) // 500ms debounce time
}

// Format date function (WhatsApp style)
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (isToday(date)) {
    return format(date, 'h:mm a') // Today: 3:45 PM
  } else if (isYesterday(date)) {
    return 'Yesterday' // Yesterday
  } else if (isThisYear(date)) {
    return format(date, 'MMM d') // This year: Mar 15
  } else {
    return format(date, 'MM/dd/yyyy') // Different year: 03/15/2022
  }
}

// Get initials from name
const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Filter functions
const setStatusFilter = async (status) => {
  if (activeStatusFilter.value === status) {
    // Toggle off if clicking the same filter
    status = null
  }

  tableLoading.value = true
  activeStatusFilter.value = status
  await contactsStore.fetchContacts(1, null, activeTrashedFilter.value, status)
  currentPage.value = 1
  tableLoading.value = false
}

const setTrashedFilter = async (trashed) => {
  if (activeTrashedFilter.value === trashed) {
    // Toggle off if clicking the same filter
    trashed = null
  }

  tableLoading.value = true
  activeTrashedFilter.value = trashed
  await contactsStore.fetchContacts(1, null, trashed, activeStatusFilter.value)
  currentPage.value = 1
  tableLoading.value = false
}

const resetFilters = async () => {
  search.value = ''
  activeStatusFilter.value = null
  activeTrashedFilter.value = null
  tableLoading.value = true
  contactsStore.resetFilters()
  await contactsStore.fetchContacts(1)
  currentPage.value = 1
  tableLoading.value = false
}

const navigateToCreate = () => {
  router.push({ name: 'contact-create' })
}

const navigateToEdit = (id) => {
  router.push({ name: 'contact-edit', params: { id } })
}

const navigateToEditStatus = (id) => {
  router.push({ name: 'contact-edit-status', params: { id } })
}

const confirmDelete = (contact) => {
  selectedContact.value = contact
  deleteDialog.value = true
}

const confirmRestore = (contact) => {
  selectedContact.value = contact
  restoreDialog.value = true
}

const deleteContact = async () => {
  if (!selectedContact.value) return

  tableLoading.value = true
  try {
    await contactsStore.deleteContact(selectedContact.value.id)
    $q.notify({
      color: 'positive',
      message: 'Contact deleted successfully',
      icon: 'delete',
    })
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to delete contact',
      icon: 'error',
    })
  } finally {
    tableLoading.value = false
  }
}

const restoreContact = async () => {
  if (!selectedContact.value) return

  tableLoading.value = true
  try {
    await contactsStore.restoreContact(selectedContact.value.id)
    $q.notify({
      color: 'positive',
      message: 'Contact restored successfully',
      icon: 'restore',
    })
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to restore contact',
      icon: 'error',
    })
  } finally {
    tableLoading.value = false
  }
}

const getStatusTailwindClasses = (status) => {
  const classes = {
    New: 'bg-blue-50 text-blue-700 ring-blue-600/10',
    Initiated: 'bg-purple-50 text-purple-700 ring-purple-600/10',
    Submitted: 'bg-teal-50 text-teal-700 ring-teal-600/10',
    'In Review': 'bg-amber-50 text-amber-700 ring-amber-600/10',
    Approved: 'bg-green-50 text-green-700 ring-green-600/10',
    Rejected: 'bg-pink-50 text-pink-700 ring-pink-600/10',
    Assigned: 'bg-indigo-50 text-indigo-700 ring-indigo-600/10',
    Finalized: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  }
  return classes[status] || 'bg-gray-50 text-gray-700 ring-gray-600/10'
}
</script>

<style scoped>
.contact-list .q-item {
  padding: 10px 16px;
  transition: background-color 0.2s;
}

.contact-list .q-item:hover {
  background-color: #f7f7f7;
}

.deleted-contact {
  opacity: 0.7;
}

.q-avatar {
  font-size: 14px;
}

/* WhatsApp-style filter chip container */
.filter-chips-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -webkit-overflow-scrolling: touch;
  gap: 8px;
  padding: 12px;
}

.filter-chips-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

/* WhatsApp-style filter chips - Light gray base, primary when active */
.filter-chip {
  margin: 0;
  border-radius: 16px;
  font-size: 0.85rem;
  padding: 2px 10px;
  height: 28px;
  flex-shrink: 0;
  margin-right: 4px;
}

/* Active and inactive chip styles */
.active-chip {
  background-color: var(--q-primary) !important;
  color: white !important;
  font-weight: 500;
}

.inactive-chip {
  background-color: #f0f0f0 !important;
  color: #606060 !important;
}

.inactive-chip:hover {
  background-color: #e0e0e0 !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .filter-chip,
  .active-chip,
  .inactive-chip {
    font-size: 0.8rem;
    height: 26px;
    padding: 2px 8px;
  }

  .filter-chips-container {
    padding: 8px;
  }
}
</style>
