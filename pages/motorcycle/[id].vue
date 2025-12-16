<template>
  <div class="motorcycle-detail-page" :class="isDarkMode ? 'bg-eerie-black text-white' : 'bg-white text-eerie-black'">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <q-spinner size="3rem" color="finva-primary" />
      <p class="ml-4 text-lg">Cargando detalles...</p>
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      <q-icon name="error_outline" size="4rem" color="negative" />
      <h2 class="text-2xl font-bold mt-4 mb-2 text-eerie-black">Error al cargar la motocicleta</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <q-btn color="primary" label="Volver al Marketplace" @click="navigateTo('/marketplace_landing')" />
    </div>

    <div v-else-if="motorcycle" class="motorcycle-detail-content">
      <section class="hero-section">
        <div class="relative w-full h-full min-h-[45vh] md:min-h-[55vh] lg:min-h-[65vh]">
          <img
            :src="heroImage || motorcycle.image"
            :alt="motorcycle.name"
            class="w-full h-full object-cover object-center"
            loading="eager"
          />

          <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

          <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 z-10">
            <div class="max-w-7xl mx-auto">
              <p class="text-sm sm:text-lg font-medium text-finva-primary uppercase mb-2">
                {{ motorcycle.brand }} | {{ motorcycle.year }}
              </p>
              <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 font-inter leading-tight tracking-wider drop-shadow-lg">
                {{ motorcycle.name }}
              </h1>
              <q-btn
                label="Cotizar Ahora"
                rounded
                color="finva-primary"
                text-color="eerie-black"
                size="lg"
                icon="arrow_forward"
                @click="navigateToQuote"
                class="cta-hero-btn"
                style="min-height: 60px; font-size: 1.25rem;"
              />
            </div>
          </div>

          <div class="absolute top-4 left-4 z-20">
            <q-btn
              round
              color="white"
              text-color="eerie-black"
              icon="arrow_back"
              @click="navigateTo('/marketplace_landing')"
              class="back-button shadow-lg"
            />
          </div>
        </div>
      </section>

      <!-- Add this wrapper for the page content -->
      <div class="page-content-wrapper w-full overflow-hidden">
        <main class="w-full overflow-hidden">
          <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-8 sm:pt-12 pb-16 sm:pb-20 overflow-hidden box-border">
            
            <div class="relative mb-12 sm:mb-16 z-10">
          <div class="rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-finva-primary/20" :class="isDarkMode ? 'bg-eerie-black-light' : 'bg-white'">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              
              <div class="price-cta-section order-1 md:order-2">
                <h3 class="text-sm font-medium text-eerie-black/60 mb-2 font-inter uppercase tracking-wider" :class="isDarkMode ? 'text-white/60' : 'text-eerie-black/60'">
                  Precio desde
                </h3>
                <p class="text-4xl sm:text-5xl font-bold mb-6 font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">
                  {{ motorcycle.price }}
                </p>
                
                <div v-if="motorcycle.colors && motorcycle.colors.length > 0" class="mb-8">
                  <h4 class="text-xs font-medium mb-3 font-inter uppercase tracking-wider" :class="isDarkMode ? 'text-white/60' : 'text-eerie-black/60'">Colores Disponibles</h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(color, index) in motorcycle.colors"
                      :key="index"
                      class="px-3 py-1.5 text-xs bg-mindaro text-eerie-black rounded-full font-inter font-medium"
                    >
                      {{ color }}
                    </span>
                  </div>
                </div>
                <q-btn
                  rounded
                  color="finva-primary"
                  text-color="eerie-black"
                  size="lg"
                  class="full-width primary-btn"
                  @click="navigateToQuote"
                  style="min-height: 56px; font-weight: 600;"
                >
                  Cotizar
                </q-btn>
              </div>
              <div class="main-image-container overflow-hidden rounded-lg bg-gray-50 p-4 w-full order-2 md:order-1">
                <div class="relative w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center">
                  <img
                    :src="motorcycle.image"
                    :alt="`${motorcycle.name} - Principal`"
                    class="max-w-full max-h-full object-contain cursor-pointer"
                    loading="eager"
                    @click="openImageLightbox(motorcycle.image)"
                  />
                  <q-icon 
                    name="zoom_in_map" 
                    class="absolute top-4 right-4 text-finva-primary text-h5 cursor-pointer z-10 bg-white rounded-full p-2 hover:bg-finva-primary hover:text-white transition-colors shadow-md" 
                    @click="openImageLightbox(motorcycle.image)"
                  />
                </div>
              </div>
              
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          <div class="w-full lg:col-span-2 space-y-6 sm:space-y-8 order-1 lg:order-1">
            
            <div class="p-6 sm:p-8 rounded-xl" :class="isDarkMode ? 'bg-eerie-black-light border border-finva-primary/20' : 'bg-mindaro border border-finva-primary/10'">
              <h2 class="text-2xl sm:text-3xl font-bold mb-4 font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">
                Descripción
              </h2>
              <div class="prose max-w-none">
                <p v-if="motorcycle.description" class="leading-relaxed font-inter" :class="isDarkMode ? 'text-white/90' : 'text-eerie-black'">
                  {{ motorcycle.description }}
                </p>
                <p v-else class="leading-relaxed font-inter italic" :class="isDarkMode ? 'text-white/90' : 'text-eerie-black'">
                  Descubre la {{ motorcycle.name }}, una máquina de precisión diseñada para la adrenalina. Su motor de alto rendimiento y chasis ligero ofrecen una experiencia de conducción sin igual.
                </p>
              </div>
            </div>
            
            <div class="p-6 sm:p-8 rounded-xl" :class="isDarkMode ? 'bg-eerie-black-light border border-finva-primary/20' : 'bg-uranian-blue border border-finva-primary/10'">
              <h2 class="text-2xl sm:text-3xl font-bold mb-6 font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">
                Especificaciones Técnicas
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div v-if="motorcycle.technical?.engine" class="spec-item rounded-lg p-4" :class="isDarkMode ? 'bg-eerie-black border border-finva-primary/20' : 'bg-white/80'">
                  <span class="text-xs font-medium uppercase mb-1 block" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Motor</span>
                  <span class="text-sm font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.technical.engine }}</span>
                </div>
                <div v-if="motorcycle.technical?.power" class="spec-item rounded-lg p-4" :class="isDarkMode ? 'bg-eerie-black border border-finva-primary/20' : 'bg-white/80'">
                  <span class="text-xs font-medium uppercase mb-1 block" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Potencia</span>
                  <span class="text-sm font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.technical.power }}</span>
                </div>
                <div v-if="motorcycle.technical?.torque" class="spec-item rounded-lg p-4" :class="isDarkMode ? 'bg-eerie-black border border-finva-primary/20' : 'bg-white/80'">
                  <span class="text-xs font-medium uppercase mb-1 block" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Torque</span>
                  <span class="text-sm font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.technical.torque }}</span>
                </div>
                <div v-if="motorcycle.technical?.weight" class="spec-item rounded-lg p-4" :class="isDarkMode ? 'bg-eerie-black border border-finva-primary/20' : 'bg-white/80'">
                  <span class="text-xs font-medium uppercase mb-1 block" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Peso</span>
                  <span class="text-sm font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.technical.weight }}</span>
                </div>
                <div v-if="motorcycle.technical?.fuelCapacity" class="spec-item rounded-lg p-4" :class="isDarkMode ? 'bg-eerie-black border border-finva-primary/20' : 'bg-white/80'">
                  <span class="text-xs font-medium uppercase mb-1 block" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Combustible</span>
                  <span class="text-sm font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.technical.fuelCapacity }}</span>
                </div>
              </div>
            </div>

            <div v-if="imageGallery.length > 0" class="p-6 sm:p-8 rounded-xl" :class="isDarkMode ? 'bg-eerie-black-light border border-finva-primary/20' : 'bg-white border border-finva-primary/10'">
              <h2 class="text-2xl sm:text-3xl font-bold mb-6 font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">
                Galería
              </h2>
              <ClientOnly>
                <q-carousel
                  v-model="slide"
                  animated
                  infinite
                  swipeable
                  control-color="finva-primary"
                  navigation
                  padding
                  arrows
                  transition-prev="slide-right"
                  transition-next="slide-left"
                  class="rounded-lg motorcycle-carousel"
                  :class="[{ 'mobile-height-adjust': isMobile }, isDarkMode ? 'bg-black/30' : 'bg-gray-100']"
                  :style="{ height: carouselHeight }"
                >
                  <q-carousel-slide
                    v-for="(img, index) in imageGallery"
                    :key="index"
                    :name="index"
                    class="flex flex-center p-0"
                  >
                    <div class="image-container-horizontal">
                      <img
                        :src="img"
                        :alt="`${motorcycle.name} - Imagen ${index + 1}`"
                        class="horizontal-image"
                        loading="lazy"
                        @click="openImageLightbox(img)"
                        @load="(e) => handleImageLoad(e, `gallery-${index}`)"
                      />
                      <q-icon name="zoom_in_map" class="absolute-top-right q-ma-md text-h5 cursor-pointer z-10 p-2 rounded-full transition-colors shadow-md" :class="isDarkMode ? 'text-white hover:text-finva-primary' : 'text-eerie-black hover:text-finva-primary bg-white/90'" />
                    </div>
                  </q-carousel-slide>

                  <template v-slot:navigation-icon="{ active, name }">
                    <div
                      class="cursor-pointer thumbnail-nav-wrapper"
                      :class="{ 'active-thumbnail': active }"
                      @click="slide = name"
                    >
                      <img
                        :src="imageGallery[name]"
                        :alt="`Thumbnail ${name + 1}`"
                        class="thumbnail-nav-img"
                        loading="lazy"
                      />
                    </div>
                  </template>
                </q-carousel>
              </ClientOnly>
            </div>
            
          </div>

          <div class="w-full lg:col-span-1 order-2 lg:order-2">
            <div class="lg:sticky lg:top-8 space-y-6 w-full">
              <div class="rounded-xl p-6" :class="isDarkMode ? 'bg-eerie-black-light border border-finva-primary/20' : 'bg-uranian-blue border border-finva-primary/10'">
                <h4 class="text-lg font-bold mb-4 font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">Información</h4>
                <div class="space-y-3">
                  <div v-if="motorcycle.brand" class="flex justify-between items-center pb-2 border-b" :class="isDarkMode ? 'border-white/10' : 'border-eerie-black/10'">
                    <span class="font-medium text-sm" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Marca:</span>
                    <span class="font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.brand }}</span>
                  </div>
                  <div v-if="motorcycle.model" class="flex justify-between items-center pb-2 border-b" :class="isDarkMode ? 'border-white/10' : 'border-eerie-black/10'">
                    <span class="font-medium text-sm" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Modelo:</span>
                    <span class="font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.model }}</span>
                  </div>
                  <div v-if="motorcycle.year" class="flex justify-between items-center">
                    <span class="font-medium text-sm" :class="isDarkMode ? 'text-white/70' : 'text-eerie-black/70'">Año:</span>
                    <span class="font-bold font-inter" :class="isDarkMode ? 'text-white' : 'text-eerie-black'">{{ motorcycle.year }}</span>
                  </div>
                </div>
              </div>

              <div class="rounded-xl p-6 border" :class="isDarkMode ? 'bg-eerie-black-light border-finva-primary/20' : 'bg-white border-finva-primary/10'">
                <p class="text-sm font-medium mb-4 font-inter" :class="isDarkMode ? 'text-white/80' : 'text-eerie-black/80'">¿Necesitas asistencia?</p>
                <q-btn
                  rounded
                  outline
                  color="finva-primary"
                  text-color="finva-primary"
                  size="md"
                  icon="support_agent"
                  class="full-width secondary-btn"
                  @click="contactDealer"
                  style="min-height: 48px; font-weight: 600;"
                >
                  Contactar
                </q-btn>
              </div>

              <!-- Theme Toggle -->
              <div class="rounded-xl p-4 border flex items-center justify-between" :class="isDarkMode ? 'bg-eerie-black-light border-finva-primary/20' : 'bg-white border-finva-primary/10'">
                <span class="text-sm font-medium" :class="isDarkMode ? 'text-white/80' : 'text-eerie-black/80'">Modo oscuro</span>
                <q-toggle
                  v-model="isDarkMode"
                  color="finva-primary"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>

    <q-dialog v-model="lightbox" maximized>
      <q-card class="bg-eerie-black text-white flex flex-center">
        <q-btn 
          icon="close" 
          flat 
          round 
          dense 
          @click="lightbox = false" 
          class="absolute-top-right z-max q-ma-md" 
          color="white" 
          size="lg"
        />
        <img 
          :src="lightboxImage" 
          :alt="`Zoom de ${motorcycle?.name}`"
          class="full-width full-height object-contain p-4" 
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const route = useRoute()
const $q = useQuasar()

