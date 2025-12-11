<template>
  <div class="min-h-screen flex flex-col">
    <!-- Spacer to maintain navbar height when fixed -->
    <div 
      v-if="isScrolled" 
      class="navbar-spacer"
      :style="{ height: navbarHeight + 'px' }"
    ></div>

    <!-- FINVA NAVBAR -->
    <header 
      ref="navbarRef"
      :class="['navbar-finva flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 md:py-4 gap-3 md:gap-0', { 'navbar-floating': isScrolled }]"
    >
      <!-- Top Row: Logo + Mobile Menu Toggle + Icons -->
      <div class="flex items-center justify-between w-full md:w-auto">
        <!-- Logo -->
        <NuxtLink to="/marketplace_landing" class="logo-link" @click="mobileMenuOpen = false">
          <img src="/assets/fnv_logo_word.png" class="h-8 md:h-12" alt="Finva Logo" />
        </NuxtLink>

        <!-- Mobile Menu Toggle -->
        <q-btn
          flat
          dense
          round
          :icon="mobileMenuOpen ? 'close' : 'menu'"
          class="md:hidden text-white menu-toggle-button"
          aria-label="Toggle menu"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        />
      </div>

      <!-- Center Menu (Desktop) / Mobile Menu -->
      <nav 
        :class="[
          'gap-4 md:gap-8 font-medium text-white w-full md:w-auto',
          mobileMenuOpen ? 'flex flex-col' : 'hidden md:flex md:flex-row'
        ]"
      >
        <!-- Login Link (when not logged in) - SSR safe -->
        <NuxtLink 
          v-if="!isLoggedIn" 
          class="nav-link flex items-center gap-1" 
          to="/login" 
          @click="mobileMenuOpen = false"
        >
          <q-icon name="login" size="16px" />
          Iniciar Sesión
        </NuxtLink>
        
        <!-- User Menu (when logged in) - SSR safe -->
        <div v-if="isLoggedIn" class="flex items-center gap-2">
          <!-- Client Name -->
          <span class="nav-link text-sm">
            {{ clientName }}
          </span>
          
          <!-- Documents Link -->
          <NuxtLink 
            class="nav-link flex items-center gap-1" 
            to="/my-documents" 
            @click="mobileMenuOpen = false"
          >
            <q-icon name="description" size="16px" />
            Mis Documentos
          </NuxtLink>
          
          <!-- Logout Button -->
          <q-btn
            flat
            dense
            class="nav-link flex items-center gap-1"
            @click="handleLogout"
            title="Cerrar Sesión"
          >
            <q-icon name="logout" size="16px" />
            Salir
          </q-btn>
        </div>
        <NuxtLink class="nav-link" to="#" @click="mobileMenuOpen = false">Motos</NuxtLink>
        <NuxtLink class="nav-link" to="/marketplace_landing" @click="mobileMenuOpen = false">Marketplace</NuxtLink>
        <NuxtLink class="nav-link" to="/quote-generator" @click="mobileMenuOpen = false">Cotizaciones</NuxtLink>
        <NuxtLink class="nav-link text-finva-secondary" to="#" @click="mobileMenuOpen = false">Créditos</NuxtLink>
        <NuxtLink class="nav-link font-semibold nav-link-ofertas" to="#" @click="mobileMenuOpen = false">
          Ofertas
        </NuxtLink>
        <!-- Marcas Dropdown -->
        <div 
          class="relative nav-link-marcas" 
          @mouseenter="showMarcasDropdown = true" 
          @mouseleave="showMarcasDropdown = false"
          @click.stop
        >
          <q-btn
            flat
            dense
            class="nav-link font-medium cursor-pointer flex items-center"
            @click="showMarcasDropdown = !showMarcasDropdown"
          >
            Marcas
            <q-icon 
              name="keyboard_arrow_down" 
              size="16px"
              :class="{ 'rotate-180': showMarcasDropdown }"
              class="transition-transform"
            />
          </q-btn>
          <ClientOnly>
            <BrandsModelsDropdown 
              v-if="showMarcasDropdown"
              @close="showMarcasDropdown = false"
            />
            <template #fallback>
              <div></div>
            </template>
          </ClientOnly>
        </div>
      </nav>

      <!-- Search -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-6 text-white w-full md:w-auto">
        <!-- Finva Search -->
        <div class="flex-1 md:flex-initial md:w-64 min-w-0 search-container">
          <ClientOnly>
            <q-input
              v-model="searchQuery"
              rounded
              outlined
              dark
              placeholder="Buscar motocicletas"
              class="finva-search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <template #fallback>
              <div class="w-full max-w-full h-10 bg-white/10 rounded-full flex items-center px-4">
                <q-icon name="search" class="text-white/70" size="20px" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </header>

    <!-- PAGE CONTENT -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useClientStore } from '@/stores/clientStore'

