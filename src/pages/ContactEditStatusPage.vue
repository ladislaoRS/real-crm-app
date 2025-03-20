<template>
  <q-page class="bg-gray-100 min-h-screen py-6 px-4">
    <div class="container mx-auto">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <q-btn flat round icon="arrow_back" color="primary" @click="$router.back()" />
        <h1 class="text-3xl font-bold text-gray-800 ml-2">
          <span v-if="contactsStore.loading">Loading...</span>
          <span v-else-if="contactsStore.contact">Edit {{ contactsStore.contact.name }}</span>
          <span v-else>Update Status</span>
        </h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !contactsStore.contact" class="flex justify-center my-12">
        <q-spinner color="primary" size="3em" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="contactsStore.error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
      >
        {{ contactsStore.error }}
        <div class="mt-3">
          <q-btn color="primary" @click="loadContact">Retry</q-btn>
        </div>
      </div>

      <!-- Form -->
      <template v-else-if="contactsStore.contact">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <q-form @submit="updateContact" class="space-y-6" ref="contactForm">
            <!-- Status Section -->
            <h2 class="text-lg font-semibold text-gray-700 mb-4">Status Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Status -->
              <div>
                <q-select
                  v-model="form.status"
                  :options="statusOptions"
                  label="Contact Status"
                  class="w-full"
                  outlined
                  map-options
                  emit-value
                  lazy-rules
                  bottom-slots
                >
                  <template v-slot:selected-item="scope">
                    <div class="flex items-center">
                      <q-badge :color="getStatusColor(scope.opt)" class="q-mr-xs" />
                      <span>{{ scope.opt }}</span>
                    </div>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>
                          <q-badge :color="getStatusColor(scope.opt)" class="q-mr-xs" />
                          {{ scope.opt }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Status Updated Date (read-only) -->
              <div>
                <q-input
                  v-if="contactsStore.contact.status_updated_at"
                  v-model="statusUpdatedDate"
                  label="Status Last Updated"
                  class="w-full"
                  outlined
                  readonly
                  disable
                />
              </div>

              <!-- Status Notes -->
              <div class="md:col-span-2">
                <q-input
                  v-model="form.status_notes"
                  label="Status Notes"
                  type="textarea"
                  rows="3"
                  class="w-full"
                  outlined
                  lazy-rules
                  bottom-slots
                  :rules="[
                    (val) => !val || val.length <= 500 || 'Notes must be 500 characters or less',
                  ]"
                  hint="Add any relevant notes about this contact's status"
                />
              </div>
            </div>

            <!-- Form actions -->
            <div class="flex justify-end space-x-3 mt-8">
              <q-btn flat label="Cancel" @click="$router.back()" :disable="isSubmitting" />
              <q-btn type="submit" color="primary" label="Update Contact" :loading="isSubmitting" />
            </div>
          </q-form>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useContactsStore } from 'src/stores/contacts.store'
import { format, parseISO } from 'date-fns'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()

// Form reference
const contactForm = ref(null)

// State
const isLoading = ref(true)
const isSubmitting = ref(false)
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  country: 'US', // Default to US
  postal_code: '',
  status: null,
  status_notes: '',
})

// Status options
const statusOptions = [
  null, // Allow no status
  'New',
  'Initiated',
  'Submitted',
  'In Review',
  'Approved',
  'Rejected',
  'Assigned',
  'Finalized',
]

// Status colors (matching the ones from the contacts list)
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

// Formatted status updated date
const statusUpdatedDate = computed(() => {
  if (!contactsStore.contact?.status_updated_at) return ''
  try {
    return format(parseISO(contactsStore.contact.status_updated_at), 'MMM d, yyyy h:mm a')
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return contactsStore.contact.status_updated_at
  }
})

// Load contact on mount
onMounted(async () => {
  await loadContact()
})

// Watch for changes in the contact store and update the form
watch(
  () => contactsStore.contact,
  (newContact) => {
    if (newContact) {
      form.value = {
        first_name: newContact.first_name,
        last_name: newContact.last_name,
        email: newContact.email || '',
        address: newContact.address || '',
        city: newContact.city || '',
        region: newContact.region || '',
        country: 'US', // Always set to US
        postal_code: newContact.postal_code || '',
        status: newContact.status || null,
        status_notes: newContact.status_notes || '',
        // Keep organization_id in the form for the API but don't show it
        organization_id: newContact.organization_id,
      }
    }
  },
)

// Load contact data
const loadContact = async () => {
  isLoading.value = true

  try {
    await contactsStore.fetchContact(route.params.id)
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to load contact',
      icon: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// Update contact handler
const updateContact = async () => {
  // Use Quasar's built-in form validation
  const isValid = await contactForm.value.validate()

  if (!isValid) {
    // Form has validation errors
    $q.notify({
      color: 'negative',
      message: 'Please correct the errors in the form',
      icon: 'error',
    })
    return
  }

  isSubmitting.value = true

  try {
    // Add current account_id
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    if (userData.account_id) {
      form.value.account_id = userData.account_id
    }

    // Ensure country is set to US
    form.value.country = 'US'

    await contactsStore.updateContact(route.params.id, form.value)

    $q.notify({
      color: 'positive',
      message: 'Contact updated successfully',
      icon: 'check',
    })

    router.push({ name: 'contacts' })
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: contactsStore.error || 'An error occurred while updating the contact',
      icon: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* You can add custom styles here if needed */
</style>
