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
          <template v-slot:append>
            <q-icon
              v-if="contactsStore.filters.trashed"
              name="filter_alt"
              class="cursor-pointer"
              color="primary"
              @click="openFilterMenu"
            />
            <q-icon v-else name="filter_alt" class="cursor-pointer" @click="openFilterMenu" />
          </template>
        </q-input>
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
                <q-avatar color="primary" text-color="white">
                  {{ getInitials(contact.name) }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ contact.name }}
                  <q-badge v-if="contact.deleted_at" color="red" text-color="white" class="q-ml-sm"
                    >Deleted</q-badge
                  >
                </q-item-label>
                <q-item-label caption>
                  {{ contact.organization ? contact.organization.name : 'No organization' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label caption>
                  {{ formatDate(contact.updated_at) }}
                </q-item-label>
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
          </div>
        </template>
      </div>
    </div>

    <!-- Filter Menu -->
    <q-dialog v-model="filterDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Filter Contacts</div>
        </q-card-section>

        <q-card-section>
          <q-radio v-model="trashedFilter" val="null" label="Active contacts only" />
          <q-radio v-model="trashedFilter" val="with" label="Include deleted contacts" />
          <q-radio v-model="trashedFilter" val="only" label="Only deleted contacts" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Reset Filters" color="primary" @click="resetFilters" v-close-popup />
          <q-btn flat label="Apply" color="primary" @click="applyFilter" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useContactsStore } from 'src/stores/contacts.store'
import { format, isToday, isYesterday, isThisYear } from 'date-fns'

const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()

// State
const search = ref('')
const trashedFilter = ref(null)
const deleteDialog = ref(false)
const restoreDialog = ref(false)
const filterDialog = ref(false)
const selectedContact = ref(null)
const searchLoading = ref(false)
const tableLoading = ref(false)
const hasLoadedInitially = ref(false)
const currentPage = ref(1)

// Load data on mount
onMounted(async () => {
  await fetchContacts()
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

// Filter menu
const openFilterMenu = () => {
  filterDialog.value = true
}

const applyFilter = async () => {
  tableLoading.value = true
  await contactsStore.fetchContacts(
    1,
    null,
    trashedFilter.value === 'null' ? null : trashedFilter.value,
  )
  currentPage.value = 1
  tableLoading.value = false
}

const resetFilters = async () => {
  search.value = ''
  trashedFilter.value = null
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
</style>
