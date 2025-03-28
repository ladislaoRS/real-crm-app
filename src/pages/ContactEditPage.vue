<template>
  <q-page class="bg-gray-50 min-h-screen py-8 px-1 sm:px-6">
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
          <span v-else-if="contactsStore.contact">Edit {{ contactsStore.contact.name }}</span>
          <span v-else>Edit Contact</span>
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

          <q-form @submit="updateContact" class="p-6 md:p-8" ref="contactForm">
            <!-- Personal Information -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i class="material-icons text-blue-600 text-sm">person</i>
                </div>
                Personal Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- First name -->
                <div>
                  <q-input
                    v-model="form.first_name"
                    label="First name *"
                    class="w-full"
                    :rules="[
                      (val) => !!val || 'First name is required',
                      (val) => val.length <= 50 || 'First name must be 50 characters or less',
                    ]"
                    outlined
                    lazy-rules
                    bottom-slots
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>

                <!-- Last name -->
                <div>
                  <q-input
                    v-model="form.last_name"
                    label="Last name *"
                    class="w-full"
                    :rules="[
                      (val) => !!val || 'Last name is required',
                      (val) => val.length <= 50 || 'Last name must be 50 characters or less',
                    ]"
                    outlined
                    lazy-rules
                    bottom-slots
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>

                <!-- Email -->
                <div>
                  <q-input
                    v-model="form.email"
                    label="Email"
                    type="email"
                    class="w-full"
                    :rules="[
                      (val) =>
                        !val || emailPattern.test(val) || 'Please enter a valid email address',
                    ]"
                    outlined
                    lazy-rules
                    bottom-slots
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>

                <!-- Phone -->
                <div>
                  <q-input
                    v-model="form.phone"
                    label="Phone"
                    class="w-full"
                    :rules="[
                      (val) =>
                        !val || phonePattern.test(val) || 'Please enter a valid US phone number',
                    ]"
                    outlined
                    mask="(###) ###-####"
                    hint="Format: (555) 123-4567"
                    lazy-rules
                    bottom-slots
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Address Information -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <div
                  class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3"
                >
                  <i class="material-icons text-indigo-600 text-sm">home</i>
                </div>
                Address Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Address -->
                <div class="md:col-span-2">
                  <q-input
                    v-model="form.address"
                    label="Address"
                    class="w-full"
                    :rules="[
                      (val) =>
                        !val || val.length <= 150 || 'Address must be 150 characters or less',
                    ]"
                    outlined
                    lazy-rules
                    bottom-slots
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_on" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>

                <!-- City -->
                <div>
                  <q-input
                    v-model="form.city"
                    label="City"
                    class="w-full"
                    :rules="[
                      (val) => !val || val.length <= 50 || 'City must be 50 characters or less',
                    ]"
                    outlined
                    lazy-rules
                    bottom-slots
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_city" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>

                <!-- State/Region (Dropdown) -->
                <div>
                  <q-select
                    v-model="form.region"
                    :options="stateOptions"
                    label="State"
                    class="w-full"
                    outlined
                    map-options
                    emit-value
                    lazy-rules
                    bottom-slots
                    :rules="[
                      (val) =>
                        !val ||
                        stateOptions.some((state) => state.value === val) ||
                        'Please select a valid state',
                    ]"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="flag" class="text-gray-400" />
                    </template>
                  </q-select>
                </div>

                <!-- Country (Fixed to US) -->
                <div>
                  <q-input
                    v-model="form.country"
                    label="Country"
                    class="w-full"
                    outlined
                    readonly
                    disable
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="public" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>

                <!-- Postal code -->
                <div>
                  <q-input
                    v-model="form.postal_code"
                    label="Postal code"
                    class="w-full"
                    :rules="[
                      (val) =>
                        !val || zipCodePattern.test(val) || 'Please enter a valid US ZIP code',
                    ]"
                    outlined
                    hint="Format: 12345 or 12345-6789"
                    lazy-rules
                    bottom-slots
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="markunread_mailbox" class="text-gray-400" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Status Section -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <div
                  class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3"
                >
                  <i class="material-icons text-green-600 text-sm">assignment</i>
                </div>
                Status Information
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
                          class="w-3 h-3 rounded-full mr-2"
                          :class="getStatusBgColor(scope.opt)"
                        ></div>
                        <span>{{ scope.opt }}</span>
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
                              class="w-3 h-3 rounded-full mr-2"
                              :class="getStatusBgColor(scope.opt)"
                            ></div>
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
                    rows="3"
                    class="w-full"
                    outlined
                    lazy-rules
                    bottom-slots
                    :rules="[
                      (val) => !val || val.length <= 500 || 'Notes must be 500 characters or less',
                    ]"
                    hint="Add any relevant notes about this contact's status"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="notes" class="text-gray-400" />
                    </template>
                  </q-input>
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
                label="Update Contact"
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

// Status options
const statusOptions = [
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

// Validation patterns
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/
const zipCodePattern = /^\d{5}(-\d{4})?$/

// US States options
const stateOptions = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
]

// Load contact on mount
onMounted(async () => {
  await loadContact()
})

// Watch for changes in the contact store and update the form
watch(
  () => contactsStore.contact,
  (newContact) => {
    if (newContact) {
      // Format phone number if it exists but doesn't match our format
      let formattedPhone = newContact.phone || ''
      if (formattedPhone && !phonePattern.test(formattedPhone)) {
        // Extract digits only
        const digits = formattedPhone.replace(/\D/g, '')
        if (digits.length === 10) {
          formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
        }
      }

      form.value = {
        first_name: newContact.first_name,
        last_name: newContact.last_name,
        email: newContact.email || '',
        phone: formattedPhone,
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

    // Format phone for API if it's in our masked format
    if (form.value.phone && phonePattern.test(form.value.phone)) {
      // Extract just the digits for the API
      const digits = form.value.phone.replace(/\D/g, '')
      form.value.phone = digits
    }

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
