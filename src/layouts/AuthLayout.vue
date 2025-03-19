<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> PingCRM </q-toolbar-title>

        <!-- User dropdown menu -->
        <q-btn flat round>
          <q-avatar size="26px">
            <img src="https://cdn.quasar.dev/img/avatar.png" alt="Avatar" />
          </q-avatar>

          <q-menu>
            <q-list style="min-width: 150px">
              <q-item>
                <q-item-section>{{ authStore.username || 'User' }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="onLogout">
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header>Navigation</q-item-label>

        <q-item clickable v-ripple :to="{ name: 'dashboard' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'contacts' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Contacts</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth.store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)

// Check authentication on mount
onMounted(async () => {
  await authStore.checkAuth()
})

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
