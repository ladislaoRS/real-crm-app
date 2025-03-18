<template>
  <div class="fullscreen bg-blue-1 text-blue-10 flex flex-center">
    <div class="text-center">
      <div style="font-size: 8rem">404</div>
      <div class="text-h2 mb-4">Oops! Nothing here...</div>
      <div class="text-h5 text-grey-8 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </div>
      <q-btn
        color="primary"
        size="lg"
        label="Go Back"
        @click="$router.push({ name: 'dashboard' })"
      />
    </div>
  </div>
</template>

<script setup>
// Nothing to set up here
</script>
