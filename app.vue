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