const motorcycle = ref(null)
const loading = ref(true)
const error = ref(null)
const heroImage = ref(null)
const isDarkMode = ref(true) // Default to dark mode

// Carousel and Lightbox properties
const slide = ref(0)
const lightbox = ref(false)
const lightboxImage = ref('')
const imageAspectRatios = ref({}) 

// Computed property for mobile detection
const isMobile = computed(() => $q.screen.lt.lg)

// Function to calculate and store image aspect ratio
const handleImageLoad = (event, imageKey) => {
  const img = event.target
  if (img.naturalWidth && img.naturalHeight) {
    const aspectRatio = img.naturalWidth / img.naturalHeight
    imageAspectRatios.value[imageKey] = aspectRatio
  }
}

// Get aspect ratio for current slide
const currentAspectRatio = computed(() => {
  return imageAspectRatios.value[`gallery-${slide.value}`] || 16/9
})

// Dynamic carousel height based on aspect ratio - larger for gallery
const carouselHeight = computed(() => {
  const baseWidth = $q.screen.width * (isMobile.value ? 0.9 : 0.6) // Adjust base width dynamically
  const aspectRatio = currentAspectRatio.value
  const calculatedHeight = baseWidth / aspectRatio
  // Clamp between min and max heights - increased for larger gallery
  const minHeight = isMobile.value ? 300 : 450
  const maxHeight = isMobile.value ? 450 : 650
  return `${Math.max(minHeight, Math.min(maxHeight, calculatedHeight))}px`
})

