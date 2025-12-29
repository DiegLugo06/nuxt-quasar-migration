<template>
  <div class="motorcycle-detail-page bg-white text-eerie-black">
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
      <section class="hero-section relative w-full overflow-hidden border-b-4 border-finva-primary">
        <div class="relative w-full h-full">
          <img
            :src="heroImage || motorcycle.image"
            :alt="motorcycleModelName"
            class="w-full h-full object-cover object-center"
            loading="eager"
          />

          <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 z-10">
            <div class="max-w-7xl mx-auto">
              <p class="text-sm sm:text-lg font-medium text-finva-primary uppercase mb-2">
                {{ motorcycle.brand }} | {{ motorcycle.year }}
              </p>
              <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 font-inter leading-tight tracking-wider drop-shadow-lg">
                {{ motorcycleModelName }}
              </h1>
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
          <div class="rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-finva-primary/20 bg-white">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              
              <div class="price-cta-section order-1 md:order-2">
                <h3 class="text-sm font-medium text-eerie-black/60 mb-2 font-inter uppercase tracking-wider">
                  Precio desde
                </h3>
                <p class="text-4xl sm:text-5xl font-bold text-eerie-black mb-6 font-inter">
                  {{ motorcycle.price }}
                </p>
                
                <div v-if="motorcycle.colors && motorcycle.colors.length > 0" class="mb-8">
                  <h4 class="text-xs font-medium text-eerie-black/60 mb-3 font-inter uppercase tracking-wider">Colores Disponibles</h4>
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
              </div>
              <div class="main-image-container overflow-hidden rounded-lg bg-gray-50 p-4 w-full order-2 md:order-1 flex flex-col">
                <div class="relative w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center flex-grow">
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
                <div class="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <q-btn
                    rounded
                    color="finva-primary"
                    text-color="eerie-black"
                    size="md"
                    class="flex-1 action-btn action-btn-primary"
                    @click="navigateToQuote"
                    icon="shopping_cart"
                  >
                    Cotiza Ahora
                  </q-btn>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          <div class="w-full lg:col-span-2 space-y-6 sm:space-y-8 order-1 lg:order-1">
            
            <!-- Gallery Section - Moved to Top -->
            <div v-if="imageGallery.length > 0" class="p-6 sm:p-8 rounded-xl bg-white border border-finva-primary/10">
              <h2 class="text-2xl sm:text-3xl font-bold text-eerie-black mb-6 font-inter">
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
                  :class="{ 'mobile-height-adjust': isMobile }"
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
                      <q-icon name="zoom_in_map" class="absolute-top-right q-ma-md text-h5 cursor-pointer z-10 p-2 rounded-full transition-colors shadow-md text-eerie-black hover:text-finva-primary bg-white/90" />
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

            <!-- Description and Specifications Section -->
            <div class="p-6 sm:p-8 rounded-xl bg-mindaro border border-finva-primary/10">
              <h2 class="text-2xl sm:text-3xl font-bold text-eerie-black mb-6 font-inter">
                Descripción y Especificaciones
              </h2>
              
              <!-- Description -->
              <div class="mb-8">
                <h3 class="text-xl font-bold text-eerie-black mb-3 font-inter">Descripción</h3>
                <div class="prose max-w-none">
                  <p v-if="motorcycle.description" class="leading-relaxed text-eerie-black font-inter">
                    {{ motorcycle.description }}
                  </p>
                  <p v-else class="leading-relaxed text-eerie-black font-inter italic">
                    Descubre la {{ motorcycle.name }}, una máquina de precisión diseñada para la adrenalina. Su motor de alto rendimiento y chasis ligero ofrecen una experiencia de conducción sin igual.
                  </p>
                </div>
              </div>

              <!-- Collapsible Specifications -->
              <div class="space-y-4">
                <!-- Technical Specifications - Collapsible -->
                <div v-if="hasTechnicalSpecs" class="spec-expansion-item">
                  <button
                    @click="expandTechnical = !expandTechnical"
                    class="spec-expansion-header"
                  >
                    <q-icon name="engineering" class="mr-2" />
                    <span class="text-lg font-bold text-eerie-black font-inter">
                      Especificaciones Técnicas
                    </span>
                    <q-icon 
                      :name="expandTechnical ? 'expand_less' : 'expand_more'" 
                      class="ml-auto"
                    />
                  </button>
                  <div v-show="expandTechnical" class="spec-expansion-content">
                  <div class="spec-table-container">
                    <div class="overflow-x-auto">
                      <table class="spec-table w-full">
                        <tbody>
                          <tr v-if="motorcycle.technical?.engine">
                            <td class="spec-label">Motor</td>
                            <td class="spec-value">{{ motorcycle.technical.engine }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.displacement">
                            <td class="spec-label">Cilindrada</td>
                            <td class="spec-value">{{ motorcycle.technical.displacement }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.bore_x_stroke">
                            <td class="spec-label">Diámetro x Carrera</td>
                            <td class="spec-value">{{ motorcycle.technical.bore_x_stroke }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.power">
                            <td class="spec-label">Potencia</td>
                            <td class="spec-value">{{ motorcycle.technical.power }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.torque">
                            <td class="spec-label">Torque Máximo</td>
                            <td class="spec-value">{{ motorcycle.technical.torque }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.starting_system">
                            <td class="spec-label">Arranque</td>
                            <td class="spec-value">{{ motorcycle.technical.starting_system }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.fuelCapacity || motorcycle.technical?.fuel_capacity">
                            <td class="spec-label">Capacidad de Combustible</td>
                            <td class="spec-value">{{ motorcycle.technical.fuelCapacity || motorcycle.technical.fuel_capacity }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.transmission">
                            <td class="spec-label">Transmisión</td>
                            <td class="spec-value">{{ motorcycle.technical.transmission }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.cooling">
                            <td class="spec-label">Refrigeración</td>
                            <td class="spec-value">{{ motorcycle.technical.cooling }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.ignition">
                            <td class="spec-label">Encendido</td>
                            <td class="spec-value">{{ motorcycle.technical.ignition }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </div>
                </div>

                <!-- Chassis Specifications - Collapsible -->
                <div v-if="hasChassisSpecs" class="spec-expansion-item">
                  <button
                    @click="expandChassis = !expandChassis"
                    class="spec-expansion-header"
                  >
                    <q-icon name="build" class="mr-2" />
                    <span class="text-lg font-bold text-eerie-black font-inter">
                      Especificaciones del Chasis
                    </span>
                    <q-icon 
                      :name="expandChassis ? 'expand_less' : 'expand_more'" 
                      class="ml-auto"
                    />
                  </button>
                  <div v-show="expandChassis" class="spec-expansion-content">
                  <div class="spec-table-container">
                    <div class="overflow-x-auto">
                      <table class="spec-table w-full">
                        <tbody>
                          <tr v-if="motorcycle.technical?.frame">
                            <td class="spec-label">Chasis</td>
                            <td class="spec-value">{{ motorcycle.technical.frame }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.front_suspension || motorcycle.technical?.frontSuspension">
                            <td class="spec-label">Suspensión Delantera</td>
                            <td class="spec-value">{{ motorcycle.technical.front_suspension || motorcycle.technical.frontSuspension }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.rear_suspension || motorcycle.technical?.rearSuspension">
                            <td class="spec-label">Suspensión Trasera</td>
                            <td class="spec-value">{{ motorcycle.technical.rear_suspension || motorcycle.technical.rearSuspension }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.front_brake || motorcycle.technical?.frontBrake">
                            <td class="spec-label">Freno Delantero</td>
                            <td class="spec-value">{{ motorcycle.technical.front_brake || motorcycle.technical.frontBrake }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.rear_brake || motorcycle.technical?.rearBrake">
                            <td class="spec-label">Freno Trasero</td>
                            <td class="spec-value">{{ motorcycle.technical.rear_brake || motorcycle.technical.rearBrake }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.front_tire || motorcycle.technical?.frontTire">
                            <td class="spec-label">Neumático Delantero</td>
                            <td class="spec-value">{{ motorcycle.technical.front_tire || motorcycle.technical.frontTire }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.rear_tire || motorcycle.technical?.rearTire">
                            <td class="spec-label">Neumático Trasero</td>
                            <td class="spec-value">{{ motorcycle.technical.rear_tire || motorcycle.technical.rearTire }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </div>
                </div>

                <!-- Dimensions - Collapsible -->
                <div v-if="hasDimensionsSpecs" class="spec-expansion-item">
                  <button
                    @click="expandDimensions = !expandDimensions"
                    class="spec-expansion-header"
                  >
                    <q-icon name="straighten" class="mr-2" />
                    <span class="text-lg font-bold text-eerie-black font-inter">
                      Dimensiones
                    </span>
                    <q-icon 
                      :name="expandDimensions ? 'expand_less' : 'expand_more'" 
                      class="ml-auto"
                    />
                  </button>
                  <div v-show="expandDimensions" class="spec-expansion-content">
                  <div class="spec-table-container">
                    <div class="overflow-x-auto">
                      <table class="spec-table w-full">
                        <tbody>
                          <tr v-if="motorcycle.technical?.weight">
                            <td class="spec-label">Peso</td>
                            <td class="spec-value">{{ motorcycle.technical.weight }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.length">
                            <td class="spec-label">Longitud</td>
                            <td class="spec-value">{{ motorcycle.technical.length }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.width">
                            <td class="spec-label">Ancho</td>
                            <td class="spec-value">{{ motorcycle.technical.width }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.height">
                            <td class="spec-label">Altura</td>
                            <td class="spec-value">{{ motorcycle.technical.height }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.wheelbase">
                            <td class="spec-label">Distancia entre Ejes</td>
                            <td class="spec-value">{{ motorcycle.technical.wheelbase }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.seat_height || motorcycle.technical?.seatHeight">
                            <td class="spec-label">Altura del Asiento</td>
                            <td class="spec-value">{{ motorcycle.technical.seat_height || motorcycle.technical.seatHeight }}</td>
                          </tr>
                          <tr v-if="motorcycle.technical?.ground_clearance || motorcycle.technical?.groundClearance">
                            <td class="spec-label">Distancia al Suelo</td>
                            <td class="spec-value">{{ motorcycle.technical.ground_clearance || motorcycle.technical.groundClearance }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          <div class="w-full lg:col-span-1 order-2 lg:order-2">
            <div class="lg:sticky lg:top-8 space-y-6 w-full">


              <div class="rounded-xl p-6 border bg-white border-finva-primary/10">
                <p class="text-sm font-medium text-eerie-black/80 mb-4 font-inter">¿Necesitas asistencia?</p>
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
import { useMotorcycleStore } from '@/stores/motorcycleStore'
import { useSolicitudStore } from '@/stores/solicitudStore'

const route = useRoute()
const $q = useQuasar()
const motorcycleStore = useMotorcycleStore()
const solicitudStore = useSolicitudStore()

const motorcycle = ref(null)
const loading = ref(true)
const error = ref(null)
const heroImage = ref(null)

// Carousel and Lightbox properties
const slide = ref(0)
const lightbox = ref(false)
const lightboxImage = ref('')
const imageAspectRatios = ref({})

// Expansion items state (all collapsed by default)
const expandTechnical = ref(false)
const expandChassis = ref(false)
const expandDimensions = ref(false) 

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

// Computed property for model name only (without brand)
const motorcycleModelName = computed(() => {
  if (!motorcycle.value) return ''
  
  // If model is already extracted, use it
  if (motorcycle.value.model) {
    return motorcycle.value.model
  }
  
  // Otherwise, extract model from name (remove first word which is brand)
  if (motorcycle.value.name) {
    const nameParts = motorcycle.value.name.split(' ')
    if (nameParts.length > 1) {
      return nameParts.slice(1).join(' ')
    }
    return motorcycle.value.name
  }
  
  return ''
})

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

// Computed properties to check if each spec category has data
const hasTechnicalSpecs = computed(() => {
  if (!motorcycle.value?.technical) return false
  const tech = motorcycle.value.technical
  return !!(tech.engine || tech.displacement || tech.bore_x_stroke || tech.power || tech.torque || tech.starting_system || tech.fuelCapacity || tech.fuel_capacity || tech.transmission || tech.cooling || tech.ignition)
})

const hasChassisSpecs = computed(() => {
  if (!motorcycle.value?.technical) return false
  const tech = motorcycle.value.technical
  return !!(tech.frame || tech.front_suspension || tech.frontSuspension || 
           tech.rear_suspension || tech.rearSuspension || 
           tech.front_brake || tech.frontBrake || 
           tech.rear_brake || tech.rearBrake || 
           tech.front_tire || tech.frontTire || 
           tech.rear_tire || tech.rearTire)
})

const hasDimensionsSpecs = computed(() => {
  if (!motorcycle.value?.technical) return false
  const tech = motorcycle.value.technical
  return !!(tech.weight || tech.length || tech.width || tech.height || 
           tech.wheelbase || tech.seat_height || tech.seatHeight || 
           tech.ground_clearance || tech.groundClearance)
})

// Function to open lightbox
const openImageLightbox = (imageURL) => {
  lightboxImage.value = imageURL
  lightbox.value = true
}

// Helper function to extract numeric price from formatted string or number
const extractPriceNumber = (price) => {
  if (typeof price === 'number') {
    return price
  }
  if (typeof price === 'string') {
    // Remove currency symbols, commas, and spaces, then parse
    const numericValue = parseFloat(price.replace(/[^0-9.-]/g, ''))
    return isNaN(numericValue) ? null : numericValue
  }
  return null
}

// Save motorcycle data to motorcycleStore.form
const saveToMotorcycleStore = () => {
  if (!motorcycle.value) return

  const brand = motorcycle.value.brand || ''
  const model = motorcycle.value.model || ''
  const year = motorcycle.value.year ? parseInt(motorcycle.value.year) : new Date().getFullYear()
  const priceNumber = extractPriceNumber(motorcycle.value.price)

  // Update motorcycleStore.form
  motorcycleStore.form.brand = brand
  motorcycleStore.form.model = model
  motorcycleStore.form.year = year
  motorcycleStore.form.price = priceNumber || ''
  
  // Also set motorcycleId if available
  if (motorcycle.value.id) {
    motorcycleStore.motorcycleId = motorcycle.value.id
  }
}

// Save motorcycle data to solicitudStore.solicitud (similar to original store)
const saveToSolicitudStore = () => {
  if (!motorcycle.value) return

  const motorcycleId = motorcycle.value.id ? parseInt(motorcycle.value.id) : null
  const brand = motorcycle.value.brand || ''
  const model = motorcycle.value.model || ''
  const year = motorcycle.value.year ? parseInt(motorcycle.value.year) : new Date().getFullYear()
  const priceNumber = extractPriceNumber(motorcycle.value.price)

  // Update solicitudStore.solicitud (similar structure to original solicitudStore.js)
  solicitudStore.solicitud.motorcycle_id = motorcycleId
  solicitudStore.solicitud.brand_motorcycle = brand
  solicitudStore.solicitud.model_motorcycle = model
  solicitudStore.solicitud.year_motorcycle = year
  solicitudStore.solicitud.invoice_motorcycle_value = priceNumber
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

      // Save to motorcycleStore.form
      saveToMotorcycleStore()
      
      // Save to solicitudStore.solicitud
      saveToSolicitudStore()
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
        model: motorcycle.value.model || motorcycleModelName.value,
        year: motorcycle.value.year,
        price: motorcycle.value.price,
        image: motorcycle.value.image
      }
    })
  } else {
    navigateTo('/quote-generator')
  }
}

const navigateToFinancing = () => {
  // Navigate to financing page with motorcycle ID
  if (motorcycle.value) {
    navigateTo({
      path: '/quote-generator',
      query: {
        motorcycle_id: motorcycle.value.id,
        brand: motorcycle.value.brand,
        model: motorcycle.value.model || motorcycleModelName.value,
        year: motorcycle.value.year,
        price: motorcycle.value.price,
        image: motorcycle.value.image,
        step: 'financing'
      }
    })
  } else {
    navigateTo('/quote-generator?step=financing')
  }
}

const findStore = () => {
  // Navigate to store finder or open store locator
  navigateTo('/stores')
  // Or you can implement a modal/map here
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
  
  /* Hero Section */
  .hero-section {
    width: 100%;
    height: 65vh;
    min-height: 300px;
    position: relative;
    overflow: hidden;
  }
  
  .hero-section > .relative {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .hero-section img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  
  /* CTA Hero Button - Improved Styling */
  .cta-hero-btn {
    min-height: 64px !important;
    font-size: 1.25rem !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding: 0 2rem;
    box-shadow: 0 8px 16px rgba(47, 255, 150, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  
  .cta-hero-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  .cta-hero-btn:hover::before {
    left: 100%;
  }
  
  .cta-hero-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(47, 255, 150, 0.4);
  }
  
  .cta-hero-btn:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(47, 255, 150, 0.3);
  }
  
  /* Primary Button Styles */
  .primary-btn {
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  }
  
  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(47, 255, 150, 0.3);
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
    display: flex;
    flex-direction: column;
  }
  
  .main-image-container > div:first-child {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 250px;
    flex-grow: 1;
  }
  
  /* Action Buttons Base Styles */
  .action-btn {
    min-height: 48px !important;
    max-height: 48px !important;
    font-size: 0.875rem !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0.625rem 1.25rem !important;
    border: none !important;
    position: relative;
    overflow: hidden;
  }
  
  .action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  .action-btn:hover::before {
    left: 100%;
  }
  
  .action-btn:hover {
    transform: translateY(-2px);
  }
  
  .action-btn:active {
    transform: translateY(0);
  }
  
  /* Primary Button - Cotizar (Spring Green) */
  .action-btn-primary {
    background: linear-gradient(135deg, #2FFF96 0%, #26E885 100%) !important;
    color: #242424 !important;
    box-shadow: 0 4px 12px rgba(47, 255, 150, 0.4), 0 2px 4px rgba(47, 255, 150, 0.2);
  }
  
  .action-btn-primary:hover {
    background: linear-gradient(135deg, #26E885 0%, #2FFF96 100%) !important;
    box-shadow: 0 6px 16px rgba(47, 255, 150, 0.5), 0 4px 8px rgba(47, 255, 150, 0.3);
  }
  
  .action-btn-primary:active {
    box-shadow: 0 2px 8px rgba(47, 255, 150, 0.3);
  }
  
  /* Financing Button - Mindaro (Light Yellow) */
  .action-btn-financing {
    background: linear-gradient(135deg, #E8FA6C 0%, #D4F04A 100%) !important;
    color: #242424 !important;
    box-shadow: 0 4px 12px rgba(232, 250, 108, 0.4), 0 2px 4px rgba(232, 250, 108, 0.2);
  }
  
  .action-btn-financing:hover {
    background: linear-gradient(135deg, #D4F04A 0%, #E8FA6C 100%) !important;
    box-shadow: 0 6px 16px rgba(232, 250, 108, 0.5), 0 4px 8px rgba(232, 250, 108, 0.3);
  }
  
  .action-btn-financing:active {
    box-shadow: 0 2px 8px rgba(232, 250, 108, 0.3);
  }
  
  /* Store Button - Uranian Blue */
  .action-btn-store {
    background: linear-gradient(135deg, #A5DEFD 0%, #7BCEF9 100%) !important;
    color: #242424 !important;
    box-shadow: 0 4px 12px rgba(165, 222, 253, 0.4), 0 2px 4px rgba(165, 222, 253, 0.2);
  }
  
  .action-btn-store:hover {
    background: linear-gradient(135deg, #7BCEF9 0%, #A5DEFD 100%) !important;
    box-shadow: 0 6px 16px rgba(165, 222, 253, 0.5), 0 4px 8px rgba(165, 222, 253, 0.3);
  }
  
  .action-btn-store:active {
    box-shadow: 0 2px 8px rgba(165, 222, 253, 0.3);
  }
  
  /* Icon spacing in buttons */
  .action-btn .q-icon {
    margin-right: 0.5rem;
  }
  
  @media (max-width: 640px) {
    .main-image-container .flex.flex-col.sm\\:flex-row {
      flex-direction: column;
    }
    
    .action-btn {
      width: 100%;
    }
  }
  
  /* Carousel */
  .motorcycle-carousel {
    width: 100%;
    max-width: 100%;
    background-color: #ffffff !important;
    min-height: 300px;
  }
  
  /* Override Quasar carousel default background */
  :deep(.motorcycle-carousel .q-carousel__track),
  :deep(.motorcycle-carousel .q-carousel__slide) {
    background-color: #ffffff !important;
  }
  
  /* Image Container for Carousel */
  .image-container-horizontal {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    position: relative;
    overflow: hidden;
  }
  
  .horizontal-image {
    height: 100%;
    width: auto;
    object-fit: contain;
    object-position: center;
    max-height: 100%;
    max-width: 100%;
    display: block;
    cursor: pointer;
    margin: 0;
    padding: 0;
  }
  
  /* Ensure carousel slides are properly sized */
  :deep(.q-carousel__slide) {
    width: 100%;
    height: 100%;
  }
  
  :deep(.q-carousel__navigation-icon) {
    opacity: 1 !important;
    padding: 0 !important;
    margin: 0 4px !important;
  }
  
  /* Thumbnail Navigation */
  .thumbnail-nav-wrapper {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    overflow: hidden;
    border: 3px solid transparent;
    transition: border-color 0.2s ease, transform 0.2s ease, filter 0.2s ease;
    filter: grayscale(100%);
  }
  
  .thumbnail-nav-wrapper.active-thumbnail {
    border-color: #2FFF96;
    transform: scale(1.05);
    filter: grayscale(0%);
  }
  
  .thumbnail-nav-wrapper:hover:not(.active-thumbnail) {
    border-color: rgba(47, 255, 150, 0.5);
    filter: grayscale(50%);
  }
  
  .thumbnail-nav-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Text overflow */
  h1, h2, h3, h4, p, span {
    max-width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  
  /* Specification Tables */
  .spec-table-container {
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  /* Collapsible Specification Items */
  .spec-expansion-item {
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 0.75rem;
    margin-bottom: 0.5rem;
    border: 1px solid rgba(36, 36, 36, 0.1);
    overflow: hidden;
  }
  
  .spec-expansion-header {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    background-color: rgba(255, 255, 255, 0.8);
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-align: left;
  }
  
  .spec-expansion-header:hover {
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  .spec-expansion-header:focus {
    outline: 2px solid var(--finva-primary, #2FFF96);
    outline-offset: -2px;
  }
  
  .spec-expansion-content {
    padding: 1.5rem;
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .spec-table {
    border-collapse: collapse;
    width: 100%;
  }
  
  .spec-table tbody tr {
    border-bottom: 1px solid rgba(36, 36, 36, 0.1);
    transition: background-color 0.2s ease;
  }
  
  .spec-table tbody tr:last-child {
    border-bottom: none;
  }
  
  .spec-table tbody tr:hover {
    background-color: rgba(47, 255, 150, 0.05);
  }
  
  .spec-label {
    padding: 0.75rem 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: #242424;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: 40%;
    vertical-align: top;
    font-family: 'Inter', sans-serif;
  }
  
  .spec-value {
    padding: 0.75rem 1rem;
    font-weight: 500;
    font-size: 0.9375rem;
    color: #242424;
    font-family: 'Inter', sans-serif;
  }
  
  @media (max-width: 640px) {
    .spec-label {
      width: 45%;
      font-size: 0.75rem;
      padding: 0.5rem 0.75rem;
    }
    
    .spec-value {
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
    }
    
    .spec-table-container {
      padding: 1rem;
    }
  }
  
  /* ========== RESPONSIVE BREAKPOINTS ========== */
  
  /* Small mobile (up to 375px) */
  @media (max-width: 375px) {
    .hero-section {
      height: 50vh !important;
      min-height: 300px;
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
    
    .thumbnail-nav-wrapper {
      width: 60px;
      height: 60px;
    }
  }
  
  /* Mobile (376px - 640px) */
  @media (min-width: 376px) and (max-width: 640px) {
    .hero-section {
      height: 50vh !important;
      min-height: 350px;
    }
    
    .hero-section h1 {
      font-size: 1.75rem !important;
    }
    
    .main-image-container > div {
      min-height: 220px;
    }
    
    .thumbnail-nav-wrapper {
      width: 60px;
      height: 60px;
    }
  }
  
  /* Tablet (641px - 768px) */
  @media (min-width: 641px) and (max-width: 768px) {
    .hero-section {
      height: 45vh !important;
      min-height: 400px;
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
    .hero-section {
      height: 55vh !important;
      min-height: 450px;
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
    .hero-section {
      height: 65vh !important;
      min-height: 500px;
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