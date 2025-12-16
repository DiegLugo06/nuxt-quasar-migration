<template>
  <div v-if="selectedMotorcycle" class="motorcycle-preview-container" :style="{ top: topPosition + 'px' }">
    <div class="motorcycle-preview-card">
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
            icon="visibility"
            size="sm"
            class="preview-view-btn"
            @click="viewDetails"
            title="Ver detalles"
          >
            Ver detalles
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Calculate top position based on navbar
const topPosition = ref(80) // Default navbar height

function updateTopPosition() {
  if (typeof window === 'undefined') return
  
  // Find navbar element
  const navbar = document.querySelector('.navbar-finva') as HTMLElement
  if (navbar) {
    const navbarRect = navbar.getBoundingClientRect()
    // Position right below the navbar
    topPosition.value = navbarRect.bottom
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    updateTopPosition()
    // Update on scroll (navbar changes position when scrolled)
    const handleUpdate = () => {
      requestAnimationFrame(updateTopPosition)
    }
    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate)
    
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

// Get selected motorcycle from query params
const selectedMotorcycle = computed(() => {
  const motorcycleId = route.query.motorcycle_id as string
  const brand = route.query.brand as string
  const model = route.query.model as string
  const year = route.query.year as string
  const price = route.query.price as string

  // Only show preview on quote-generator page
  if (route.path !== '/quote-generator') {
    return null
  }

  if (motorcycleId && brand && model) {
    // Decode model name
    const decodedModel = decodeURIComponent(model)
    
    // Format price
    let formattedPrice = 'N/A'
    if (price) {
      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''))
      if (!isNaN(numericPrice)) {
        formattedPrice = `$${numericPrice.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
      }
    }

    // Get image URL from model name
    const imageUrl = getMotorcycleImageUrl(decodedModel)

    return {
      id: motorcycleId,
      brand: brand,
      model: decodedModel,
      name: `${brand} ${decodedModel}`,
      year: year || new Date().getFullYear().toString(),
      price: formattedPrice,
      image: imageUrl
    }
  }
  return null
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = '/assets/motorcycle-placeholder.jpg'
  }
}

const viewDetails = () => {
  const motorcycleId = route.query.motorcycle_id as string
  if (motorcycleId) {
    router.push(`/motorcycle/${motorcycleId}`)
  }
}

const clearSelection = () => {
  // Remove motorcycle query params
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
</script>

<style scoped>
.motorcycle-preview-container {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 998; /* Below navbar (1000) but above content */
  animation: slideDown 0.3s ease-out;
  pointer-events: none;
  width: 100%;
}

/* Dynamic top position set via inline style */

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
  transition: all 0.3s ease;
}

.motorcycle-preview-card:hover {
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

@media (max-width: 768px) {
  .preview-content {
    padding: 10px 12px;
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
}
</style>

