<template>
  <ClientOnly>
    <template #default>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
    <template #fallback>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
  </ClientOnly>
</template>

<style>
/* Enhanced Loading Styles */
:deep(.enhanced-loading) {
  border-radius: 1.5rem !important;
  padding: 2rem !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.enhanced-loading .q-spinner) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.enhanced-loading .q-loading__message) {
  margin-top: 1.5rem !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

:deep(.enhanced-loading .loading-message) {
  font-size: 1.125rem !important;
  font-weight: 700 !important;
  color: white !important;
  margin-bottom: 0.5rem !important;
  text-align: center !important;
}

:deep(.enhanced-loading .loading-hint) {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 0.9) !important;
  text-align: center !important;
  line-height: 1.5 !important;
}
</style>

