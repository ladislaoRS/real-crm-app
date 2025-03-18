<template>
  <q-page class="bg-gray-100 min-h-screen">
    <div class="container mx-auto py-6 px-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Contacts</h1>
        <q-btn color="primary" icon="add" label="Create Contact" @click="navigateToCreate" />
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-grow">
            <q-input
              v-model="search"
              placeholder="Search contacts..."
              clearable
              dense
              @update:model-value="onSearchDebounced"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div>
            <q-select
              v-model="trashedFilter"
              :options="[
                { label: 'Default', value: null },
                { label: 'With Trashed', value: 'with' },
                { label: 'Only Trashed', value: 'only' },
              ]"
              label="Filter"
              dense
              options-dense
              @update:model-value="onFilterChange"
            />
          </div>

          <div v-if="contactsStore.filters.search || contactsStore.filters.trashed">
            <q-btn flat color="primary" label="Reset" @click="resetFilters" />
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="contactsStore.loading" class="flex justify-center my-12">
        <q-spinner color="primary" size="3em" />
      </div>

      <!-- Error state -->
      <div
        v-else-if="contactsStore.error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
      >
        {{ contactsStore.error }}
        <div class="mt-3">
          <q-btn color="primary" @click="fetchContacts">Retry</q-btn>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="contactsStore.contacts.length === 0"
        class="bg-white rounded-lg shadow-sm p-8 text-center"
      >
        <div class="text-gray-500 mb-4">No contacts found.</div>
        <q-btn color="primary" label="Create Your First Contact" @click="navigateToCreate" />
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <q-table
          :rows="contactsStore.contacts"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          @request="onRequest"
          :rows-per-page-options="[10, 20, 50]"
          flat
          bordered
        >
          <!-- Name column with organization -->
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div>
                <div class="font-medium">{{ props.row.name }}</div>
                <div v-if="props.row.organization" class="text-gray-500 text-sm">
                  {{ props.row.organization.name }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- Status column for deleted status -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge v-if="props.row.deleted_at" color="red" label="Deleted" />
            </q-td>
          </template>

          <!-- Actions column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="navigateToEdit(props.row.id)"
              />

              <q-btn
                v-if="!props.row.deleted_at"
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
              />

              <q-btn
                v-else
                flat
                round
                dense
                color="positive"
                icon="restore"
                @click="confirmRestore(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this contact?</span>
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
          <span class="q-ml-sm">Restore this contact?</span>
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

const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()

// State
const search = ref('')
const trashedFilter = ref(null)
const deleteDialog = ref(false)
const restoreDialog = ref(false)
const selectedContact = ref(null)

// Table configuration
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: 'name',
  },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'phone', label: 'Phone', field: 'phone', align: 'left' },
  { name: 'city', label: 'City', field: 'city', align: 'left' },
  { name: 'status', label: 'Status', field: 'deleted_at', align: 'left' },
  { name: 'actions', label: 'Actions', align: 'center' },
]

// Pagination
const pagination = computed(() => ({
  rowsPerPage: contactsStore.pagination.perPage,
  page: contactsStore.pagination.currentPage,
  rowsNumber: contactsStore.pagination.total,
}))

// Load data on mount
onMounted(async () => {
  await fetchContacts()
})

// Methods
const fetchContacts = async () => {
  await contactsStore.fetchContacts()
}

const onRequest = async (props) => {
  const { page } = props.pagination
  await contactsStore.fetchContacts(page)
}

const onSearchDebounced = async (value) => {
  await contactsStore.fetchContacts(1, value)
}

const onFilterChange = async (value) => {
  await contactsStore.fetchContacts(1, null, value)
}

const resetFilters = async () => {
  search.value = ''
  trashedFilter.value = null
  contactsStore.resetFilters()
  await contactsStore.fetchContacts(1)
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
  }
}

const restoreContact = async () => {
  if (!selectedContact.value) return

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
  }
}
</script>
