<template>
  <q-layout view="lHh Lpr lFf" class="bg-gray-50 text-gray-900">
    <!-- Header -->
    <q-header elevated class="bg-white shadow-sm border-b border-gray-200">
      <q-toolbar class="container mx-auto px-4 h-16">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
        />

        <q-toolbar-title class="text-xl font-bold text-gray-800">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
            >RealCRM</span
          >
        </q-toolbar-title>

        <!-- User dropdown menu -->
        <q-btn flat round class="hover:bg-gray-100 transition-all duration-300">
          <q-avatar size="36px" class="border-2 border-gray-200 shadow-sm">
            <img src="https://cdn.quasar.dev/img/avatar.png" alt="Avatar" />
          </q-avatar>

          <q-menu class="rounded-xl shadow-xl border border-gray-100">
            <q-list style="min-width: 180px" class="py-2">
              <q-item
                clickable
                v-close-popup
                @click="onLogout"
                class="hover:bg-gray-50 transition-all duration-200 mx-2 rounded-lg"
              >
                <q-item-section avatar>
                  <q-icon name="logout" class="text-gray-500" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white shadow-sm border-r border-gray-200"
      :breakpoint="1024"
    >
      <div class="flex flex-col h-full">
        <div class="p-4 border-b border-gray-100 flex items-center justify-center">
          <div
            class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            RealCRM
          </div>
        </div>

        <q-scroll-area class="flex-grow">
          <q-list class="p-3">
            <q-item-label
              header
              class="text-xs uppercase tracking-wider text-gray-500 font-semibold px-2 pt-4 pb-2"
            >
              Menu
            </q-item-label>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'dashboard' }"
              exact
              active-class="text-blue-600 bg-blue-50 font-medium"
              class="hover:bg-gray-50 transition-all duration-200 rounded-lg my-1"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" class="text-gray-500" />
              </q-item-section>
              <q-item-section>Dashboard</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'contacts' }"
              exact
              active-class="text-blue-600 bg-blue-50 font-medium"
              class="hover:bg-gray-50 transition-all duration-200 rounded-lg my-1"
            >
              <q-item-section avatar>
                <q-icon name="people" class="text-gray-500" />
              </q-item-section>
              <q-item-section>Contacts</q-item-section>
            </q-item>

            <q-separator class="my-4" />

            <q-item-label
              header
              class="text-xs uppercase tracking-wider text-gray-500 font-semibold px-2 pt-2 pb-2"
            >
              Tools
            </q-item-label>

            <q-item
              clickable
              v-ripple
              class="hover:bg-gray-50 transition-all duration-200 rounded-lg my-1"
            >
              <q-item-section avatar>
                <q-icon name="settings" class="text-gray-500" />
              </q-item-section>
              <q-item-section>Settings</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <div class="p-4 border-t border-gray-100">
          <div class="rounded-lg bg-blue-50 p-4">
            <div class="flex items-center">
              <q-icon name="help_outline" class="text-blue-500 mr-3" />
              <div class="text-sm font-medium text-gray-800">Need help?</div>
            </div>
            <p class="text-xs text-gray-600 mt-2">
              Contact support for assistance with your account.
            </p>
            <q-btn
              unelevated
              color="primary"
              label="Support"
              size="sm"
              class="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// No changes to logic
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth.store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function onLogout() {
  try {
    await authStore.logout()
    $q.notify({
      color: 'positive',
      message: 'Logged out successfully',
      icon: 'logout',
    })
    router.push({ name: 'login' })
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to logout',
      icon: 'error',
    })
  }
}
</script>
