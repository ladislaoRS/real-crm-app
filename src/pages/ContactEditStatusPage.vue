<template>
  <q-page class="bg-gray-50 min-h-screen py-8 px-4 sm:px-6">
    <div class="container mx-auto">
      <!-- Header -->
      <div class="flex items-center mb-8">
        <q-btn
          flat
          round
          icon="arrow_back"
          class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
          @click="$router.back()"
        />
        <h1 class="text-2xl font-bold text-gray-900 ml-3">
          <span v-if="contactsStore.loading" class="flex items-center">
            <q-spinner color="primary" size="sm" class="mr-2" />
            Loading...
          </span>
          <span v-else-if="contactsStore.contact">Update {{ contactsStore.contact.name }}</span>
          <span v-else>Update Status</span>
        </h1>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading && !contactsStore.contact"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center"
      >
        <q-spinner color="primary" size="3em" />
        <p class="text-gray-500 mt-4">Loading contact information...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="contactsStore.error"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center"
      >
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <i class="material-icons text-red-500 text-2xl">error_outline</i>
        </div>
        <p class="text-red-600 font-medium mb-2">Error Loading Contact</p>
        <p class="text-gray-600 mb-6 text-center">{{ contactsStore.error }}</p>
        <q-btn
          color="primary"
          @click="loadContact"
          class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md px-6 rounded-lg transition-all duration-300"
          unelevated
        >
          Retry
        </q-btn>
      </div>

      <!-- Form -->
      <template v-else-if="contactsStore.contact">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Top gradient bar -->
          <div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <!-- Contact Summary Card -->
          <div class="px-6 py-5 border-b border-gray-100 flex items-center">
            <q-avatar
              color="blue-100"
              text-color="blue-700"
              size="56px"
              font-size="20px"
              class="shadow-sm border border-blue-200 mr-4"
            >
              {{ getInitials(contactsStore.contact.name) }}
            </q-avatar>
            <div>
              <h2 class="text-xl font-semibold text-gray-800">{{ contactsStore.contact.name }}</h2>
              <div class="text-gray-500 flex items-center mt-1">
                <i class="material-icons text-sm mr-1">{{
                  contactsStore.contact.email ? 'email' : 'phone'
                }}</i>
                {{
                  contactsStore.contact.email ||
                  formatPhone(contactsStore.contact.phone) ||
                  'No contact information'
                }}
              </div>
            </div>
            <div v-if="contactsStore.contact.status" class="ml-auto">
              <div
                class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset"
                :class="getStatusTailwindClasses(contactsStore.contact.status)"
              >
                <span class="mr-1">Current Status:</span> {{ contactsStore.contact.status }}
              </div>
            </div>
          </div>

          <q-form @submit="updateContact" class="p-6 md:p-8" ref="contactForm">
            <!-- Status Section -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <div
                  class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3"
                >
                  <i class="material-icons text-green-600 text-sm">assignment</i>
                </div>
                Update Status
              </h2>
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
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="bookmark" class="text-gray-400" />
                    </template>
                    <template v-slot:selected-item="scope">
                      <div class="flex items-center">
                        <div
                          v-if="scope.opt"
                          class="w-3 h-3 rounded-full mr-2"
                          :class="getStatusBgColor(scope.opt)"
                        ></div>
                        <span>{{ scope.opt || 'No Status' }}</span>
                      </div>
                    </template>
                    <template v-slot:option="scope">
                      <q-item
                        v-bind="scope.itemProps"
                        class="rounded-lg my-1 transition-colors duration-200"
                      >
                        <q-item-section>
                          <q-item-label class="flex items-center">
                            <div
                              v-if="scope.opt"
                              class="w-3 h-3 rounded-full mr-2"
                              :class="getStatusBgColor(scope.opt)"
                            ></div>
                            <span>{{ scope.opt || 'No Status' }}</span>
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
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>

                <!-- Status Notes -->
                <div class="md:col-span-2">
                  <q-input
                    v-model="form.status_notes"
                    label="Status Notes"
                    type="textarea"
                    rows="4"
                    class="w-full"
                    outlined
                    lazy-rules
                    bottom-slots
                    :rules="[
                      (val) => !val || val.length <= 500 || 'Notes must be 500 characters or less',
                    ]"
                    hint="Add any relevant notes about why you're changing this contact's status"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="notes" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Status History -->
            <div v-if="statusHistory.length > 0" class="mb-6">
              <h3 class="text-md font-medium text-gray-700 mb-3 flex items-center">
                <i class="material-icons text-gray-500 mr-2">history</i>
                Status History
              </h3>
              <div class="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                <div
                  class="p-4 border-b border-gray-100 last:border-b-0"
                  v-for="(item, index) in statusHistory"
                  :key="index"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex items-center">
                      <div
                        class="w-2 h-2 rounded-full mr-2"
                        :class="getStatusBgColor(item.status)"
                      ></div>
                      <span class="font-medium text-gray-800">{{
                        item.status || 'No Status'
                      }}</span>
                    </div>
                    <div class="text-sm text-gray-500">{{ item.date }}</div>
                  </div>
                  <div v-if="item.notes" class="text-sm text-gray-600 mt-2 ml-4">
                    {{ item.notes }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Form actions -->
            <div class="flex justify-end space-x-4 mt-10 pt-6 border-t border-gray-100">
              <q-btn
                flat
                label="Cancel"
                @click="$router.back()"
                :disable="isSubmitting"
                class="px-6 text-gray-600 hover:bg-gray-50 rounded-lg"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Update Status"
                :loading="isSubmitting"
                class="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-sm rounded-lg"
                unelevated
              />
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

// Mock status history (in a real app, you'd fetch this from the API)
const statusHistory = ref([
  // Sample history, replace with real data in production
  {
    status: 'New',
    date: '2 weeks ago',
    notes: 'Initial contact added to system',
  },
  {
    status: 'Initiated',
    date: '10 days ago',
    notes: 'Called client to discuss options',
  },
  {
    status: 'Submitted',
    date: '5 days ago',
    notes: 'Application forms sent for review',
  },
])

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
// const getStatusColor = (status) => {
//   const colors = {
//     New: 'blue-4',
//     Initiated: 'purple-3',
//     Submitted: 'teal-3',
//     'In Review': 'amber-4',
//     Approved: 'green-3',
//     Rejected: 'pink-3',
//     Assigned: 'indigo-3',
//     Finalized: 'green-6',
//   }
//   return colors[status] || 'grey-5'
// }

// Status background colors for Tailwind classes
const getStatusBgColor = (status) => {
  const colors = {
    New: 'bg-blue-500',
    Initiated: 'bg-purple-500',
    Submitted: 'bg-teal-500',
    'In Review': 'bg-amber-500',
    Approved: 'bg-green-500',
    Rejected: 'bg-pink-500',
    Assigned: 'bg-indigo-500',
    Finalized: 'bg-emerald-500',
  }
  return colors[status] || 'bg-gray-500'
}

// Status tailwind classes for badges
const getStatusTailwindClasses = (status) => {
  const classes = {
    New: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Initiated: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    Submitted: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    'In Review': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Approved: 'bg-green-50 text-green-700 ring-green-600/20',
    Rejected: 'bg-pink-50 text-pink-700 ring-pink-600/20',
    Assigned: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    Finalized: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  }
  return classes[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20'
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

// Format phone number for display
const formatPhone = (phone) => {
  if (!phone) return null

  // Extract digits only
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  return phone
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
      message: 'Contact status updated successfully',
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
/* Custom styling for form elements */
.q-field ::v-deep(.q-field__control) {
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.q-field ::v-deep(.q-field__control:hover) {
  border-color: #d1d5db;
}

.q-field ::v-deep(.q-field__control.q-field__control--focused) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}
</style>
