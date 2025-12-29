<template>
  <!-- Backdrop overlay - positioned outside container for proper z-index -->
  <div 
    v-if="selectedMotorcycle && isExpanded" 
    class="preview-backdrop" 
    @click="collapseDetails"
  ></div>
  
  <div v-if="selectedMotorcycle" class="motorcycle-preview-container" :style="{ top: topPosition + 'px', '--top-position': topPosition + 'px' }">
    <div class="motorcycle-preview-card" :class="{ 'expanded': isExpanded }" @click.stop>
      <!-- Compact Preview -->
      <div class="preview-content">
        <div class="preview-image-wrapper">
          <img 
            :src="selectedMotorcycle.image" 
            :alt="selectedMotorcycle.name"
            class="preview-image"
            @error="handleImageError"
          />
        </div>
        <div class="preview-info">
          <div class="preview-brand-year">
            <span class="preview-brand">{{ selectedMotorcycle.brand }}</span>
            <span class="preview-separator">|</span>
            <span class="preview-year">{{ selectedMotorcycle.year }}</span>
          </div>
          <div class="preview-name">{{ selectedMotorcycle.model || selectedMotorcycle.name }}</div>
          <div class="preview-price">{{ selectedMotorcycle.price }}</div>
        </div>
        <div class="preview-actions">
          <q-btn
            flat
            dense
            :icon="isExpanded ? 'expand_less' : 'visibility'"
            size="sm"
            class="preview-view-btn"
            @click="toggleDetails"
            :title="isExpanded ? 'Ocultar detalles' : 'Ver detalles'"
          >
            {{ isExpanded ? 'Ocultar' : 'Detalles' }}
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="close"
            size="sm"
            class="preview-close-btn"
            @click="clearSelection"
            title="Cerrar"
          />
        </div>
      </div>

      <!-- Expanded Details -->
      <div v-if="isExpanded" class="expanded-content">
        <div v-if="loadingDetails" class="loading-container">
          <q-spinner size="2rem" color="finva-primary" />
          <p class="loading-text">Cargando detalles...</p>
        </div>

        <div v-else-if="errorDetails" class="error-container">
          <q-icon name="error_outline" size="2rem" color="negative" />
          <p class="error-text">{{ errorDetails }}</p>
        </div>

        <div v-else-if="fullMotorcycleDetails" class="details-content">
          <!-- Gallery Section -->
          <div v-if="imageGallery.length > 0" class="gallery-section">
            <h3 class="section-title">Galería</h3>
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
                class="preview-carousel"
                :style="{ height: carouselHeight }"
              >
                <q-carousel-slide
                  v-for="(img, index) in imageGallery"
                  :key="index"
                  :name="index"
                  class="flex flex-center p-0"
                >
                  <div class="carousel-image-container">
                    <img
                      :src="img"
                      :alt="`${fullMotorcycleDetails.name} - Imagen ${index + 1}`"
                      class="carousel-image"
                      loading="lazy"
                      @click="openImageLightbox(img)"
                      @load="(e) => handleImageLoad(e, `gallery-${index}`)"
                    />
                    <q-icon 
                      name="zoom_in_map" 
                      class="zoom-icon" 
                      @click="openImageLightbox(img)"
                    />
                  </div>
                </q-carousel-slide>

                <template v-slot:navigation-icon="{ active, name }">
                  <div
                    class="thumbnail-nav"
                    :class="{ 'active-thumbnail': active }"
                    @click="slide = name"
                  >
                    <img
                      :src="imageGallery[name]"
                      :alt="`Thumbnail ${name + 1}`"
                      class="thumbnail-img"
                      loading="lazy"
                    />
                  </div>
                </template>
              </q-carousel>
            </ClientOnly>
          </div>

          <!-- Description and Specifications -->
          <div class="specs-section">
            <h3 class="section-title">Descripción y Especificaciones</h3>
            
            <!-- Description -->
            <div class="description-block">
              <h4 class="subsection-title">Descripción</h4>
              <p class="description-text">
                {{ fullMotorcycleDetails.description || `Descubre la ${fullMotorcycleDetails.name}, una máquina de precisión diseñada para la adrenalina. Su motor de alto rendimiento y chasis ligero ofrecen una experiencia de conducción sin igual.` }}
              </p>
            </div>

            <!-- Collapsible Specifications -->
            <div class="specs-list">
              <!-- Technical Specifications -->
              <div v-if="hasTechnicalSpecs" class="spec-item">
                <button
                  @click="expandTechnical = !expandTechnical"
                  class="spec-header"
                >
                  <q-icon name="engineering" class="spec-icon" />
                  <span class="spec-title">Especificaciones Técnicas</span>
                  <q-icon 
                    :name="expandTechnical ? 'expand_less' : 'expand_more'" 
                    class="expand-icon"
                  />
                </button>
                <div v-show="expandTechnical" class="spec-content">
                  <table class="spec-table">
                    <tbody>
                      <tr v-if="fullMotorcycleDetails.technical?.engine">
                        <td class="spec-label">Motor</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.engine }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.displacement">
                        <td class="spec-label">Cilindrada</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.displacement }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.bore_x_stroke">
                        <td class="spec-label">Diámetro x Carrera</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.bore_x_stroke }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.power">
                        <td class="spec-label">Potencia</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.power }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.torque">
                        <td class="spec-label">Torque Máximo</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.torque }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.starting_system">
                        <td class="spec-label">Arranque</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.starting_system }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.fuelCapacity || fullMotorcycleDetails.technical?.fuel_capacity">
                        <td class="spec-label">Capacidad de Combustible</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.fuelCapacity || fullMotorcycleDetails.technical.fuel_capacity }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.transmission">
                        <td class="spec-label">Transmisión</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.transmission }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.cooling">
                        <td class="spec-label">Refrigeración</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.cooling }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.ignition">
                        <td class="spec-label">Encendido</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.ignition }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Chassis Specifications -->
              <div v-if="hasChassisSpecs" class="spec-item">
                <button
                  @click="expandChassis = !expandChassis"
                  class="spec-header"
                >
                  <q-icon name="build" class="spec-icon" />
                  <span class="spec-title">Especificaciones del Chasis</span>
                  <q-icon 
                    :name="expandChassis ? 'expand_less' : 'expand_more'" 
                    class="expand-icon"
                  />
                </button>
                <div v-show="expandChassis" class="spec-content">
                  <table class="spec-table">
                    <tbody>
                      <tr v-if="fullMotorcycleDetails.technical?.frame">
                        <td class="spec-label">Chasis</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.frame }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.front_suspension || fullMotorcycleDetails.technical?.frontSuspension">
                        <td class="spec-label">Suspensión Delantera</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.front_suspension || fullMotorcycleDetails.technical.frontSuspension }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.rear_suspension || fullMotorcycleDetails.technical?.rearSuspension">
                        <td class="spec-label">Suspensión Trasera</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.rear_suspension || fullMotorcycleDetails.technical.rearSuspension }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.front_brake || fullMotorcycleDetails.technical?.frontBrake">
                        <td class="spec-label">Freno Delantero</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.front_brake || fullMotorcycleDetails.technical.frontBrake }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.rear_brake || fullMotorcycleDetails.technical?.rearBrake">
                        <td class="spec-label">Freno Trasero</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.rear_brake || fullMotorcycleDetails.technical.rearBrake }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.front_tire || fullMotorcycleDetails.technical?.frontTire">
                        <td class="spec-label">Neumático Delantero</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.front_tire || fullMotorcycleDetails.technical.frontTire }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.rear_tire || fullMotorcycleDetails.technical?.rearTire">
                        <td class="spec-label">Neumático Trasero</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.rear_tire || fullMotorcycleDetails.technical.rearTire }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Dimensions -->
              <div v-if="hasDimensionsSpecs" class="spec-item">
                <button
                  @click="expandDimensions = !expandDimensions"
                  class="spec-header"
                >
                  <q-icon name="straighten" class="spec-icon" />
                  <span class="spec-title">Dimensiones</span>
                  <q-icon 
                    :name="expandDimensions ? 'expand_less' : 'expand_more'" 
                    class="expand-icon"
                  />
                </button>
                <div v-show="expandDimensions" class="spec-content">
                  <table class="spec-table">
                    <tbody>
                      <tr v-if="fullMotorcycleDetails.technical?.weight">
                        <td class="spec-label">Peso</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.weight }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.length">
                        <td class="spec-label">Longitud</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.length }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.width">
                        <td class="spec-label">Ancho</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.width }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.height">
                        <td class="spec-label">Altura</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.height }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.wheelbase">
                        <td class="spec-label">Distancia entre Ejes</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.wheelbase }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.seat_height || fullMotorcycleDetails.technical?.seatHeight">
                        <td class="spec-label">Altura del Asiento</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.seat_height || fullMotorcycleDetails.technical.seatHeight }}</td>
                      </tr>
                      <tr v-if="fullMotorcycleDetails.technical?.ground_clearance || fullMotorcycleDetails.technical?.groundClearance">
                        <td class="spec-label">Distancia al Suelo</td>
                        <td class="spec-value">{{ fullMotorcycleDetails.technical.ground_clearance || fullMotorcycleDetails.technical.groundClearance }}</td>
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

    <!-- Lightbox Dialog -->
    <q-dialog v-model="lightbox" maximized>
      <q-card class="lightbox-card">
        <q-btn 
          icon="close" 
          flat 
          round 
          dense 
          @click="lightbox = false" 
          class="lightbox-close-btn" 
          color="white" 
          size="lg"
        />
        <img 
          :src="lightboxImage" 
          :alt="`Zoom de ${selectedMotorcycle?.name || 'motocicleta'}`"
          class="lightbox-image" 
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import { useSolicitudStore } from '@/stores/solicitudStore'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const solicitudStore = useSolicitudStore()
const $q = useQuasar()

