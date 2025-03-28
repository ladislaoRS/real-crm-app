<template>
  <q-page class="bg-gray-50 min-h-screen">
    <div class="container mx-auto py-8 px-2 sm:px-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <!-- Contact Stats Cards (Mosaic Style) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <!-- Card Example -->
        <q-card
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
        >
          <q-card-section>
            <h2 class="text-lg font-semibold text-gray-700 mb-3">Today's New</h2>
            <div v-if="loading">
              <q-spinner-dots color="amber" />
            </div>
            <div v-else>
              <div class="text-3xl font-bold text-gray-900">{{ contactsToday }}</div>
              <div class="text-sm text-gray-500 mt-2 flex items-center">
                <span class="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                Added today
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Repeat same pattern for other cards -->
        <q-card
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
        >
          <q-card-section>
            <h2 class="text-lg font-semibold text-gray-700 mb-3">New This Week</h2>
            <div v-if="loading">
              <q-spinner-dots color="blue" />
            </div>
            <div v-else>
              <div class="flex items-baseline">
                <div class="text-3xl font-bold text-gray-900">{{ contactsThisWeek }}</div>
                <div
                  class="ml-3 text-xs font-medium px-2 py-1 rounded-full flex items-center"
                  :class="
                    weekTrend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  "
                >
                  <q-icon
                    :name="weekTrend >= 0 ? 'arrow_upward' : 'arrow_downward'"
                    size="xs"
                    class="mr-1"
                  />
                  {{ Math.abs(weekTrend) }}%
                </div>
              </div>
              <div class="text-sm text-gray-500 mt-2 flex items-center">
                <span class="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                Previous week
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
        >
          <q-card-section>
            <h2 class="text-lg font-semibold text-gray-700 mb-3">New This Month</h2>
            <div v-if="loading">
              <q-spinner-dots color="green" />
            </div>
            <div v-else>
              <div class="flex items-baseline">
                <div class="text-3xl font-bold text-gray-900">{{ contactsThisMonth }}</div>
                <div
                  class="ml-3 text-xs font-medium px-2 py-1 rounded-full flex items-center"
                  :class="
                    monthTrend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  "
                >
                  <q-icon
                    :name="monthTrend >= 0 ? 'arrow_upward' : 'arrow_downward'"
                    size="xs"
                    class="mr-1"
                  />
                  {{ Math.abs(monthTrend) }}%
                </div>
              </div>
              <div class="text-sm text-gray-500 mt-2 flex items-center">
                <span class="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                Previous month
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
        >
          <q-card-section>
            <h2 class="text-lg font-semibold text-gray-700 mb-3">Daily Average</h2>
            <div v-if="loading">
              <q-spinner-dots color="purple" />
            </div>
            <div v-else>
              <div class="text-3xl font-bold text-gray-900">{{ avgPerDay }}</div>
              <div class="text-sm text-gray-500 mt-2 flex items-center">
                <span class="inline-block w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                Added per day
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
        >
          <q-card-section>
            <h2 class="text-lg font-semibold text-gray-700 mb-3">Total Contacts</h2>
            <div v-if="loading">
              <q-spinner-dots color="primary" />
            </div>
            <div v-else>
              <div class="text-3xl font-bold text-gray-900">{{ totalContacts }}</div>
              <div class="text-sm text-gray-500 mt-2 flex items-center">
                <span class="inline-block w-3 h-3 rounded-full bg-indigo-400 mr-2"></span>
                In database
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Welcome & Recently Added -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Welcome Card -->
        <q-card
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-indigo-500 to-blue-600 h-2"></div>
          <q-card-section class="pt-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
              Welcome back, {{ authStore.username || 'User' }}
            </h2>
            <p class="text-gray-600">
              Here's an overview of your contacts activity for the past 30 days.
            </p>

            <div class="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 class="text-sm font-semibold text-gray-700 mb-4">Quick Summary</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="text-sm text-gray-600 flex items-center">
                  <span class="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                  Today:
                </div>
                <div class="text-sm font-medium text-gray-800">{{ contactsToday }} contacts</div>

                <div class="text-sm text-gray-600 flex items-center">
                  <span class="inline-block w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                  Yesterday:
                </div>
                <div class="text-sm font-medium text-gray-800">
                  {{ contactsYesterday }} contacts
                </div>

                <div class="text-sm text-gray-600 flex items-center">
                  <span class="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                  This Month:
                </div>
                <div class="text-sm font-medium text-gray-800">
                  {{ contactsThisMonth }} contacts
                </div>

                <div class="text-sm text-gray-600 flex items-center">
                  <span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                  Last Month:
                </div>
                <div class="text-sm font-medium text-gray-800">
                  {{ contactsLastMonth }} contacts
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <q-btn
              unelevated
              color="primary"
              icon="people"
              label="View All Contacts"
              class="rounded-lg px-4 font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all duration-300"
              @click="$router.push({ name: 'contacts' })"
            />
          </q-card-actions>
        </q-card>

        <!-- Recently Added Contacts -->
        <q-card
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2"></div>
          <q-card-section class="pt-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-gray-800">Recently Added</h2>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="refresh"
                class="bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
                @click="fetchStats"
              />
            </div>
          </q-card-section>

          <q-list separator class="divide-y divide-gray-100">
            <div v-if="loading" class="flex justify-center py-6">
              <q-spinner color="primary" />
            </div>
            <template v-else-if="recentContacts.length > 0">
              <q-item
                v-for="contact in recentContacts"
                :key="contact.id"
                clickable
                @click="goToContact(contact.id)"
                class="hover:bg-blue-50 transition-colors duration-200 px-5 py-3"
              >
                <q-item-section avatar>
                  <q-avatar
                    color="blue-100"
                    text-color="blue-700"
                    class="shadow-sm border border-blue-200"
                  >
                    {{ getInitials(contact.name) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-medium text-gray-800">{{ contact.name }}</q-item-label>
                  <q-item-label caption class="text-xs text-gray-500 mt-1">
                    Added {{ formatDate(contact.created_at) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    color="blue-600"
                    icon="edit"
                    class="bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                    @click.stop="goToContact(contact.id)"
                  />
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section>
                <q-item-label class="text-center text-gray-500 py-6">
                  No recent contacts found
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-actions align="center" class="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <q-btn
              unelevated
              color="primary"
              label="Add New Contact"
              icon="add"
              class="w-full rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
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