// Get runtime config for API base URL
const config = useRuntimeConfig()
const apiBase = config.public.FLASK_BACKEND_URL

// Computed property for image gallery
const imageGallery = computed(() => {
  if (!motorcycle.value) return []
  
  const images = motorcycle.value.images && Array.isArray(motorcycle.value.images) 
    ? motorcycle.value.images 
    : []

  // Filter out the main image and hero image if they're listed in the array, and ensure uniqueness
  const filteredImages = images.filter(image => 
    image !== motorcycle.value.image && 
    image !== motorcycle.value.hero_image
  )
  return [...new Set(filteredImages)]
})

// Function to open lightbox
const openImageLightbox = (imageURL) => {
  lightboxImage.value = imageURL
  lightbox.value = true
}

// Fetch motorcycle details
const fetchMotorcycleDetails = async () => {
  try {
    loading.value = true
    error.value = null
    
    const motorcycleId = route.params.id
    
    // Fetch single motorcycle by ID from the new endpoint
    const data = await $fetch(`${apiBase}/cms/marketplace/motorcycle/${motorcycleId}`)
    
    if (data) {
      motorcycle.value = data
      heroImage.value = motorcycle.value.hero_image || motorcycle.value.image
      slide.value = 0 // Initialize to the first gallery slide
      
      // Extract brand and model from name for compatibility
      if (motorcycle.value.name) {
        const nameParts = motorcycle.value.name.split(' ')
        if (nameParts.length > 1) {
          motorcycle.value.brand = motorcycle.value.brand || nameParts[0]
          motorcycle.value.model = motorcycle.value.model || nameParts.slice(1).join(' ')
        } else {
          motorcycle.value.brand = motorcycle.value.brand || nameParts[0] || 'Unknown'
          motorcycle.value.model = motorcycle.value.model || ''
        }
      }
      
      // Ensure year is set (default to current year if not available)
      if (!motorcycle.value.year) {
        motorcycle.value.year = new Date().getFullYear()
      }
    } else {
      throw new Error('Motorcycle not found')
    }
  } catch (err) {
    console.error('Error fetching motorcycle details:', err)
    error.value = err.message || 'Error al cargar los detalles de la motocicleta'
  } finally {
    loading.value = false
  }
}