// Expanded state
const isExpanded = ref(false)
const loadingDetails = ref(false)
const errorDetails = ref<string | null>(null)
const fullMotorcycleDetails = ref<{
  id?: number | string
  name?: string
  brand?: string
  model?: string
  year?: number | string
  price?: string | number
  description?: string
  image?: string
  hero_image?: string
  images?: string[]
  technical?: {
    engine?: string
    displacement?: string
    bore_x_stroke?: string
    power?: string
    torque?: string
    starting_system?: string
    fuelCapacity?: string
    fuel_capacity?: string
    transmission?: string
    cooling?: string
    ignition?: string
    frame?: string
    front_suspension?: string
    frontSuspension?: string
    rear_suspension?: string
    rearSuspension?: string
    front_brake?: string
    frontBrake?: string
    rear_brake?: string
    rearBrake?: string
    front_tire?: string
    frontTire?: string
    rear_tire?: string
    rearTire?: string
    weight?: string
    length?: string
    width?: string
    height?: string
    wheelbase?: string
    seat_height?: string
    seatHeight?: string
    ground_clearance?: string
    groundClearance?: string
  }
} | null>(null)

// Carousel and lightbox
const slide = ref(0)
const lightbox = ref(false)
const lightboxImage = ref('')
const imageAspectRatios = ref<Record<string, number>>({})

