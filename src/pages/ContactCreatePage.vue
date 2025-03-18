<template>
  <q-page class="bg-gray-100 min-h-screen py-6 px-4">
    <div class="container mx-auto">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <q-btn flat round icon="arrow_back" color="primary" @click="$router.back()" />
        <h1 class="text-3xl font-bold text-gray-800 ml-2">Create Contact</h1>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form @submit.prevent="createContact" class="space-y-6">
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
            <q-btn type="submit" color="primary" label="Create Contact" :loading="isSubmitting" />
          </div>
        </form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useContactsStore } from 'src/stores/contacts.store'

const router = useRouter()
const $q = useQuasar()
const contactsStore = useContactsStore()

// State
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

// Create contact handler
const createContact = async () => {
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

    await contactsStore.createContact(form.value)

    $q.notify({
      color: 'positive',
      message: 'Contact created successfully',
      icon: 'check',
    })

    router.push({ name: 'contacts' })
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: contactsStore.error || 'An error occurred while creating the contact',
      icon: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
