<template>
  <!-- Modern login page with gradient background -->
  <div
    class="flex flex-center bg-gradient-to-br from-gray-50 to-gray-100 fullscreen min-h-screen px-4 sm:px-0"
  >
    <div
      class="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <!-- Top gradient bar -->
      <div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

      <div class="px-8 py-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
              >Real CRM</span
            >
          </h1>
          <p class="text-gray-500">Log in to your account</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="material-icons text-gray-400 text-lg">email</i>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="mt-1 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="flex justify-between mb-1">
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <!-- <a
                href="#"
                class="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >Forgot password?</a
              > -->
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="material-icons text-gray-400 text-lg">lock</i>
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                class="mt-1 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- Remember me -->
          <div class="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              v-model="remember"
              class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label for="remember" class="text-sm text-gray-600">Remember me</label>
          </div>

          <!-- Error message -->
          <div
            v-if="authStore.error"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start"
          >
            <i class="material-icons text-red-500 mr-2">error_outline</i>
            <span>{{ authStore.error }}</span>
          </div>

          <!-- Submit -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] disabled:opacity-60 disabled:hover:translate-y-0 shadow-sm hover:shadow"
            >
              <span v-if="!authStore.loading" class="flex items-center justify-center">
                <i class="material-icons mr-1 text-sm">login</i>
                Sign In
              </span>
              <span v-else class="flex items-center justify-center">
                <q-spinner-dots color="white" size="1.5em" class="mr-2" />
                Signing in...
              </span>
            </button>
          </div>
        </form>

        <!-- Quick-access demo accounts block -->
        <!-- <div class="mt-8 pt-6 border-t border-gray-100">
          <p class="text-xs text-gray-500 text-center mb-3">
            Don't have an account?
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Sign up</a>
          </p>

          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p class="text-xs text-gray-500 mb-3 text-center">Or continue with demo account</p>
            <div class="flex space-x-2">
              <button
                class="flex-1 py-2 px-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Demo User
              </button>
              <button
                class="flex-1 py-2 px-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div> -->
      </div>
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