// Expansion states for specs
const expandTechnical = ref(false)
const expandChassis = ref(false)
const expandDimensions = ref(false)

// Calculate top position based on navbar
const topPosition = ref(80) // Default navbar height

// Mobile detection
const isMobile = computed(() => $q.screen.lt.md)

function updateTopPosition() {
  if (typeof window === 'undefined') return
  
  // Find ProcessStepper first (it's above MotorcyclePreview)
  const processStepper = document.querySelector('.process-stepper') as HTMLElement
  if (processStepper) {
    const stepperRect = processStepper.getBoundingClientRect()
    // Position MotorcyclePreview below ProcessStepper
    if (stepperRect.height > 0) {
      topPosition.value = stepperRect.bottom
      return
    }
  }
  
  // Fallback: Find navbar element if ProcessStepper not found
  const navbar = document.querySelector('.navbar-finva') as HTMLElement
  if (navbar) {
    const navbarRect = navbar.getBoundingClientRect()
    // Position right below the navbar (or navbar + stepper height if stepper exists but not measured)
    const stepperHeight = 32 // ProcessStepper height
    topPosition.value = navbarRect.bottom + stepperHeight
  }
}

// Store scroll position for restoration
const scrollPosition = ref(0)

// Prevent body scroll when expanded - improved for better UX and responsiveness
watch(isExpanded, (expanded) => {
  if (typeof window === 'undefined') return
  
  if (expanded) {
    // Save current scroll position
    scrollPosition.value = window.scrollY || window.pageYOffset || 0
    
    // Lock body scroll to prevent background scrolling
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPosition.value}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    
    // Update CSS variable for smooth positioning
    requestAnimationFrame(() => {
      const container = document.querySelector('.motorcycle-preview-container')
      if (container) {
        (container as HTMLElement).style.setProperty('--top-position', `${topPosition.value}px`)
      }
    })
  } else {
    // Restore scroll
    const wasFixed = document.body.style.position === 'fixed'
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    
    if (wasFixed && scrollPosition.value > 0) {
      // Use requestAnimationFrame to ensure smooth restoration
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPosition.value, behavior: 'instant' })
        scrollPosition.value = 0
      })
    }
  }
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Wait a bit for ProcessStepper to position first
    requestAnimationFrame(() => {
      updateTopPosition()
      // Try again after ProcessStepper has positioned
      setTimeout(() => {
        updateTopPosition()
      }, 100)
    })
    
    // Update on scroll (navbar changes position when scrolled)
    const handleUpdate = () => {
      requestAnimationFrame(updateTopPosition)
    }
    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate)
    
    // Watch for ProcessStepper position changes
    const processStepper = document.querySelector('.process-stepper')
    if (processStepper) {
      const stepperResizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateTopPosition)
      })
      stepperResizeObserver.observe(processStepper)
      
      const stepperMutationObserver = new MutationObserver(() => {
        requestAnimationFrame(updateTopPosition)
      })
      stepperMutationObserver.observe(processStepper, { 
        attributes: true, 
        attributeFilter: ['style'] 
      })
      
      onUnmounted(() => {
        stepperResizeObserver.disconnect()
        stepperMutationObserver.disconnect()
      })
    }
    
    // Use MutationObserver to watch for navbar class changes
    const navbar = document.querySelector('.navbar-finva')
    if (navbar) {
      const observer = new MutationObserver(() => {
        requestAnimationFrame(updateTopPosition)
      })
      observer.observe(navbar, { attributes: true, attributeFilter: ['class'] })
      
      onUnmounted(() => {
        observer.disconnect()
        window.removeEventListener('scroll', handleUpdate)
        window.removeEventListener('resize', handleUpdate)
        // Cleanup body styles
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
      })
    } else {
      onUnmounted(() => {
        window.removeEventListener('scroll', handleUpdate)
        window.removeEventListener('resize', handleUpdate)
      })
    }
  }
})

