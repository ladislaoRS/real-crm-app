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

      <!-- Unified Filter Section (WhatsApp style) -->
      <div class="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
        <div class="flex justify-between items-center px-4 py-2 border-b border-gray-200">
          <div class="text-body1 font-medium text-gray-400">Filters</div>
          <q-btn
            v-if="hasActiveFilters"
            flat
            dense
            color="primary"
            label="Clear All"
            @click="resetFilters"
            size="sm"
          />
        </div>

        <div class="filter-tabs overflow-x-auto whitespace-nowrap p-2 pb-1">
          <!-- All Contacts Filter -->
          <q-btn
            flat
            no-caps
            :color="!hasActiveFilters ? 'primary' : 'grey-7'"
            label="Active"
            class="q-px-md filter-tab"
            :class="{ 'q-btn--active': !hasActiveFilters }"
            @click="resetFilters"
          />

          <!-- Trashed Filters (integrated into main filter tabs) -->
          <q-btn
            flat
            no-caps
            :color="activeTrashedFilter === 'with' ? 'primary' : 'grey-7'"
            label="All"
            class="q-px-md filter-tab"
            :class="{ 'q-btn--active': activeTrashedFilter === 'with' }"
            @click="setTrashedFilter('with')"
          />

          <q-btn
            flat
            no-caps
            :color="activeTrashedFilter === 'only' ? 'primary' : 'grey-7'"
            label="Deleted"
            class="q-px-md filter-tab"
            :class="{ 'q-btn--active': activeTrashedFilter === 'only' }"
            @click="setTrashedFilter('only')"
          />

          <!-- Status Filters -->
          <q-btn
            v-for="status in visibleStatusFilters"
            :key="`status-${status.value}`"
            flat
            no-caps
            :color="activeStatusFilter === status.value ? 'primary' : 'grey-7'"
            :label="status.label"
            class="q-px-md filter-tab"
            :class="{ 'q-btn--active': activeStatusFilter === status.value }"
            @click="setStatusFilter(status.value)"
          />

          <!-- More filters button -->
          <q-btn
            v-if="hiddenStatusFilters.length > 0"
            flat
            no-caps
            icon="more_horiz"
            class="q-px-md filter-tab"
            color="grey-7"
            @click="toggleMoreFilters"
          >
            <q-menu anchor="bottom right" self="top right" :offset="[0, 8]" class="filter-menu">
              <q-list dense style="min-width: 150px">
                <q-item
                  v-for="status in hiddenStatusFilters"
                  :key="`menu-${status.value}`"
                  clickable
                  v-close-popup
                  @click="setStatusFilter(status.value)"
                >
                  <q-item-section>
                    <q-item-label>{{ status.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="activeStatusFilter === status.value">
                    <q-icon name="check" color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <!-- Active Filters Chips (when filters are active) -->
        <div v-if="hasActiveFilters" class="px-4 py-2 bg-gray-50 active-filters-section">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-gray-600">Active filters:</span>
            <q-chip
              v-if="activeStatusFilter"
              dense
              removable
              :color="getStatusColor(activeStatusFilter)"
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
              color="grey"
              text-color="white"
              @remove="setTrashedFilter(null)"
              size="sm"
            >
              {{ activeTrashedFilter === 'only' ? 'Deleted' : 'All Records' }}
            </q-chip>
          </div>
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

                  <!-- Action buttons positioned below -->
                  <div class="row items-center no-wrap q-mt-xs">
                    <q-btn
                      v-if="!contact.deleted_at"
                      flat
                      round
                      dense
                      size="sm"
                      color="negative"
                      icon="delete"
                      @click.stop="confirmDelete(contact)"
                    />
                    <q-btn
                      v-else
                      flat
                      round
                      dense
                      size="sm"
                      color="positive"
                      icon="restore"
                      @click.stop="confirmRestore(contact)"
                    />
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

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Delete {{ selectedContact?.name || 'this contact' }}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteContact" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Restore Confirmation Dialog -->
    <q-dialog v-model="restoreDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="restore" color="positive" text-color="white" />
          <span class="q-ml-sm">Restore {{ selectedContact?.name || 'this contact' }}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Restore" color="positive" @click="restoreContact" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useContactsStore } from 'src/stores/contacts.store'
import { format, isToday, isYesterday, isThisYear } from 'date-fns'
import { useWindowSize } from '@vueuse/core'

const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()
const { width } = useWindowSize()

// Status options - without the "All Statuses" option (handled separately)
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

// Visible and hidden status filters
const maxVisibleFilters = ref(3) // Default number of visible filters
const visibleStatusFilters = computed(() => {
  return statusList.slice(0, maxVisibleFilters.value)
})
const hiddenStatusFilters = computed(() => {
  return statusList.slice(maxVisibleFilters.value)
})

// Update visible filters based on screen size
watch(
  () => width.value,
  (newWidth) => {
    if (newWidth < 640) {
      // Small mobile screens
      maxVisibleFilters.value = 2
    } else if (newWidth < 768) {
      // Larger mobile screens
      maxVisibleFilters.value = 3
    } else if (newWidth < 1024) {
      // Tablets
      maxVisibleFilters.value = 4
    } else {
      // Desktop
      maxVisibleFilters.value = 5
    }
  },
  { immediate: true },
)

// Status colors
const getStatusColor = (status) => {
  const colors = {
    New: 'blue-5',
    Initiated: 'purple-4',
    Submitted: 'teal-4',
    'In Review': 'amber-5',
    Approved: 'green-4',
    Rejected: 'pink-4',
    Assigned: 'indigo-4',
    Finalized: 'green-6',
  }
  return colors[status] || 'grey-6'
}

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

// Toggle more filters - just a placeholder function for the menu
const toggleMoreFilters = () => {
  // The menu is handled by q-menu
}

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
  if (activeStatusFilter.value === status) return

  tableLoading.value = true
  activeStatusFilter.value = status
  await contactsStore.fetchContacts(1, null, activeTrashedFilter.value, status)
  currentPage.value = 1
  tableLoading.value = false
}

const setTrashedFilter = async (trashed) => {
  if (activeTrashedFilter.value === trashed) return

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

.filter-tabs {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.filter-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.filter-tab {
  position: relative;
  margin-right: 4px;
  border-radius: 16px;
  transition: all 0.2s;
}

.filter-tab.q-btn--active {
  background-color: rgba(var(--q-primary-rgb), 0.1);
}

/* WhatsApp style underline for active tabs */
.filter-tab:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background-color: var(--q-primary);
  opacity: 0;
  transition: opacity 0.2s;
}

.filter-tab.q-btn--active:after {
  opacity: 1;
}

.filter-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.active-filters-section {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .filter-tab {
    padding-left: 8px;
    padding-right: 8px;
    min-width: auto;
  }

  .filter-tabs {
    padding: 8px 8px 6px;
  }
}
</style>
