<template>
  <q-page class="bg-gray-100 min-h-screen">
    <div class="container mx-auto py-6 px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Contacts Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Contacts</h2>
              <q-icon name="people" size="md" color="primary" />
            </div>
            <div v-if="contactsLoading" class="mt-2">
              <q-spinner-dots color="primary" />
            </div>
            <div v-else class="text-3xl font-bold mt-2">
              {{ totalContacts }}
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              flat
              color="primary"
              label="View All"
              @click="$router.push({ name: 'contacts' })"
            />
          </q-card-actions>
        </q-card>

        <!-- Welcome Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <h2 class="text-lg font-semibold">Welcome back, {{ authStore.username || 'User' }}</h2>
            <p class="mt-2">This is a simple CRM built with Quasar, Vue 3, and Tailwind CSS.</p>
          </q-card-section>
        </q-card>

        <!-- API Integration Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <h2 class="text-lg font-semibold">API Integration</h2>
            <p class="mt-2">This application is connected to the PingCRM API.</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth.store'
import api from 'src/services/api.service'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const totalContacts = ref(0)
const contactsLoading = ref(true)

onMounted(async () => {
  try {
    // Directly fetch contact count without using the store
    // This avoids filter persistence issues
    await fetchTotalContacts()
  } catch (error) {
    console.error('Failed to fetch contacts:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load contact count',
      icon: 'error',
    })
  }
})

// Fetch total contacts directly, bypassing the store's filters
const fetchTotalContacts = async () => {
  contactsLoading.value = true
  try {
    const response = await api.getContacts(1, '', null) // no search, no filter
    totalContacts.value = response.data.meta.total
  } catch (error) {
    console.error('Error fetching total contacts:', error)
  } finally {
    contactsLoading.value = false
  }
}
</script>