// Normalize model name for filename (similar to backend logic)
function normalizeModelNameForFilename(modelName: string): string {
  if (!modelName) {
    return 'unknown'
  }
  
  // Convert to lowercase
  let normalized = modelName.toLowerCase()
  
  // Replace spaces with hyphens
  normalized = normalized.replace(/\s+/g, '-')
  
  // Remove or replace special characters (keep alphanumeric, hyphens, dots, underscores)
  normalized = normalized.replace(/[^a-z0-9\-._]/g, '')
  
  // Replace multiple consecutive hyphens with single hyphen
  normalized = normalized.replace(/-+/g, '-')
  
  // Remove leading/trailing hyphens or dots
  normalized = normalized.replace(/^[-.]+|[-.]+$/g, '')
  
  // If empty after normalization, use a fallback
  if (!normalized) {
    return 'unknown'
  }
  
  return normalized
}

// Construct Supabase image URL from model name
function getMotorcycleImageUrl(modelName: string): string {
  if (!modelName) {
    return '/assets/motorcycle-placeholder.jpg'
  }
  
  const supabaseProjectId = config.public.SUPABASE_PROJECT_ID
  if (!supabaseProjectId) {
    return '/assets/motorcycle-placeholder.jpg'
  }
  
  const normalizedModel = normalizeModelNameForFilename(modelName)
  const imageFilename = `${normalizedModel}.jpg`
  const imageBucket = 'marketplace-assets'
  
  return `https://${supabaseProjectId}.supabase.co/storage/v1/object/public/${imageBucket}/assets/${normalizedModel}/${imageFilename}`
}

// Pages where MotorcyclePreview should be shown
const noAllowedPages = ['/motorcycle/[id]']

