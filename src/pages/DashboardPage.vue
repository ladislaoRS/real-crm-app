<template>
  <q-page class="bg-gray-100 min-h-screen">
    <div class="container mx-auto py-6 px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <!-- Contact Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <!-- Today's New Contacts Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-600">Today's New</h2>
              <q-icon name="today" size="md" color="amber" />
            </div>
            <div v-if="loading" class="mt-2">
              <q-spinner-dots color="amber" />
            </div>
            <div v-else class="text-3xl font-bold mt-2 text-gray-800">
              {{ contactsToday }}
            </div>
            <div class="text-xs text-gray-500 mt-1">contacts added today</div>
          </q-card-section>
        </q-card>

        <!-- Total Contacts Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-600">Total Contacts</h2>
              <q-icon name="people" size="md" color="primary" />
            </div>
            <div v-if="loading" class="mt-2">
              <q-spinner-dots color="primary" />
            </div>
            <div v-else class="text-3xl font-bold mt-2 text-gray-800">
              {{ totalContacts }}
            </div>
          </q-card-section>
        </q-card>

        <!-- New Contacts This Month Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-600">New This Month</h2>
              <q-icon name="person_add" size="md" color="green" />
            </div>
            <div v-if="loading" class="mt-2">
              <q-spinner-dots color="green" />
            </div>
            <div v-else class="flex items-baseline mt-2">
              <span class="text-3xl font-bold text-gray-800">{{ contactsThisMonth }}</span>
              <span
                class="ml-2 text-sm"
                :class="monthTrend >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                <q-icon :name="monthTrend >= 0 ? 'arrow_upward' : 'arrow_downward'" size="sm" />
                {{ Math.abs(monthTrend) }}%
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">vs previous month</div>
          </q-card-section>
        </q-card>

        <!-- New Contacts This Week Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-600">New This Week</h2>
              <q-icon name="event" size="md" color="blue" />
            </div>
            <div v-if="loading" class="mt-2">
              <q-spinner-dots color="blue" />
            </div>
            <div v-else class="flex items-baseline mt-2">
              <span class="text-3xl font-bold text-gray-800">{{ contactsThisWeek }}</span>
              <span
                class="ml-2 text-sm"
                :class="weekTrend >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                <q-icon :name="weekTrend >= 0 ? 'arrow_upward' : 'arrow_downward'" size="sm" />
                {{ Math.abs(weekTrend) }}%
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">vs previous week</div>
          </q-card-section>
        </q-card>

        <!-- Average Created Per Day Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-600">Daily Average</h2>
              <q-icon name="analytics" size="md" color="purple" />
            </div>
            <div v-if="loading" class="mt-2">
              <q-spinner-dots color="purple" />
            </div>
            <div v-else class="text-3xl font-bold mt-2 text-gray-800">
              {{ avgPerDay }}
            </div>
            <div class="text-xs text-gray-500 mt-1">contacts added per day</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity & Other Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Welcome Card -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <h2 class="text-lg font-semibold text-gray-800">
              Welcome back, {{ authStore.username || 'User' }}
            </h2>
            <p class="mt-2 text-gray-600">
              Here's an overview of your contacts activity for the past 30 days.
            </p>

            <!-- Mini stats table -->
            <div class="mt-4 bg-gray-50 rounded p-4">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Quick Summary</h3>
              <div class="grid grid-cols-2 gap-2">
                <div class="text-gray-600 text-sm">Today:</div>
                <div class="text-sm font-medium">{{ contactsToday }} contacts</div>

                <div class="text-gray-600 text-sm">Yesterday:</div>
                <div class="text-sm font-medium">{{ contactsYesterday }} contacts</div>

                <div class="text-gray-600 text-sm">This Month:</div>
                <div class="text-sm font-medium">{{ contactsThisMonth }} contacts</div>

                <div class="text-gray-600 text-sm">Last Month:</div>
                <div class="text-sm font-medium">{{ contactsLastMonth }} contacts</div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="View All Contacts"
              @click="$router.push({ name: 'contacts' })"
            />
          </q-card-actions>
        </q-card>

        <!-- Recently Added Contacts -->
        <q-card class="bg-white shadow-sm">
          <q-card-section>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-800">Recently Added</h2>
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
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ getInitials(contact.name) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ contact.name }}</q-item-label>
                  <q-item-label caption> Added {{ formatDate(contact.created_at) }} </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    icon="edit"
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

          <q-card-actions align="center">
            <q-btn
              flat
              color="primary"
              label="Add New Contact"
              @click="$router.push({ name: 'contact-create' })"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from 'src/stores/auth.store'