// Navigation functions
const navigateToQuote = () => {
  // Navigate to quote generator with motorcycle pre-selected
  if (motorcycle.value) {
    navigateTo({
      path: '/quote-generator',
      query: {
        motorcycle_id: motorcycle.value.id,
        brand: motorcycle.value.brand,
        model: motorcycle.value.model,
        year: motorcycle.value.year
      }
    })
  } else {
    navigateTo('/quote-generator')
  }
}

const contactDealer = () => {
  // You can implement contact dealer functionality here
  // For now, just show a message or navigate to contact form
  navigateTo('/contact-form')
}

// Set page meta
useHead({
  title: computed(() => motorcycle.value ? `${motorcycle.value.name} - Detalles` : 'Detalles de Motocicleta'),
  meta: [
    {
      name: 'description',
      content: computed(() => motorcycle.value 
        ? `Detalles completos de ${motorcycle.value.name}. ${motorcycle.value.price}. Especificaciones técnicas y más.`
        : 'Detalles de motocicleta'
      )
    }
  ]
})

// Fetch data on mount
onMounted(() => {
  fetchMotorcycleDetails()
})
</script>

<style>
/* Global styles for overflow prevention */
:root, html, body {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  position: relative !important;
}

/* Prevent any container from exceeding viewport */
.container, .max-w-7xl, .mx-auto {
  max-width: 100vw !important;
  overflow-x: hidden !important;
}