// Get selected motorcycle from query params or solicitudStore
const selectedMotorcycle = computed(() => {
  // Only show preview on allowed pages
  if (noAllowedPages.includes(route.path)) {
    return null
  }

  let motorcycleId: string | null = null
  let brand: string | null = null
  let model: string | null = null
  let year: string | null = null
  let price: string | number | null = null

  // Try to get from query params first (for quote-generator)
  if (route.query.motorcycle_id) {
    motorcycleId = route.query.motorcycle_id as string
    brand = route.query.brand as string
    model = route.query.model as string
    year = route.query.year as string
    price = route.query.price as string
  } 
  // If not in query params, get from solicitudStore (for confirm-store and client-validation)
  else if (solicitudStore.solicitud.motorcycle_id) {
    motorcycleId = solicitudStore.solicitud.motorcycle_id.toString()
    brand = solicitudStore.solicitud.brand_motorcycle
    model = solicitudStore.solicitud.model_motorcycle
    year = solicitudStore.solicitud.year_motorcycle?.toString() || null
    price = solicitudStore.solicitud.invoice_motorcycle_value
  }

  // If we have the required data, build the motorcycle object
  if (motorcycleId && brand && model) {
    // Decode model name if it came from query params (URL encoded)
    // If it came from store, it's already decoded
    let decodedModel = model
    if (route.query.model) {
      try {
        decodedModel = decodeURIComponent(model)
      } catch (e) {
        // If decoding fails, use original model
        decodedModel = model
      }
    }
    
    // Format price
    let formattedPrice = 'N/A'
    let priceNumeric: number | null = null
    
    if (price) {
      if (typeof price === 'number') {
        priceNumeric = price
        formattedPrice = `$${price.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
      } else {
        priceNumeric = parseFloat(price.replace(/[^0-9.]/g, ''))
        if (!isNaN(priceNumeric)) {
          formattedPrice = `$${priceNumeric.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
        }
      }
    }

    // Get image URL from model name
    const imageUrl = getMotorcycleImageUrl(decodedModel)

    const motorcycleData = {
      id: motorcycleId,
      brand: brand,
      model: decodedModel,
      name: `${brand} ${decodedModel}`,
      year: year || new Date().getFullYear().toString(),
      price: formattedPrice,
      priceNumeric: priceNumeric,
      image: imageUrl
    }

    // Save to solicitudStore when motorcycle is selected (only if from query params)
    if (route.query.motorcycle_id && motorcycleData.id && motorcycleData.brand && motorcycleData.model) {
      solicitudStore.setMotorcycleData({
        id: parseInt(motorcycleData.id),
        brand: motorcycleData.brand,
        model: motorcycleData.model,
        year: motorcycleData.year,
        price: motorcycleData.priceNumeric
      })
    }

    return motorcycleData
  }
  return null
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = '/assets/motorcycle-placeholder.jpg'
  }
}

