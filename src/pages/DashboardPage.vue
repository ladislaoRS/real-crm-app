<template>
  <q-page class="bg-gray-100 min-h-screen">
    <div class="container mx-auto py-6 px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <!-- Contact Stats Cards (Mosaic Style) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <!-- Today's New Contacts Card -->
        <q-card class="bg-white rounded-lg shadow">
          <q-card-section>
            <h2 class="text-xl font-medium text-gray-800 mb-2">Today's New</h2>
            <div v-if="loading">
              <q-spinner-dots color="amber" />
            </div>
            <div v-else>
              <div class="text-3xl font-bold text-gray-800">{{ contactsToday }}</div>
              <div class="text-sm text-gray-500 mt-1">Added today</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- New Contacts This Week Card -->
        <q-card class="bg-white rounded-lg shadow">
          <q-card-section>
            <h2 class="text-xl font-medium text-gray-800 mb-2">New This Week</h2>
            <div v-if="loading">
              <q-spinner-dots color="blue" />
            </div>
            <div v-else>
              <div class="flex items-baseline">
                <div class="text-3xl font-bold text-gray-800">{{ contactsThisWeek }}</div>
                <div
                  class="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="
                    weekTrend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  "
                >
                  <q-icon :name="weekTrend >= 0 ? 'arrow_upward' : 'arrow_downward'" size="xs" />
                  {{ Math.abs(weekTrend) }}%
                </div>
              </div>
              <div class="text-sm text-gray-500 mt-1">Previous week</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- New Contacts This Month Card -->
        <q-card class="bg-white rounded-lg shadow">
          <q-card-section>
            <h2 class="text-xl font-medium text-gray-800 mb-2">New This Month</h2>
            <div v-if="loading">
              <q-spinner-dots color="green" />
            </div>
            <div v-else>
              <div class="flex items-baseline">
                <div class="text-3xl font-bold text-gray-800">{{ contactsThisMonth }}</div>
                <div
                  class="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="
                    monthTrend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  "
                >
                  <q-icon :name="monthTrend >= 0 ? 'arrow_upward' : 'arrow_downward'" size="xs" />
                  {{ Math.abs(monthTrend) }}%
                </div>
              </div>
              <div class="text-sm text-gray-500 mt-1">Previous month</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Average Created Per Day Card -->
        <q-card class="bg-white rounded-lg shadow">
          <q-card-section>
            <h2 class="text-xl font-medium text-gray-800 mb-2">Daily Average</h2>
            <div v-if="loading">
              <q-spinner-dots color="purple" />
            </div>
            <div v-else>
              <div class="text-3xl font-bold text-gray-800">{{ avgPerDay }}</div>
              <div class="text-sm text-gray-500 mt-1">Added per day</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Total Contacts Card -->
        <q-card class="bg-white rounded-lg shadow">
          <q-card-section>
            <h2 class="text-xl font-medium text-gray-800 mb-2">Total Contacts</h2>
            <div v-if="loading">
              <q-spinner-dots color="primary" />
            </div>
            <div v-else>
              <div class="text-3xl font-bold text-gray-800">{{ totalContacts }}</div>
              <div class="text-sm text-gray-500 mt-1">In database</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Welcome Card & Recent Activity -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Welcome Card -->
        <q-card class="bg-white rounded-lg shadow">
          <q-card-section>
            <h2 class="text-2xl font-semibold text-gray-800 mb-3">
              Welcome back, {{ authStore.username || 'User' }}
            </h2>
            <p class="text-gray-600">
              Here's an overview of your contacts activity for the past 30 days.
            </p>

            <!-- Mini stats table -->
            <div class="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-600 mb-3">Quick Summary</h3>
              <div class="grid grid-cols-2 gap-2">
                <div class="text-gray-600 text-sm">Today:</div>
                <div class="text-sm font-medium text-gray-600">{{ contactsToday }} contacts</div>

                <div class="text-gray-600 text-sm">Yesterday:</div>
                <div class="text-sm font-medium text-gray-600">
                  {{ contactsYesterday }} contacts
                </div>

                <div class="text-gray-600 text-sm">This Month:</div>
                <div class="text-sm font-medium text-gray-600">
                  {{ contactsThisMonth }} contacts
                </div>

                <div class="text-gray-600 text-sm">Last Month:</div>
                <div class="text-sm font-medium text-gray-600">
                  {{ contactsLastMonth }} contacts
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              icon="people"
              label="View All Contacts"
              @click="$router.push({ name: 'contacts' })"
            />
          </q-card-actions>
        </q-card>

        <!-- Recently Added Contacts -->
        <q-card class="bg-white rounded-lg shadow">
          <q-card-section>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-semibold text-gray-800">Recently Added</h2>
              <q-btn flat round dense color="primary" icon="refresh" @click="fetchStats" />
            </div>
          </q-card-section>

          <q-list separator>
            <div v-if="loading" class="flex justify-center py-4">
              <q-spinner color="primary" />
            </div>
            <template v-else-if="recentContacts.length > 0">
              <q-item
                v-for="contact in recentContacts"
                :key="contact.id"
                clickable
                @click="goToContact(contact.id)"
                class="py-3"
              >
                <q-item-section avatar>
                  <q-avatar color="blue-2" text-color="blue-8" class="shadow-sm">
                    {{ getInitials(contact.name) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-medium">{{ contact.name }}</q-item-label>
                  <q-item-label caption class="text-xs">
                    Added {{ formatDate(contact.created_at) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    color="blue-6"
                    icon="edit"
                    class="bg-blue-50 hover:bg-blue-100"
                    @click.stop="goToContact(contact.id)"
                  />
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section>
                <q-item-label class="text-center text-gray-500 py-4">
                  No recent contacts found
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-actions align="center" class="bg-gray-50 rounded-b-lg">
            <q-btn
              color="primary"
              label="Add New Contact"
              icon="add"
              class="w-full"
              @click="$router.push({ name: 'contact-create' })"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from 'src/stores/auth.store'
import { useContactsStore } from 'src/stores/contacts.store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const contactsStore = useContactsStore()

// Computed properties for easy access to state
const loading = computed(() => contactsStore.loading)
const stats = computed(() => contactsStore.dashboardStats)
const recentContacts = computed(() => contactsStore.recentContacts)
const weekTrend = computed(() => contactsStore.weekTrend)
const monthTrend = computed(() => contactsStore.monthTrend)

// Destructure stats for easier template binding
const totalContacts = computed(() => stats.value.totalContacts)
const contactsToday = computed(() => stats.value.contactsToday)
const contactsYesterday = computed(() => stats.value.contactsYesterday)
const contactsThisWeek = computed(() => stats.value.contactsThisWeek)
const contactsThisMonth = computed(() => stats.value.contactsThisMonth)
const contactsLastMonth = computed(() => stats.value.contactsLastMonth)
const avgPerDay = computed(() => stats.value.avgPerDay)

onMounted(async () => {
  await fetchStats()
})

// Fetch all dashboard data
const fetchStats = async () => {
  try {
    await contactsStore.fetchAllDashboardData()
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load dashboard data',
      icon: 'error',
    })
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

// Format date in a friendly way
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = parseISO(dateString)
  const now = new Date()

  if (isToday(date)) {
    return 'Today'
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else {
    const days = differenceInDays(now, date)
    if (days < 7) {
      return `${days} days ago`
    } else {
      return format(date, 'MMM d, yyyy')
    }
  }
}

// Navigate to contact edit page
const goToContact = (id) => {
  router.push({ name: 'contact-edit', params: { id } })
}
</script>