import { useRouter } from 'vue-router'
import api from 'src/services/api.service'
import { useQuasar } from 'quasar'
import {
  format,
  parseISO,
  isToday,
  isYesterday,
  subDays,
  startOfWeek,
  startOfMonth,
  subMonths,
  subWeeks,
  differenceInDays,
  startOfDay,
} from 'date-fns'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// State
const loading = ref(true)
const allContacts = ref([])
const totalContacts = ref(0)
const contactsToday = ref(0)
const contactsYesterday = ref(0)
const contactsThisMonth = ref(0)
const contactsLastMonth = ref(0)
const contactsThisWeek = ref(0)
const contactsLastWeek = ref(0)
const recentContacts = ref([])

// Computed stats
const monthTrend = computed(() => {
  if (contactsLastMonth.value === 0) return 100 // If no contacts last month, show 100% increase
  const change = contactsThisMonth.value - contactsLastMonth.value
  return Math.round((change / contactsLastMonth.value) * 100)
})

const weekTrend = computed(() => {
  if (contactsLastWeek.value === 0) return 100 // If no contacts last week, show 100% increase
  const change = contactsThisWeek.value - contactsLastWeek.value
  return Math.round((change / contactsLastWeek.value) * 100)
})

const avgPerDay = computed(() => {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  // Count contacts created in the last 30 days
  const contactsLast30Days = allContacts.value.filter((contact) => {
    const createdDate = parseISO(contact.created_at)
    return createdDate >= thirtyDaysAgo
  }).length

  return (contactsLast30Days / 30).toFixed(1)
})

onMounted(async () => {
  await fetchStats()
})

// Fetch all dashboard stats
const fetchStats = async () => {
  loading.value = true

  try {
    // Get all contacts data to calculate stats
    await fetchAllContacts()

    // Calculate statistics from the contacts data
    calculateContactStats()

    // Get the 5 most recent contacts
    getRecentContacts()
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load dashboard data',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Fetch all contacts (we'll use this data to calculate various stats)
const fetchAllContacts = async () => {
  try {
    // We need to get all contacts, so we set a large page size
    // In a real app with many contacts, you'd want to do this calculation server-side
    const response = await api.getContacts(1, '', 'with', 1000)

    // Store all contact data and total
    allContacts.value = response.data.data
    totalContacts.value = response.data.meta.total

    console.log(`Fetched ${allContacts.value.length} contacts for stats calculation`)
  } catch (error) {
    console.error('Error fetching all contacts:', error)
    throw error
  }
}

// Calculate real stats from the contacts data
const calculateContactStats = () => {
  const now = new Date()

  // Start of current time periods
  const todayStart = startOfDay(now)
  const yesterdayStart = startOfDay(subDays(now, 1))
  const currentMonthStart = startOfMonth(now)
  const currentWeekStart = startOfWeek(now)

  // Start of previous time periods
  const previousMonthStart = startOfMonth(subMonths(now, 1))
  const previousWeekStart = startOfWeek(subWeeks(now, 1))

  // Count contacts in each time period
  contactsToday.value = countContactsCreatedAfter(todayStart)
  contactsYesterday.value = countContactsCreatedBetween(yesterdayStart, todayStart)
  contactsThisMonth.value = countContactsCreatedAfter(currentMonthStart)
  contactsLastMonth.value = countContactsCreatedBetween(previousMonthStart, currentMonthStart)
  contactsThisWeek.value = countContactsCreatedAfter(currentWeekStart)
  contactsLastWeek.value = countContactsCreatedBetween(previousWeekStart, currentWeekStart)

  console.log('Contact Stats:', {
    today: contactsToday.value,
    yesterday: contactsYesterday.value,
    thisMonth: contactsThisMonth.value,
    lastMonth: contactsLastMonth.value,
    monthTrend: monthTrend.value,
    thisWeek: contactsThisWeek.value,
    lastWeek: contactsLastWeek.value,
    weekTrend: weekTrend.value,
    avgPerDay: avgPerDay.value,
  })
}

// Count contacts created after a specific date
const countContactsCreatedAfter = (startDate) => {
  return allContacts.value.filter((contact) => {
    const createdDate = parseISO(contact.created_at)
    return createdDate >= startDate
  }).length
}

// Count contacts created between two dates
const countContactsCreatedBetween = (startDate, endDate) => {
  return allContacts.value.filter((contact) => {
    const createdDate = parseISO(contact.created_at)
    return createdDate >= startDate && createdDate < endDate
  }).length
}

// Get the 5 most recently created contacts
const getRecentContacts = () => {
  // Sort contacts by created_at date (newest first)
  const sorted = [...allContacts.value].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at)
  })

  // Take the first 5
  recentContacts.value = sorted.slice(0, 5)
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