// SSR-safe: Always initialize clientStore, but handle errors gracefully
let clientStore = null
try {
  clientStore = useClientStore()
  if (clientStore && !clientStore.client) {
    clientStore.client = {}
  }
} catch (error) {
  console.error('[SSR Debug] Error initializing ClientStore:', error)
  clientStore = {
    client: {}
  }
}

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const navbarRef = ref(null)
const navbarHeight = ref(80)
const showMarcasDropdown = ref(false)
const searchQuery = ref('')

// Check if user is logged in
const isLoggedIn = computed(() => {
  try {
    if (!clientStore) {
      return false
    }
    if (!clientStore.client) {
      return false
    }
    return !!(clientStore.client.id)
  } catch (error) {
    console.error('[SSR Debug] Error in isLoggedIn computed:', error)
    return false
  }
})

// Get client name for display
const clientName = computed(() => {
  try {
    if (!clientStore || !clientStore.client) {
      return 'Usuario'
    }
    const name = clientStore.client.name || ''
    const lastName = clientStore.client.first_last_name || ''
    if (name && lastName) {
      return `${name} ${lastName}`.trim()
    }
    return name || lastName || 'Usuario'
  } catch (error) {
    console.error('[SSR Debug] Error in clientName computed:', error)
    return 'Usuario'
  }
})

// Handle logout
const handleLogout = () => {
  if (import.meta.server) return
  
  if (clientStore && clientStore.resetStore) {
    clientStore.resetStore()
  } else if (clientStore && clientStore.client) {
    clientStore.client.id = null
    clientStore.client.name = ''
    clientStore.client.first_last_name = ''
  }
  
  mobileMenuOpen.value = false
  navigateTo('/login')
}

// Throttle function for performance
const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const handleScroll = () => {
  if (import.meta.client && window) {
    isScrolled.value = window.scrollY > 50
  }
}

const measureNavbarHeight = () => {
  if (import.meta.client && navbarRef.value) {
    navbarHeight.value = navbarRef.value.offsetHeight
  }
}

const throttledScroll = ref(null)
const throttledResize = ref(null)

onMounted(() => {
  if (import.meta.client && window) {
    throttledScroll.value = throttle(handleScroll, 16)
    throttledResize.value = throttle(measureNavbarHeight, 100)
    
    window.addEventListener('scroll', throttledScroll.value, { passive: true })
    handleScroll()
    
    nextTick(() => {
      measureNavbarHeight()
      window.addEventListener('resize', throttledResize.value, { passive: true })
    })
  }
})

onUnmounted(() => {
  if (import.meta.client && window && throttledScroll.value && throttledResize.value) {
    window.removeEventListener('scroll', throttledScroll.value)
    window.removeEventListener('resize', throttledResize.value)
  }
})
</script>

<style>
:root {
--brand-green-light: #2FFF96;
--brand-green-dark: #26e085;
--text-dark: #1d4e39;
--eerie-black: #242424;
--background-light: #f7fcf9;
--border-light: #e5e7eb;
--finva-primary: var(--brand-green-dark);
--finva-primary-light: var(--brand-green-light);
--finva-info: #38bdf8;
--finva-success: #10b981;
--finva-warning: #fbbf24;
--finva-danger: #ef4444;
--finva-secondary: #9ca3af;
--finva-text-muted: #6b7280;
}

html, body {
background-color: var(--background-light);
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
overflow-x: hidden;
max-width: 100vw;
}

body {
position: relative;
}

.navbar-finva {
background-color: var(--eerie-black) !important;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
            width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1);
will-change: transform;
contain: layout style paint;
}

.navbar-spacer {
width: 100%;
flex-shrink: 0;
}

.navbar-finva.navbar-floating {
position: fixed;
top: 8px;
left: 50%;
transform: translateX(-50%);
width: calc(100% - 16px);
max-width: 1400px;
border-radius: 12px;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
z-index: 1000;
backdrop-filter: blur(5px);
-webkit-backdrop-filter: blur(5px);
background-color: rgba(36, 36, 36, 0.98) !important;
will-change: transform;
}

@media (max-width: 640px) {
.navbar-finva.navbar-floating {
width: calc(100% - 8px);
top: 4px;
}
}

@media (min-width: 768px) {
.navbar-finva.navbar-floating {
top: 16px;
width: calc(100% - 32px);
}
}

.navbar-finva .navbar-brand,
.navbar-finva .nav-link {
font-weight: 500;
color: #ffffff !important;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
position: relative;
padding: 0.5rem 0.75rem;
border-radius: 0.5rem;
display: inline-block;
text-decoration: none;
}