// Fetch full motorcycle details
const fetchMotorcycleDetails = async () => {
  const motorcycleId = selectedMotorcycle.value?.id
  if (!motorcycleId) return

  try {
    loadingDetails.value = true
    errorDetails.value = null
    
    const apiBase = config.public.FLASK_BACKEND_URL as string
    const data = await $fetch(`${apiBase}/cms/marketplace/motorcycle/${motorcycleId}`) as any
    
    if (data) {
      fullMotorcycleDetails.value = data
      // Extract brand and model if needed
      if (data.name && !data.model) {
        const nameParts = String(data.name).split(' ')
        if (nameParts.length > 1) {
          if (fullMotorcycleDetails.value) {
            fullMotorcycleDetails.value.brand = data.brand || nameParts[0]
            fullMotorcycleDetails.value.model = data.model || nameParts.slice(1).join(' ')
          }
        }
      }
      slide.value = 0
    } else {
      throw new Error('Motorcycle not found')
    }
  } catch (err: unknown) {
    console.error('Error fetching motorcycle details:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al cargar los detalles de la motocicleta'
    errorDetails.value = errorMessage
  } finally {
    loadingDetails.value = false
  }
}

// Toggle expanded state
const toggleDetails = async () => {
  if (!isExpanded.value) {
    // Expanding - fetch details if not already loaded
    if (!fullMotorcycleDetails.value && !loadingDetails.value) {
      await fetchMotorcycleDetails()
    }
    isExpanded.value = true
  } else {
    collapseDetails()
  }
}

const collapseDetails = () => {
  isExpanded.value = false
}

// Computed properties for gallery and specs
const imageGallery = computed(() => {
  const details = fullMotorcycleDetails.value
  if (!details) return []
  
  const images = details.images && Array.isArray(details.images) 
    ? details.images 
    : []

  // Filter out main image and hero image, ensure uniqueness
  const filteredImages = images.filter((image: string) => 
    image !== details.image && 
    image !== details.hero_image
  )
  return [...new Set(filteredImages)]
})

const hasTechnicalSpecs = computed(() => {
  const details = fullMotorcycleDetails.value
  if (!details?.technical) return false
  const tech = details.technical
  return !!(tech.engine || tech.displacement || tech.bore_x_stroke || tech.power || tech.torque || tech.starting_system || tech.fuelCapacity || tech.fuel_capacity || tech.transmission || tech.cooling || tech.ignition)
})

const hasChassisSpecs = computed(() => {
  const details = fullMotorcycleDetails.value
  if (!details?.technical) return false
  const tech = details.technical
  return !!(tech.frame || tech.front_suspension || tech.frontSuspension || 
           tech.rear_suspension || tech.rearSuspension || 
           tech.front_brake || tech.frontBrake || 
           tech.rear_brake || tech.rearBrake || 
           tech.front_tire || tech.frontTire || 
           tech.rear_tire || tech.rearTire)
})

const hasDimensionsSpecs = computed(() => {
  const details = fullMotorcycleDetails.value
  if (!details?.technical) return false
  const tech = details.technical
  return !!(tech.weight || tech.length || tech.width || tech.height || 
           tech.wheelbase || tech.seat_height || tech.seatHeight || 
           tech.ground_clearance || tech.groundClearance)
})

// Carousel height calculation
const handleImageLoad = (event: Event, imageKey: string) => {
  const img = event.target as HTMLImageElement
  if (img.naturalWidth && img.naturalHeight) {
    const aspectRatio = img.naturalWidth / img.naturalHeight
    imageAspectRatios.value[imageKey] = aspectRatio
  }
}

const currentAspectRatio = computed(() => {
  return imageAspectRatios.value[`gallery-${slide.value}`] || 16/9
})

const carouselHeight = computed(() => {
  if (typeof window === 'undefined') return '400px'
  const baseWidth = isMobile.value ? window.innerWidth * 0.9 : window.innerWidth * 0.6
  const aspectRatio = currentAspectRatio.value
  const calculatedHeight = baseWidth / aspectRatio
  const minHeight = isMobile.value ? 250 : 350
  const maxHeight = isMobile.value ? 400 : 550
  return `${Math.max(minHeight, Math.min(maxHeight, calculatedHeight))}px`
})

// Lightbox functions
const openImageLightbox = (imageURL: string) => {
  lightboxImage.value = imageURL
  lightbox.value = true
}

const clearSelection = () => {
  // Collapse if expanded
  if (isExpanded.value) {
    collapseDetails()
  }
  
  // Reset details
  fullMotorcycleDetails.value = null
  errorDetails.value = null
  
  // Remove motorcycle query params if they exist
  if (route.query.motorcycle_id) {
    const newQuery = { ...route.query }
    delete newQuery.motorcycle_id
    delete newQuery.brand
    delete newQuery.model
    delete newQuery.year
    delete newQuery.price
    delete newQuery.image
    
    router.replace({ 
      path: route.path, 
      query: newQuery 
    })
  }
  
  // Clear motorcycle data from store
  solicitudStore.solicitud.motorcycle_id = null
  solicitudStore.solicitud.brand_motorcycle = ""
  solicitudStore.solicitud.model_motorcycle = ""
  solicitudStore.solicitud.year_motorcycle = null
  solicitudStore.solicitud.invoice_motorcycle_value = null
}

// Watch for motorcycle changes and reset expanded state
watch(() => selectedMotorcycle.value?.id, (newId, oldId) => {
  if (newId !== oldId) {
    isExpanded.value = false
    fullMotorcycleDetails.value = null
    errorDetails.value = null
    slide.value = 0
  }
})

// Cleanup on component unmount
onBeforeUnmount(() => {
  // Ensure body styles are reset
  if (typeof window !== 'undefined') {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
  }
})
</script>

<style scoped>
.preview-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999; /* Above content, below navbar and card */
  animation: fadeIn 0.3s ease-out;
  pointer-events: auto;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  touch-action: none; /* Prevent touch scrolling on backdrop */
}

