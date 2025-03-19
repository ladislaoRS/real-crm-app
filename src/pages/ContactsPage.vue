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

      <!-- Filter Tabs (WhatsApp style) -->
      <div class="bg-white rounded-lg shadow-sm mb-4 overflow-x-auto">
        <div class="filter-tabs flex p-2">
          <!-- Status Filters -->
          <q-btn
            flat
            no-caps
            :color="activeStatusFilter === null ? 'primary' : 'grey-7'"
            label="All"
            class="q-px-md filter-tab"
            @click="setStatusFilter(null)"
          />
          <q-btn
            v-for="status in statusList"
            :key="status.value"
            flat
            no-caps
            :color="activeStatusFilter === status.value ? 'primary' : 'grey-7'"
            :label="status.label"
            class="q-px-md filter-tab"
            @click="setStatusFilter(status.value)"
          />
        </div>
      </div>

      <!-- Trashed Filter Pills (right-aligned) -->
      <div class="flex justify-end mb-4">
        <div class="bg-white rounded-lg shadow-sm inline-flex">
          <q-btn
            flat
            no-caps
            size="sm"
            :color="activeTrashedFilter === null ? 'primary' : 'grey-7'"
            label="Active"
            class="q-px-sm"
            @click="setTrashedFilter(null)"
          />
          <q-btn
            flat
            no-caps
            size="sm"
            :color="activeTrashedFilter === 'with' ? 'primary' : 'grey-7'"
            label="All"
            class="q-px-sm"
            @click="setTrashedFilter('with')"
          />
          <q-btn
            flat
            no-caps
            size="sm"
            :color="activeTrashedFilter === 'only' ? 'primary' : 'grey-7'"
            label="Deleted"
            class="q-px-sm"
            @click="setTrashedFilter('only')"
          />
        </div>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="flex justify-end mb-4">
        <div class="flex items-center">
          <span class="text-sm text-gray-600 mr-2">Filters:</span>
          <q-chip
            v-if="activeStatusFilter"
            dense
            removable
            :color="getStatusColor(activeStatusFilter)"
            text-color="white"
            @remove="setStatusFilter(null)"
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
          >
            {{ activeTrashedFilter === 'only' ? 'Deleted' : 'All' }}
          </q-chip>
          <q-btn
            v-if="hasActiveFilters"
            flat
            dense
            color="primary"
            label="Clear All"
            @click="resetFilters"
            class="q-ml-sm"
            size="sm"
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

        <!-- Contact list (WhatsApp style) -->
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
                <q-item-label class="text-weight-medium">
                  {{ contact.name }}
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

                  <div class="row items-center q-gutter-x-xs q-mt-xs">
                    <!-- Status badges moved to the right -->
                    <q-badge
                      v-if="contact.status"
                      :color="getStatusColor(contact.status)"
                      text-color="white"
                      class="q-mr-xs"
                    >
                      {{ contact.status }}
                    </q-badge>
                    <q-badge v-if="contact.deleted_at" color="red" text-color="white">
                      Deleted
                    </q-badge>
                  </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useContactsStore } from 'src/stores/contacts.store'
import { format, isToday, isYesterday, isThisYear } from 'date-fns'

const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()

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

// Status colors
const getStatusColor = (status) => {
  const colors = {
    New: 'blue-4',
    Initiated: 'purple-3',
    Submitted: 'teal-3',
    'In Review': 'amber-4',
    Approved: 'green-3',
    Rejected: 'pink-3',
    Assigned: 'indigo-3',
    Finalized: 'green-6',
  }
  return colors[status] || 'grey-5'
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
  padding-bottom: 2px;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.filter-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.filter-tab {
  position: relative;
  margin-right: 4px;
}

.filter-tab:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 3px;
  background-color: var(--q-primary);
  opacity: 0;
  transition: opacity 0.2s;
}

.filter-tab.q-btn--active:after {
  opacity: 1;
}
</style>
