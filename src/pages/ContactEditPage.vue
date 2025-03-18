<template>
  <q-page class="bg-gray-100 min-h-screen py-6 px-4">
    <div class="container mx-auto">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <q-btn flat round icon="arrow_back" color="primary" @click="$router.back()" />
        <h1 class="text-3xl font-bold text-gray-800 ml-2">
          <span v-if="contactsStore.loading">Loading...</span>
          <span v-else-if="contactsStore.contact">Edit {{ contactsStore.contact.name }}</span>
          <span v-else>Edit Contact</span>
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
          <form @submit.prevent="updateContact" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- First name -->
              <div>
                <q-input
                  v-model="form.first_name"
                  label="First name"
                  class="w-full"
                  :rules="[(val) => !!val || 'First name is required']"
                  outlined
                />
              </div>

              <!-- Last name -->
              <div>
                <q-input
                  v-model="form.last_name"
                  label="Last name"
                  class="w-full"
                  :rules="[(val) => !!val || 'Last name is required']"
                  outlined
                />
              </div>

              <!-- Organization (would need to be a dynamic select in a real app) -->
              <div>
                <q-select
                  v-model="form.organization_id"
                  :options="organizationOptions"
                  label="Organization"
                  class="w-full"
                  outlined
                  emit-value
                  map-options
                />
              </div>

              <!-- Email -->
              <div>
                <q-input v-model="form.email" label="Email" type="email" class="w-full" outlined />
              </div>

              <!-- Phone -->
              <div>
                <q-input v-model="form.phone" label="Phone" class="w-full" outlined />
              </div>

              <!-- Address -->
              <div class="md:col-span-2">
                <q-input v-model="form.address" label="Address" class="w-full" outlined />
              </div>

              <!-- City -->
              <div>
                <q-input v-model="form.city" label="City" class="w-full" outlined />
              </div>

              <!-- Region -->
              <div>
                <q-input v-model="form.region" label="State/Province" class="w-full" outlined />
              </div>

              <!-- Country -->
              <div>
                <q-input v-model="form.country" label="Country" class="w-full" outlined />
              </div>

              <!-- Postal code -->
              <div>
                <q-input v-model="form.postal_code" label="Postal code" class="w-full" outlined />
              </div>
            </div>

            <!-- Form actions -->
            <div class="flex justify-end space-x-3 mt-8">
              <q-btn flat label="Cancel" @click="$router.back()" :disable="isSubmitting" />
              <q-btn type="submit" color="primary" label="Update Contact" :loading="isSubmitting" />
            </div>
          </form>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useContactsStore } from 'src/stores/contacts.store'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()

// State
const isLoading = ref(true)
const isSubmitting = ref(false)
const form = ref({
  first_name: '',
  last_name: '',
  organization_id: null,
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  country: '',
  postal_code: '',
})

// Sample organization options (in a real app, these would be fetched from the API)
const organizationOptions = [
  { label: 'Acme Inc.', value: 1 },
  { label: 'Widget Co.', value: 2 },
  { label: 'Example Corp.', value: 3 },
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
      form.value = {
        first_name: newContact.first_name,
        last_name: newContact.last_name,
        organization_id: newContact.organization_id,
        email: newContact.email || '',
        phone: newContact.phone || '',
        address: newContact.address || '',
        city: newContact.city || '',
        region: newContact.region || '',
        country: newContact.country || '',
        postal_code: newContact.postal_code || '',
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
  // Simple validation
  if (!form.value.first_name || !form.value.last_name) {
    $q.notify({
      color: 'negative',
      message: 'Please fill in all required fields',
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
