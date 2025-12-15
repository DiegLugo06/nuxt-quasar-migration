<template>
  <div class="motorcycle-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <q-spinner size="3rem" color="primary" />
      <p class="ml-4 text-lg">Cargando detalles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen p-6">
      <q-icon name="error_outline" size="4rem" color="negative" />
      <h2 class="text-2xl font-bold mt-4 mb-2">Error al cargar la motocicleta</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <q-btn color="primary" label="Volver al Marketplace" @click="navigateTo('/marketplace_landing')" />
    </div>

    <!-- Motorcycle Detail Content -->
    <div v-else-if="motorcycle" class="motorcycle-detail-content">
      <!-- Hero Section -->
      <section class="hero-section relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">
        <div class="relative w-full h-full">
          <img
            :src="heroImage || motorcycle.image"
            :alt="motorcycle.name"
            class="w-full h-full object-cover"
            loading="eager"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <!-- Hero Content -->
          <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 z-10">
            <div class="max-w-7xl mx-auto">
              <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 font-inter">
                {{ motorcycle.name }}
              </h1>
              <p class="text-xl sm:text-2xl md:text-3xl font-bold text-white font-inter">
                {{ motorcycle.price }}
              </p>
            </div>
          </div>

          <!-- Back Button -->
          <div class="absolute top-4 left-4 z-10">
            <q-btn
              round
              color="white"
              text-color="gray-900"
              icon="arrow_back"
              @click="navigateTo('/marketplace_landing')"
              class="back-button"
            />
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <!-- Left Column: Image Gallery -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Image Carousel -->
            <div class="p-6 sm:p-8 rounded-xl shadow-lg bg-white transition-colors duration-500">
              <h2 class="text-2xl sm:text-3xl font-bold mb-4 font-inter">Galería de Imágenes</h2>
              <ClientOnly>
                <q-carousel
                  v-model="slide"
                  animated
                  infinite
                  swipeable
                  control-color="white"
                  navigation
                  padding
                  arrows
                  transition-prev="slide-right"
                  transition-next="slide-left"
                  class="rounded-xl shadow-md motorcycle-carousel"
                  :style="{ height: carouselHeight }"
                >
                  <!-- Main Image Slide -->
                  <q-carousel-slide :name="0" class="flex flex-center p-0">
                    <div class="image-container-horizontal">
                      <img
                        :src="motorcycle.image"
                        :alt="`${motorcycle.name} - Principal`"
                        class="horizontal-image"
                        loading="eager"
                        @click="openImageLightbox(motorcycle.image)"
                        @load="(e) => handleImageLoad(e, 'main')"
                      />
                      <q-icon name="zoom_in_map" class="absolute-top-right q-ma-md text-eerie-black text-h5 cursor-pointer z-10" />
                    </div>
                  </q-carousel-slide>

                  <!-- Gallery Image Slides -->
                  <q-carousel-slide
                    v-for="(img, index) in imageGallery"
                    :key="index + 1"
                    :name="index + 1"
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
                      <q-icon name="zoom_in_map" class="absolute-top-right q-ma-md text-eerie-black text-h5 cursor-pointer z-10" />
                    </div>
                  </q-carousel-slide>

                  <!-- Custom Navigation Thumbnails -->
                  <template v-slot:navigation-icon="{ active, name }">
                    <div
                      class="cursor-pointer thumbnail-nav-wrapper"
                      :class="{ 'active-thumbnail': active }"
                      @click="slide = name"
                    >
                      <img
                        :src="name === 0 ? motorcycle.image : imageGallery[name - 1]"
                        :alt="`Thumbnail ${name}`"
                        class="thumbnail-nav-img"
                        loading="lazy"
                      />
                    </div>
                  </template>
                </q-carousel>
                <template #fallback>
                  <div class="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-xl overflow-hidden bg-gray-100">
                    <img
                      :src="motorcycle.image"
                      :alt="motorcycle.name"
                      class="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </template>
              </ClientOnly>
            </div>

            <!-- Detailed Description Section -->
            <div class="p-6 sm:p-8 rounded-xl shadow-lg bg-mindaro transition-colors duration-500">
              <h2 class="text-2xl sm:text-3xl font-bold mb-4 font-inter">Descripción</h2>
              <div class="prose max-w-none">
                <p v-if="motorcycle.description" class="text-eerie-black leading-relaxed font-inter">
                  {{ motorcycle.description }}
                </p>
                <p v-else class="text-eerie-black leading-relaxed font-inter">
                  Descubre la {{ motorcycle.name }}, una motocicleta diseñada para ofrecerte la mejor experiencia de conducción. 
                  Con tecnología de vanguardia y un diseño innovador, esta motocicleta combina rendimiento, estilo y confiabilidad.
                </p>
              </div>
            </div>

            <!-- Technical Specifications -->
            <div class="p-6 sm:p-8 rounded-xl shadow-lg bg-uranian-blue transition-colors duration-500">
              <h2 class="text-2xl sm:text-3xl font-bold mb-4 font-inter">Especificaciones Técnicas</h2>
              <div class="bg-uranian-blue-light rounded-xl p-4 sm:p-6 shadow-inner-custom">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div v-if="motorcycle.technical?.engine" class="spec-item">
                    <span class="text-sm text-eerie-black/70 font-inter font-medium">Motor</span>
                    <span class="text-base sm:text-lg font-semibold text-eerie-black font-inter">{{ motorcycle.technical.engine }}</span>
                  </div>
                  <div v-if="motorcycle.technical?.power" class="spec-item">
                    <span class="text-sm text-eerie-black/70 font-inter font-medium">Potencia</span>
                    <span class="text-base sm:text-lg font-semibold text-eerie-black font-inter">{{ motorcycle.technical.power }}</span>
                  </div>
                  <div v-if="motorcycle.technical?.torque" class="spec-item">
                    <span class="text-sm text-eerie-black/70 font-inter font-medium">Torque</span>
                    <span class="text-base sm:text-lg font-semibold text-eerie-black font-inter">{{ motorcycle.technical.torque }}</span>
                  </div>
                  <div v-if="motorcycle.technical?.weight" class="spec-item">
                    <span class="text-sm text-eerie-black/70 font-inter font-medium">Peso</span>
                    <span class="text-base sm:text-lg font-semibold text-eerie-black font-inter">{{ motorcycle.technical.weight }}</span>
                  </div>
                  <div v-if="motorcycle.technical?.fuelCapacity" class="spec-item col-span-1 sm:col-span-2">
                    <span class="text-sm text-eerie-black/70 font-inter font-medium">Capacidad de Combustible</span>
                    <span class="text-base sm:text-lg font-semibold text-eerie-black font-inter">{{ motorcycle.technical.fuelCapacity }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Purchase Info -->
          <div class="lg:col-span-1">
            <div class="sticky top-4 space-y-6">
              <!-- Price Card -->
              <div class="bg-white rounded-xl shadow-lg p-6 border border-spring-green-light transition-colors duration-500">
                <h3 class="text-xl font-bold mb-4 font-inter">Precio</h3>
                <p class="text-3xl font-bold text-finva-primary mb-6 font-inter">
                  {{ motorcycle.price }}
                </p>
                
                <!-- Colors Available -->
                <div v-if="motorcycle.colors && motorcycle.colors.length > 0" class="mb-6">
                  <h4 class="text-sm font-semibold text-eerie-black/70 mb-3 font-inter">Colores Disponibles</h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(color, index) in motorcycle.colors"
                      :key="index"
                      class="px-3 py-1 text-sm bg-mindaro-light text-eerie-black rounded-full font-inter"
                    >
                      {{ color }}
                    </span>
                  </div>
                </div>

                <!-- CTA Buttons -->
                <div class="space-y-3">
                  <q-btn
                    rounded
                    color="primary"
                    size="lg"
                    class="full-width primary-btn"
                    @click="navigateToQuote"
                  >
                    Cotizar Ahora
                  </q-btn>
                  <q-btn
                    rounded
                    outline
                    color="primary"
                    size="lg"
                    class="full-width secondary-btn"
                    @click="contactDealer"
                  >
                    Contactar Vendedor
                  </q-btn>
                </div>
              </div>

              <!-- Quick Info Card -->
              <div class="bg-uranian-blue-light rounded-xl p-6 transition-colors duration-500">
                <h4 class="text-lg font-semibold mb-4 font-inter">Información Rápida</h4>
                <div class="space-y-3">
                  <div v-if="motorcycle.brand" class="flex justify-between">
                    <span class="text-eerie-black/70 font-inter">Marca:</span>
                    <span class="font-semibold font-inter text-eerie-black">{{ motorcycle.brand }}</span>
                  </div>
                  <div v-if="motorcycle.model" class="flex justify-between">
                    <span class="text-eerie-black/70 font-inter">Modelo:</span>
                    <span class="font-semibold font-inter text-eerie-black">{{ motorcycle.model }}</span>
                  </div>
                  <div v-if="motorcycle.year" class="flex justify-between">
                    <span class="text-eerie-black/70 font-inter">Año:</span>
                    <span class="font-semibold font-inter text-eerie-black">{{ motorcycle.year }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Dialog -->
    <q-dialog v-model="lightbox" maximized>
      <q-card class="bg-eerie-black text-white flex flex-center">
        <q-btn 
          icon="close" 
          flat 
          round 
          dense 
          @click="lightbox = false" 
          class="absolute-top-right z-max q-ma-sm" 
          color="white" 
        />
        <img 
          :src="lightboxImage" 
          alt="Zoomed Image" 
          class="full-width full-height object-contain" 
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

// Carousel and Lightbox properties
const slide = ref(0)
const lightbox = ref(false)
const lightboxImage = ref('')
const imageAspectRatios = ref({}) // Store aspect ratios for each image

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
  if (slide.value === 0) {
    return imageAspectRatios.value['main'] || 16/9 // Default to landscape
  }
  return imageAspectRatios.value[`gallery-${slide.value - 1}`] || 16/9
})

