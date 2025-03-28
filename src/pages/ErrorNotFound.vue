<template>
  <div class="fullscreen bg-gray-50 flex flex-center px-4">
    <div class="text-center max-w-lg">
      <!-- Decorative element -->
      <div class="flex justify-center mb-6">
        <div
          class="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10"></div>
          <i class="material-icons text-5xl text-blue-500/80">search_off</i>
        </div>
      </div>

      <!-- 404 number with gradient -->
      <div
        class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 font-bold"
        style="font-size: 8rem; line-height: 1"
      >
        404
      </div>

      <!-- Main heading -->
      <div class="text-2xl font-bold text-gray-800 mb-4 mt-2">Page Not Found</div>

      <!-- Subtext -->
      <div class="text-gray-600 mb-8 text-lg">
        The page you're looking for doesn't exist or has been moved.
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <q-btn
          unelevated
          color="primary"
          size="lg"
          label="Back to Dashboard"
          icon="home"
          class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md px-6 rounded-lg transition-all duration-300"
          @click="$router.push({ name: 'dashboard' })"
        />
        <q-btn
          outline
          color="blue"
          size="lg"
          label="Contact Support"
          icon="support_agent"
          class="border-blue-500 text-blue-600 hover:bg-blue-50 px-6 rounded-lg transition-all duration-300"
        />
      </div>

      <!-- Extra information -->
      <div class="mt-12 text-gray-500 text-sm border-t border-gray-200 pt-6">
        If you believe this is an error, please contact your system administrator
        <br />or try refreshing the page.
      </div>
    </div>
  </div>
</template>

<script setup>
// Nothing to set up here
</script>