/* Fix for the main content when navbar is fixed */
.min-h-screen {
  padding-top: 0 !important;
}

/* Ensure navbar spacer doesn't cause overflow */
.navbar-spacer {
  width: 100vw !important;
  max-width: 100% !important;
  overflow: hidden !important;
}
</style>

<style scoped>
  /* Define Finva Colors */
  .bg-finva-primary { background-color: #2FFF96; }
  .text-finva-primary { color: #2FFF96; }
  .border-finva-primary { border-color: #2FFF96; }
  .bg-eerie-black { background-color: #242424; }
  .text-eerie-black { color: #242424; }
  .bg-mindaro { background-color: #E8FA6C; }
  .bg-uranian-blue { background-color: #A5DEFD; }
  .bg-eerie-black-light { background-color: #333333; }
  
  /* Base styles */
  .motorcycle-detail-page {
    width: 100%;
    min-height: 100vh;
    position: relative;
  }
  
  /* Page wrapper */
  .page-content-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  /* Hero Section - SIMPLIFIED */
  .hero-section {
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .hero-section > .relative {
    width: 100%;
    position: relative;
  }
  
  .hero-section img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  
  /* Main content container */
  .w-full.max-w-7xl.mx-auto {
    width: 100%;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    box-sizing: border-box;
  }
  
  /* Grid fixes */
  .grid {
    width: 100%;
    max-width: 100%;
  }
  
  /* Image container */
  .main-image-container {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  
  .main-image-container > div {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 250px;
  }
  
  /* Carousel */
  .motorcycle-carousel {
    width: 100%;
    max-width: 100%;
  }
  
  /* Text overflow */
  h1, h2, h3, h4, p, span {
    max-width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  
  /* ========== RESPONSIVE BREAKPOINTS ========== */
  
  /* Small mobile (up to 375px) */
  @media (max-width: 375px) {
    .hero-section .relative {
      min-height: 40vh;
    }
    
    .hero-section h1 {
      font-size: 1.5rem !important;
    }
    
    .w-full.max-w-7xl.mx-auto {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    
    .main-image-container > div {
      min-height: 200px;
    }
  }
  
  /* Mobile (376px - 640px) */
  @media (min-width: 376px) and (max-width: 640px) {
    .hero-section .relative {
      min-height: 45vh;
    }
    
    .hero-section h1 {
      font-size: 1.75rem !important;
    }
    
    .main-image-container > div {
      min-height: 220px;
    }
  }
  
  /* Tablet (641px - 768px) */
  @media (min-width: 641px) and (max-width: 768px) {
    .hero-section .relative {
      min-height: 50vh;
    }
    
    .hero-section h1 {
      font-size: 2.25rem !important;
    }
    
    .w-full.max-w-7xl.mx-auto {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    
    .main-image-container > div {
      min-height: 280px;
    }
  }
  
  /* Tablet (769px - 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    .hero-section .relative {
      min-height: 55vh;
    }
    
    .hero-section h1 {
      font-size: 3rem !important;
    }
    
    .w-full.max-w-7xl.mx-auto {
      padding-left: 2rem;
      padding-right: 2rem;
    }
    
    .main-image-container > div {
      min-height: 350px;
    }
  }
  
  /* Desktop (1025px and up) */
  @media (min-width: 1025px) {
    .hero-section .relative {
      min-height: 65vh;
    }
    
    .hero-section h1 {
      font-size: 3.5rem !important;
    }
    
    .w-full.max-w-7xl.mx-auto {
      max-width: 1280px;
      padding-left: 2.5rem;
      padding-right: 2.5rem;
    }
    
    .main-image-container > div {
      min-height: 400px;
    }
  }
  
  /* Landscape mode */
  @media (orientation: landscape) and (max-height: 500px) {
    .hero-section .relative {
      min-height: 70vh !important;
    }
    
    .main-image-container > div {
      min-height: 180px !important;
    }
  }
  
  /* Ensure all images are responsive */
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* Fix for iOS Safari */
  @supports (-webkit-touch-callout: none) {
    .hero-section .relative {
      min-height: -webkit-fill-available;
    }
  }
  </style>