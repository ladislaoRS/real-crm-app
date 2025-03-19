<template>
  <!-- Notice we're not using q-page directly -->
  <div class="flex flex-center bg-gray-100 fullscreen">
    <div class="w-full max-w-md px-8 py-6 bg-white rounded-lg shadow-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Real CRM</h1>
        <p class="text-gray-600">Log in to your account</p>
      </div>

      <q-form @submit="onSubmit" class="space-y-4">
        <div>
          <q-input
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            class="w-full"
            :rules="[(val) => !!val || 'Email is required']"
          />
        </div>

        <div>
          <q-input
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            class="w-full"
            :rules="[(val) => !!val || 'Password is required']"
          />
        </div>

        <div class="flex items-center">
          <q-checkbox v-model="remember" label="Remember me" />
        </div>

        <div
          v-if="authStore.error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ authStore.error }}
        </div>

        <div>
          <q-btn
            type="submit"
            color="primary"
            class="w-full"
            :loading="authStore.loading"
            label="Login"
          />
        </div>
      </q-form>
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