// Dynamic carousel height based on aspect ratio
const carouselHeight = computed(() => {
  const baseWidth = isMobile.value ? 400 : 800 // Approximate container width
  const aspectRatio = currentAspectRatio.value
  const calculatedHeight = baseWidth / aspectRatio
  // Clamp between min and max heights
  const minHeight = isMobile.value ? 250 : 350
  const maxHeight = isMobile.value ? 400 : 550
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

  // Filter out the main image if it's listed in the array, and ensure uniqueness
  const filteredImages = images.filter(image => image !== motorcycle.value.image)
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
      heroImage.value = motorcycle.value.hero_image
      slide.value = 0 // Initialize to the first slide (main image)
      
      // Extract brand and model from name for compatibility
      if (motorcycle.value.name) {
        const nameParts = motorcycle.value.name.split(' ')
        if (nameParts.length > 1) {
          motorcycle.value.brand = nameParts[0]
          motorcycle.value.model = nameParts.slice(1).join(' ')
        } else {
          motorcycle.value.brand = nameParts[0] || 'Unknown'
          motorcycle.value.model = ''
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

<style scoped>
/* Define Finva Colors using your provided HEX values */
.bg-finva-primary { background-color: #2F9F96; } /* Spring Green */
.text-finva-primary { color: #2F9F96; } /* Spring Green */
.border-finva-primary { border-color: #2F9F96; } /* Spring Green */
.bg-eerie-black { background-color: #242424; } /* Eerie Black */
.text-eerie-black { color: #242424; } /* Eerie Black */
.bg-mindaro { background-color: #E9F5DB; } /* Mindaro */
.bg-mindaro-light { background-color: #F0F8E8; } /* Light Mindaro */
.bg-uranian-blue { background-color: #A8DADC; } /* Uranian Blue */
.bg-uranian-blue-light { background-color: #C4E6E8; } /* Light Uranian Blue */
.border-spring-green-light { border-color: #A5DED8; } /* Light Spring Green */
.shadow-inner-custom {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.motorcycle-detail-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.hero-section {
  position: relative;
}

.back-button {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9);
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* --- Carousel and Thumbnail Styles --- */

/* Quasar Carousel Customization */
.motorcycle-carousel {
  background-color: #f9fafb; /* Light background for the overall carousel container */
}

/* Horizontal Image Container */
.image-container-horizontal {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent; /* Transparent background - no black squares */
  position: relative;
  overflow: hidden;
}

.horizontal-image {
  height: 100%;
  width: auto;
  object-fit: contain;
  object-position: center;
  /* Image fills the height exactly, width adjusts to maintain aspect ratio */
  max-height: 100%;
  max-width: 100%;
  display: block;
}

/* Ensure container matches image height exactly - no black space */
.image-container-horizontal:has(img.horizontal-image) {
  background-color: transparent;
}

.image-container-horizontal img.horizontal-image {
  /* Remove any spacing that could cause black background */
  margin: 0;
  padding: 0;
}

/* If image is wider than container, scale to fit width instead */
.image-container-horizontal:has(.horizontal-image[style*="width: 100%"]) {
  align-items: flex-start;
}

/* Alternative: Use object-fit cover for landscape images, but this might crop */
/* Or we can dynamically adjust based on image aspect ratio */

/* Custom Navigation Icons/Thumbnails Wrapper */
:deep(.q-carousel__navigation-icon) {
  /* Override Quasar's default indicator style */
  opacity: 1 !important;
  padding: 0 !important;
  margin: 0 4px !important;
}

/* Thumbnail Styling */
.thumbnail-nav-wrapper {
  width: 60px; /* Base size for mobile */
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid transparent;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.thumbnail-nav-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-nav-wrapper.active-thumbnail {
  border-color: #2F9F96; /* Spring Green border for active slide */
  transform: scale(1.05);
}

.thumbnail-nav-wrapper:hover:not(.active-thumbnail) {
  border-color: #a5ded8; /* Lighter Spring Green on hover */
}

/* Desktop/Tablet adjustments for thumbnails */
@media (min-width: 600px) {
  .thumbnail-nav-wrapper {
    width: 80px;
    height: 80px;
  }
}

.primary-btn {
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.secondary-btn {
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.font-inter {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .hero-section {
    height: 50vh !important;
  }
}
</style>