.motorcycle-preview-container {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1000; /* Above backdrop, same as navbar */
  animation: slideDown 0.3s ease-out;
  pointer-events: none;
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.motorcycle-preview-card {
  background: #ffffff;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid #2FFF96;
  border-top: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  pointer-events: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  will-change: max-height, transform;
}

.motorcycle-preview-card.expanded {
  position: fixed;
  left: 0;
  right: 0;
  top: var(--top-position, 80px);
  bottom: 0;
  max-height: calc(100vh - var(--top-position, 80px));
  height: calc(100vh - var(--top-position, 80px));
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-bottom-color: #E8FA6C;
  z-index: 1001; /* Above backdrop when expanded */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  overscroll-behavior: contain; /* Prevent scroll chaining */
  display: flex;
  flex-direction: column;
  /* Ensure content can scroll fully */
  scroll-padding-bottom: 2rem;
  border-radius: 0;
  will-change: height, transform;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.motorcycle-preview-card:hover:not(.expanded) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-bottom-color: #E8FA6C;
}

.preview-content {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  flex-shrink: 0;
}

/* Make header sticky when expanded */
.motorcycle-preview-card.expanded .preview-content {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.preview-image-wrapper {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.preview-image-wrapper:hover {
  border-color: #2FFF96;
  box-shadow: 0 0 8px rgba(47, 255, 150, 0.3);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-brand-year {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-brand {
  font-weight: 700;
  color: #242424;
}

.preview-separator {
  color: #d1d5db;
}

.preview-year {
  font-weight: 600;
  color: #6b7280;
}

.preview-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #242424;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-price {
  font-size: 1.125rem;
  font-weight: 800;
  color: #242424;
  letter-spacing: 0.5px;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.preview-close-btn {
  color: #6b7280;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.preview-close-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.preview-view-btn {
  color: #242424;
  background: #E8FA6C;
  font-weight: 700;
  font-size: 0.8125rem;
  padding: 6px 16px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-view-btn:hover {
  background: #2FFF96;
  color: #242424;
  box-shadow: 0 4px 8px rgba(47, 255, 150, 0.3);
  transform: translateY(-1px);
}

/* Expanded Content Styles */
.expanded-content {
  padding: 0;
  animation: expandContent 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 2px solid #e5e7eb;
  flex: 1;
  min-height: 0; /* Allow flex child to shrink */
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

@keyframes expandContent {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
}

.loading-text,
.error-text {
  color: #6b7280;
  font-size: 0.9375rem;
  text-align: center;
}

.details-content {
  padding: 1.5rem;
  padding-bottom: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.gallery-section,
.specs-section {
  margin-bottom: 2rem;
}

.gallery-section:last-child,
.specs-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0.5rem; /* Small padding to ensure visibility */
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #242424;
  margin-bottom: 1.5rem;
  font-family: 'Inter', sans-serif;
}

/* Carousel Styles */
.preview-carousel {
  width: 100%;
  background-color: #ffffff !important;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.preview-carousel .q-carousel__track),
:deep(.preview-carousel .q-carousel__slide) {
  background-color: #ffffff !important;
}

.carousel-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  position: relative;
  overflow: hidden;
}

.carousel-image {
  height: 100%;
  width: auto;
  object-fit: contain;
  object-position: center;
  max-height: 100%;
  max-width: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.02);
}

.zoom-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #242424;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.zoom-icon:hover {
  background: #2FFF96;
  color: #242424;
  transform: scale(1.1);
}

.thumbnail-nav {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  filter: grayscale(100%);
  cursor: pointer;
}

.thumbnail-nav.active-thumbnail {
  border-color: #2FFF96;
  transform: scale(1.05);
  filter: grayscale(0%);
}

.thumbnail-nav:hover:not(.active-thumbnail) {
  border-color: rgba(47, 255, 150, 0.5);
  filter: grayscale(50%);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.q-carousel__navigation-icon) {
  opacity: 1 !important;
  padding: 0 !important;
  margin: 0 4px !important;
}

/* Description and Specs Styles */
.description-block {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: rgba(232, 250, 108, 0.2);
  border-radius: 12px;
  border-left: 4px solid #E8FA6C;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #242424;
  margin-bottom: 0.75rem;
  font-family: 'Inter', sans-serif;
}

.description-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #242424;
  font-family: 'Inter', sans-serif;
}

.specs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spec-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(36, 36, 36, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.spec-item:hover {
  box-shadow: 0 2px 8px rgba(47, 255, 150, 0.15);
}

.spec-header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
  gap: 0.75rem;
}

.spec-header:hover {
  background: rgba(232, 250, 108, 0.2);
}

.spec-icon {
  color: #2FFF96;
  font-size: 1.25rem;
}

.spec-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 700;
  color: #242424;
  font-family: 'Inter', sans-serif;
}

.expand-icon {
  color: #6b7280;
  transition: transform 0.3s ease;
}

.spec-content {
  padding: 1.25rem;
  animation: slideDownSpec 0.3s ease-out;
  overflow: visible; /* Ensure all content is visible */
  min-height: 0; /* Allow content to expand */
}

@keyframes slideDownSpec {
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
  width: 100%;
  border-collapse: collapse;
  table-layout: auto; /* Allow table to size based on content */
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
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Lightbox Styles */
.lightbox-card {
  background: #242424 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lightbox-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.lightbox-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .motorcycle-preview-card.expanded {
    max-height: calc(100vh - var(--top-position, 80px));
    border-radius: 0;
    /* Remove fixed height to allow natural content flow */
  }
  
  .motorcycle-preview-card.expanded .preview-content {
    padding: 10px 12px;
  }

  .preview-content {
    gap: 12px;
  }
  
  .preview-image-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 8px;
  }
  
  .preview-name {
    font-size: 0.875rem;
  }
  
  .preview-price {
    font-size: 1rem;
  }
  
  .preview-brand-year {
    font-size: 0.6875rem;
  }
  
  .preview-view-btn {
    font-size: 0.75rem;
    padding: 5px 12px;
  }

  .details-content {
    padding: 1rem;
    padding-bottom: 4rem; /* Extra bottom padding for mobile scrolling */
    min-height: auto; /* Allow content to expand naturally */
  }
  
  .expanded-content {
    overflow: visible; /* Ensure all content is visible */
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .description-block {
    padding: 1rem;
  }

  .spec-header {
    padding: 0.875rem 1rem;
  }

  .spec-content {
    padding: 1rem;
    overflow: visible; /* Ensure all content is visible on mobile */
  }

  .spec-label {
    width: 45%;
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
    word-wrap: break-word;
  }

  .spec-value {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    word-wrap: break-word;
    word-break: break-word;
  }
  
  .specs-section {
    margin-bottom: 1.5rem;
  }
  
  .specs-section:last-child {
    margin-bottom: 0;
    padding-bottom: 1rem; /* Extra space at bottom */
  }

  .thumbnail-nav {
    width: 50px;
    height: 50px;
  }

  .carousel-image-container {
    padding: 0.5rem;
  }
}

@media (max-width: 640px) {
  .preview-content {
    padding: 8px 10px;
    gap: 10px;
  }
  
  .preview-image-wrapper {
    width: 55px;
    height: 55px;
    border-radius: 8px;
  }
  
  .preview-name {
    font-size: 0.8125rem;
    margin-bottom: 2px;
  }
  
  .preview-price {
    font-size: 0.9375rem;
  }
  
  .preview-view-btn {
    font-size: 0.6875rem;
    padding: 4px 10px;
  }
  
  .preview-actions {
    gap: 6px;
  }

  .details-content {
    padding: 0.75rem;
    padding-bottom: 4rem; /* Extra bottom padding for mobile scrolling */
    min-height: auto; /* Allow content to expand naturally */
  }
  
  .expanded-content {
    overflow: visible; /* Ensure all content is visible */
  }

  .section-title {
    font-size: 1.125rem;
  }

  .description-block {
    padding: 0.875rem;
  }

  .spec-header {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .spec-content {
    padding: 0.875rem;
    overflow: visible; /* Ensure all content is visible on mobile */
  }

  .spec-label {
    width: 50%;
    font-size: 0.6875rem;
    padding: 0.5rem;
    word-wrap: break-word;
  }

  .spec-value {
    font-size: 0.8125rem;
    padding: 0.5rem;
    word-wrap: break-word;
    word-break: break-word;
  }
  
  .specs-section {
    margin-bottom: 1.25rem;
  }
  
  .specs-section:last-child {
    margin-bottom: 0;
    padding-bottom: 1rem; /* Extra space at bottom */
  }

  .thumbnail-nav {
    width: 45px;
    height: 45px;
  }
}

/* Smooth scrolling for expanded content */
.motorcycle-preview-card.expanded {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Hide scrollbar on mobile for cleaner look */
@media (max-width: 768px) {
  .motorcycle-preview-card.expanded::-webkit-scrollbar {
    width: 4px;
  }

  .motorcycle-preview-card.expanded::-webkit-scrollbar-track {
    background: transparent;
  }

  .motorcycle-preview-card.expanded::-webkit-scrollbar-thumb {
    background: rgba(47, 255, 150, 0.3);
    border-radius: 2px;
  }
}
</style>