.navbar-finva .nav-link::after {
content: '';
position: absolute;
bottom: 0.25rem;
left: 50%;
transform: translateX(-50%) scaleX(0);
width: 0;
height: 2px;
background: linear-gradient(90deg, var(--brand-green-light), var(--brand-green-dark));
border-radius: 2px;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (hover: hover) and (pointer: fine) {
.navbar-finva .nav-link:hover {
color: var(--brand-green-light) !important;
background-color: rgba(47, 255, 150, 0.1);
transform: translateY(-1px);
}

.navbar-finva .nav-link:hover::after {
width: 80%;
transform: translateX(-50%) scaleX(1);
}

.navbar-finva .nav-link-ofertas:hover {
color: var(--brand-green-light) !important;
background-color: rgba(47, 255, 150, 0.2) !important;
transform: translateY(-1px) !important;
box-shadow: 0 2px 8px rgba(47, 255, 150, 0.2) !important;
}

.navbar-finva .nav-link-ofertas:hover::after {
display: block !important;
width: 80% !important;
opacity: 1 !important;
transform: translateX(-50%) scaleX(1) !important;
}

.navbar-finva .nav-link.text-finva-secondary:hover {
color: var(--brand-green-light) !important;
}
}

.navbar-finva .nav-link.active {
color: var(--brand-green-light) !important;
font-weight: 600;
background-color: rgba(47, 255, 150, 0.15);
}

.navbar-finva .nav-link.active::after {
width: 80%;
transform: translateX(-50%) scaleX(1);
}

.navbar-finva .nav-link-ofertas:not(.active) {
background-color: transparent !important;
}

.navbar-finva .nav-link-ofertas {
color: var(--brand-green-light) !important;
background-color: transparent !important;
transform: none !important;
box-shadow: none !important;
}

.navbar-finva .nav-link-ofertas::after {
display: none !important;
width: 0 !important;
opacity: 0 !important;
}

.text-finva-secondary {
color: var(--finva-secondary);
}

@media (max-width: 767px) {
.navbar-finva nav.hidden {
display: none !important;
}

.navbar-finva nav:not(.hidden) {
display: flex !important;
}

.navbar-finva {
padding-left: 0.75rem;
padding-right: 0.75rem;
}

.navbar-finva .nav-link {
font-size: 0.875rem;
padding: 0.5rem 0.75rem;
-webkit-tap-highlight-color: transparent;
}

.navbar-finva .nav-link::after {
bottom: 0.125rem;
}

.navbar-finva .nav-link {
width: 100%;
text-align: left;
padding: 0.75rem 1rem;
border-radius: 0.5rem;
}

.navbar-finva .nav-link::after {
display: none;
}

.navbar-finva .nav-link.active::after {
display: block;
}
}

@media (min-width: 768px) {
  .navbar-finva nav {
    display: flex !important;
  }
}

.logo-link {
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-radius: 0.5rem;
  padding: 0.25rem;
  -webkit-tap-highlight-color: transparent;
}

.logo-link:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.logo-link:active {
  transform: scale(0.98);
}

.logo-link img {
  transition: filter 0.3s ease;
}

.logo-link:hover img {
  filter: brightness(1.1);
}

main {
max-width: 100%;
overflow-x: hidden;
}

.search-container {
position: relative;
}

.finva-search-input {
width: 100%;
}

.finva-search-input :deep(.q-field__control) {
background-color: rgba(255, 255, 255, 0.1) !important;
border: 1px solid rgba(255, 255, 255, 0.2) !important;
color: white !important;
}

.finva-search-input :deep(.q-field__native) {
color: white !important;
}

.finva-search-input :deep(.q-field__native::placeholder) {
color: rgba(255, 255, 255, 0.6) !important;
}

.finva-search-input :deep(.q-field__control):focus-within {
background-color: rgba(255, 255, 255, 0.15) !important;
border-color: var(--brand-green-light) !important;
box-shadow: 0 0 0 2px rgba(47, 255, 150, 0.2) !important;
}

.menu-toggle-button {
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
border-radius: 0.5rem;
-webkit-tap-highlight-color: transparent;
}

.menu-toggle-button:hover {
background-color: rgba(255, 255, 255, 0.1);
color: var(--brand-green-light);
}

.menu-toggle-button:active {
transform: scale(0.95);
}

.nav-link-marcas {
  position: relative;
}

.nav-link-marcas .nav-link {
  display: flex;
  align-items: center;
}

@media (max-width: 767px) {
  .nav-link-marcas {
    width: 100%;
  }
  
  .nav-link-marcas .nav-link {
    width: 100%;
    text-align: left;
  }
}
</style>

