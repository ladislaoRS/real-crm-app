<template>
  <!-- Notice we're not using q-page directly -->
  <div class="flex flex-center bg-gray-100 fullscreen min-h-screen px-4 sm:px-0">
    <div class="w-full max-w-md px-8 py-6 bg-white rounded-lg shadow-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Real CRM</h1>
        <p class="text-gray-600">Log in to your account</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <!-- Remember me -->
        <div class="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            v-model="remember"
            class="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <label for="remember" class="text-sm text-gray-600">Remember me</label>
        </div>

        <!-- Error message -->
        <div
          v-if="authStore.error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ authStore.error }}
        </div>

        <!-- Submit -->
        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-60"
          >
            <span v-if="!authStore.loading">Login</span>
            <span v-else>Loading...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth.store'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

// Form state
const email = ref('')
const password = ref('')
const remember = ref(false)

const onSubmit = async () => {
  try {
    const success = await authStore.login(email.value, password.value)

    if (success) {
      $q.notify({
        color: 'positive',
        message: 'Login successful',
        icon: 'check',
      })

      // Use router.push with a callback to ensure navigation completes
      router.push({ name: 'dashboard' }).catch((err) => {
        console.error('Navigation error:', err)
        // If navigation fails, force a refresh
        window.location.href = '/#/'
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    // Error is already handled by the store
  }
}
</script>
