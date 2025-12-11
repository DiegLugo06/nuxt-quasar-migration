<template>
  <div class="quote-generator-container">
    <!-- Mobile-first header -->
    <div class="quote-header">
      <h1 class="quote-title">Cotiza tu moto</h1>
      <p class="quote-subtitle">Encuentra la mejor opción de financiamiento</p>
    </div>

    <!-- Progress indicator -->
    <div class="progress-wrapper">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-steps">
        <div 
          v-for="(s, i) in steps" 
          :key="i"
          :class="['progress-step', { active: step >= i, completed: step > i }]"
        >
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-label">{{ s.title }}</div>
        </div>
      </div>
    </div>

    <!-- Main content card -->
    <q-card class="main-card">
      <q-card-section>
        <!-- STEP 1: Brand Selection -->
        <div v-if="step === 0" class="step-content">
          <div class="step-header">
            <h2 class="step-title">Selecciona la marca</h2>
            <p class="step-description">Elige la marca de tu motocicleta</p>
          </div>

          <q-input
            v-model="brandSearch"
            placeholder="Buscar marca..."
            outlined
            clearable
            size="lg"
            class="search-input"
            @update:model-value="onBrandSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <div v-if="loadingBrands" class="loading-container">
            <q-spinner size="3rem" color="primary" />
            <p class="loading-text">Cargando marcas...</p>
          </div>

          <div v-else class="brands-grid">
            <div
              v-for="brand in visibleBrands"
              :key="brand.id"
              :data-brand-id="brand.id"
              @click="selectBrand(brand)"
              :class="['brand-card', { selected: selectedBrand?.id === brand.id }]"
            >
              <div class="brand-image-wrapper">
                <img 
                  v-if="brand.imageUrl" 
                  :src="brand.imageUrl" 
                  :alt="brand.name"
                  class="brand-image"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
                <div 
                  :class="['brand-placeholder', { 'hidden': brand.imageUrl && imageLoaded[brand.id] }]"
                >
                  <q-icon name="two_wheeler" size="32px" />
                </div>
              </div>
              <div class="brand-name">{{ brand.name }}</div>
              <div v-if="selectedBrand?.id === brand.id" class="selected-badge">
                <q-icon name="check" size="16px" />
              </div>
            </div>
          </div>

          <div v-if="selectedBrand" class="model-selector">
            <q-select
              v-model="selectedModelId"
              :options="modelOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              placeholder="Selecciona el modelo"
              outlined
              size="lg"
              class="model-select"
              @update:model-value="onModelSelected"
            />
          </div>
        </div>

        <!-- STEP 2: Quote Parameters -->
        <div v-if="step === 1" class="step-content">
          <div class="step-header">
            <h2 class="step-title">Detalles del crédito</h2>
            <p class="step-description">Completa la información para tu cotización</p>
          </div>

          <div class="selected-motorcycle-info">
            <div class="motorcycle-badge">
              <q-icon name="two_wheeler" size="20px" />
              <span>{{ selectedBrand?.name }} {{ selectedModel?.name }}</span>
            </div>
          </div>

          <div class="q-gutter-md form-fields">
            <div class="form-group">
              <label class="form-label">Precio de lista</label>
              <q-input
                v-model="formattedPrice"
                outlined
                size="lg"
                placeholder="Ingresa el precio"
                class="full-width-input"
              >
                <template v-slot:prepend>
                  <span class="currency-prefix">$</span>
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="form-label">Enganche</label>
              <q-input
                v-model="formattedDownPayment"
                outlined
                size="lg"
                placeholder="Ingresa el enganche"
                class="full-width-input"
              >
                <template v-slot:prepend>
                  <span class="currency-prefix">$</span>
                </template>
              </q-input>
              <p class="form-hint">Por defecto: 20% del precio de lista</p>
            </div>

            <div class="form-group">
              <label class="form-label">Plazo (meses)</label>
              <q-select
                v-model="quoteParams.term"
                :options="termOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                size="lg"
                placeholder="Selecciona el plazo"
                class="full-width-input"
                clearable
              />
            </div>

            <div class="form-group">
              <label class="form-label">Pago del seguro</label>
              <q-select
                v-model="quoteParams.insurancePaymentMethod"
                :options="insurancePaymentOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                size="lg"
                placeholder="Selecciona el método de pago"
                class="full-width-input"
              />
              <p class="form-hint">Elige cómo deseas pagar el seguro</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-row">
              <span class="summary-label">Financiamiento:</span>
              <span class="summary-value">{{ formatCurrency((quoteParams.price || 0) - (quoteParams.downPayment || 0)) }}</span>
            </div>
            <div class="summary-row" v-if="quoteParams.term">
              <span class="summary-label">Plazo:</span>
              <span class="summary-value">{{ quoteParams.term }} meses</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Pago del seguro:</span>
              <span class="summary-value">{{ quoteParams.insurancePaymentMethod }}</span>
            </div>
          </div>
        </div>

        <!-- STEP 3: Review & Offers -->
        <div v-if="step === 2" class="step-content">
          <div class="step-header">
            <h2 class="step-title">Ofertas disponibles</h2>
            <p class="step-description">Revisa las mejores opciones de financiamiento</p>
          </div>

          <div class="review-card">
            <div class="review-header">
              <div class="review-motorcycle">
                <q-icon name="two_wheeler" size="24px" />
                <div>
                  <div class="review-brand">{{ selectedBrand?.name }}</div>
                  <div class="review-model">{{ selectedModel?.name }}</div>
                </div>
              </div>
              <div class="review-price">
                <div class="price-label">Precio</div>
                <div class="price-value">{{ formatCurrency(quoteParams.price) }}</div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="loading-container">
            <q-spinner size="3rem" color="primary" />
            <p class="loading-text">Buscando las mejores ofertas...</p>
          </div>

          <div v-else-if="quotes.length > 0" class="offers-container">
            <BankQuotes 
              :quotes="quotes" 
              @selected="onOfferSelected" 
            />
          </div>

          <div v-else-if="!loading && quotes.length === 0" class="empty-state">
            <q-icon name="description" size="48px" class="empty-icon" />
            <p class="empty-text">No hay ofertas disponibles</p>
            <q-btn color="primary" size="lg" @click="fetchOffers" class="retry-button">
              Intentar de nuevo
            </q-btn>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="navigation-buttons">
          <q-btn
            v-if="step > 0"
            size="lg"
            outline
            color="primary"
            class="nav-button back-button"
            @click="goBack"
          >
            <q-icon name="arrow_back" class="q-mr-sm" />
            Anterior
          </q-btn>
          
          <q-btn
            v-if="step < 2"
            color="primary"
            size="lg"
            class="nav-button next-button"
            :disable="!canProceed"
            @click="goNext"
          >
            Continuar
            <q-icon name="arrow_forward" class="q-ml-sm" />
          </q-btn>

          <q-btn
            v-if="step === 2 && !loading && quotes.length === 0"
            color="primary"
            size="lg"
            class="nav-button fetch-button"
            :loading="loading"
            @click="fetchOffers"
          >
            Ver ofertas
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- Details Dialog -->
    <q-dialog
      v-model="showDetails"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="offer-details-modal">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalles de la oferta</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showDetails = false" />
        </q-card-section>

        <q-card-section class="offer-details">
          <div v-if="selectedOffer">
            <!-- Bank Header -->
            <div class="modal-bank-header">
              <div class="modal-bank-info">
                <img
                  v-if="selectedOffer.bank_logo"
                  :src="getBankLogoUrl(selectedOffer.bank_logo)"
                  :alt="selectedOffer.bank"
                  class="modal-bank-logo"
                  @error="handleModalImageError"
                />
                <div v-else class="modal-bank-logo-placeholder">
                  <q-icon name="account_balance" size="32px" />
                </div>
                <h3 class="modal-bank-name">{{ selectedOffer.bank || 'Banco' }}</h3>
              </div>
            </div>

            <!-- Main Quote Details -->
            <div class="modal-quote-section">
              <h4 class="modal-section-title">Resumen del crédito</h4>
              <div class="modal-details-grid">
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Pago mensual:</span>
                  <span class="modal-detail-value highlight">
                    {{ formatCurrency(selectedOffer.quote?.monthly_payment || selectedOffer.monthly || 0) }}
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Enganche:</span>
                  <span class="modal-detail-value">
                    {{ formatCurrency(selectedOffer.quote?.initial_payment || selectedOffer.down_payment || 0) }}
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Plazo:</span>
                  <span class="modal-detail-value">
                    {{ selectedOffer.quote?.loan_term_months || selectedOffer.term || quoteParams.term }} meses
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Tasa de interés:</span>
                  <span class="modal-detail-value">
                    {{ ((selectedOffer.quote?.apr || selectedOffer.apr || 0) * 100).toFixed(2) }}%
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Total a pagar:</span>
                  <span class="modal-detail-value">
                    {{ formatCurrency(selectedOffer.quote?.total_loan_amount || 0) }}
                  </span>
                </div>
                <div class="modal-detail-item" v-if="selectedOffer.quote?.fee">
                  <span class="modal-detail-label">Comisión por apertura:</span>
                  <span class="modal-detail-value">
                    {{ formatCurrency(selectedOffer.quote.fee) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Insurance Information -->
            <div v-if="selectedOffer.quote?.insurance_applied" class="modal-quote-section">
              <h4 class="modal-section-title">Seguro</h4>
              <div class="modal-details-grid">
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Seguro incluido:</span>
                  <span class="modal-detail-value">Sí</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Monto del seguro:</span>
                  <span class="modal-detail-value">
                    {{ formatCurrency(selectedOffer.quote.insurance_amount || 0) }}
                  </span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Método de pago:</span>
                  <span class="modal-detail-value">
                    {{ selectedOffer.quote.insurance_method || 'Financiado' }}
                  </span>
                </div>
                <div v-if="selectedOffer.quote.coverage_names?.length" class="modal-detail-item full-width">
                  <span class="modal-detail-label">Coberturas:</span>
                  <div class="coverage-tags">
                    <span
                      v-for="(coverage, idx) in selectedOffer.quote.coverage_names"
                      :key="idx"
                      class="coverage-tag"
                    >
                      {{ coverage }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Life/Unemployment Insurance -->
            <div v-if="selectedOffer.quote?.life_unemployment_insurance_amount > 0" class="modal-quote-section">
              <h4 class="modal-section-title">Seguro de Vida y Desempleo</h4>
              <div class="modal-details-grid">
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Monto:</span>
                  <span class="modal-detail-value">
                    {{ formatCurrency(selectedOffer.quote.life_unemployment_insurance_amount) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Motorcycle Info -->
            <div class="modal-quote-section">
              <h4 class="modal-section-title">Información de la motocicleta</h4>
              <div class="modal-details-grid">
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Marca:</span>
                  <span class="modal-detail-value">{{ selectedBrand?.name || 'N/A' }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Modelo:</span>
                  <span class="modal-detail-value">{{ selectedModel?.name || 'N/A' }}</span>
                </div>
                <div class="modal-detail-item">
                  <span class="modal-detail-label">Precio:</span>
                  <span class="modal-detail-value">{{ formatCurrency(quoteParams.price) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="modal-actions">
              <q-btn color="primary" size="lg" class="full-width" @click="showDetails = false">
                Cerrar
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMotorcycleStore } from '@/stores/motorcycleStore'
import { useQuasar } from 'quasar'
import BankQuotes from '@/components/BankQuotes.vue'

// Add Inter font from Google Fonts
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    }
  ]
})

const $q = useQuasar()

// Type definitions
interface Brand {
  id: string | number
  name: string
  imageUrl?: string
  slug?: string
}

interface Model {
  id: string | number
  name: string
  image?: string
}

interface Offer {
  id?: string | number
  bank: string
  monthly: number
  apr?: number
  term?: number
  down_payment?: number
  fee?: number
  bank_logo?: string
  quote?: {
    loan_term_months?: number
    monthly_payment?: number
    initial_payment?: number
    total_loan_amount?: number
    insurance_applied?: boolean
    insurance_amount?: number
    insurance_method?: string
    coverage_names?: string[]
    life_unemployment_insurance_amount?: number
    apr?: number
    fee?: number
  }
}

interface QuoteParams {
  price: number | null
  downPayment: number
  term: number | null
  insurancePaymentMethod: string
}

// Stores
const motorcycleStore = useMotorcycleStore()

// State
const step = ref(0)
const steps = [
  { title: 'Marca' },
  { title: 'Detalles' },
  { title: 'Ofertas' }
]

const brands = ref<Brand[]>([])
const brandSearch = ref('')
const selectedBrand = ref<Brand | null>(null)
const selectedModelId = ref<string | number | null>(null)
const models = ref<Model[]>([])
const loadingBrands = ref(false)
const loading = ref(false)
const offers = ref<Offer[]>([])
const quotes = ref<any[]>([])
const selectedOffer = ref<Offer | null>(null)
const showDetails = ref(false)
const imageLoaded = ref<Record<string | number, boolean>>({})

// Quote params
const quoteParams = ref<QuoteParams>({
  price: null,
  downPayment: 0,
  term: null,
  insurancePaymentMethod: 'Contado'
})

const termOptions = [
  { label: '12 meses', value: 12 },
  { label: '24 meses', value: 24 },
  { label: '36 meses', value: 36 },
  { label: '48 meses', value: 48 }
]

const insurancePaymentOptions = [
  { label: 'Contado', value: 'Contado' },
  { label: 'Financiado', value: 'Financiado' }
]

// Computed
const progress = computed(() => ((step.value + 1) / steps.length) * 100)

const visibleBrands = computed(() => {
  if (!brandSearch.value) return brands.value
  const query = brandSearch.value.toLowerCase()
  return brands.value.filter(b => b.name?.toLowerCase().includes(query))
})

const modelOptions = computed(() => 
  models.value.map(m => ({ label: m.name, value: m.id }))
)

const selectedModel = computed(() => 
  models.value.find(m => m.id === selectedModelId.value) || null
)

const canProceed = computed(() => {
  if (step.value === 0) {
    return selectedBrand.value !== null && selectedModelId.value !== null
  }
  if (step.value === 1) {
    return quoteParams.value.price !== null && 
           quoteParams.value.price > 0 &&
           quoteParams.value.term !== null
  }
  return true
})

const formattedPrice = computed({
  get: () => formatNumberWithCommas(quoteParams.value.price),
  set: (val) => {
    quoteParams.value.price = parseNumberFromFormatted(val)
  }
})

const formattedDownPayment = computed({
  get: () => formatNumberWithCommas(quoteParams.value.downPayment),
  set: (val) => {
    quoteParams.value.downPayment = parseNumberFromFormatted(val)
  }
})

// Methods
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatNumberWithCommas(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value)
  if (isNaN(numValue)) return ''
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue)
}

function parseNumberFromFormatted(value: string): number {
  if (!value) return 0
  const cleaned = value.replace(/[^\d]/g, '')
  return cleaned ? parseFloat(cleaned) : 0
}

// Brand logo mapping
const brandLogoMap: Record<string, string> = {
  'Yamaha': 'Yamaha-logo.png',
  'Suzuki': 'Suzuki-logo.png',
  'KTM': 'KTM-logo.png',
  'CF Moto': 'CF Moto-logo.png',
  'QJ Motor': 'QJ Motor-logo.png',
  'TVS': 'TVS-logo.png',
  'Honda': 'Honda-logo.png',
  'Kawasaki': 'Kawasaki-logo.png',
  'Ducati': 'Ducati-logo.png',
  'Triumph': 'Triumph-logo.png',
}

function getBrandLogoUrl(brandName: string): string | undefined {
  if (!brandName) return undefined
  
  const exactMatch = brandLogoMap[brandName]
  if (exactMatch) {
    return `/assets/${exactMatch}`
  }
  
  const brandKey = Object.keys(brandLogoMap).find(
    key => key.toLowerCase() === brandName.toLowerCase()
  )
  if (brandKey) {
    return `/assets/${brandLogoMap[brandKey]}`
  }
  
  const normalizedName = brandName
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return `/assets/${normalizedName}-logo.png`
}

async function loadBrands() {
  loadingBrands.value = true
  try {
    await motorcycleStore.fetchMotorcycles()
    const uniqueBrands = new Map<string | number, Brand>()
    motorcycleStore.motorcycles.forEach((moto: any) => {
      if (moto.brand && !uniqueBrands.has(moto.brand)) {
        uniqueBrands.set(moto.brand, {
          id: moto.brand,
          name: moto.brand,
          imageUrl: getBrandLogoUrl(moto.brand)
        })
      }
    })
    brands.value = Array.from(uniqueBrands.values())
  } catch (error) {
    console.error('Error loading brands:', error)
    brands.value = []
  } finally {
    loadingBrands.value = false
  }
}

function onBrandSearch() {
  // Filter is handled by visibleBrands computed
}

function selectBrand(brand: Brand) {
  selectedBrand.value = brand
  const brandMotorcycles = motorcycleStore.motorcycles.filter(
    (moto: any) => moto.brand === brand.name
  )
  const uniqueModels = new Map<string | number, Model>()
  brandMotorcycles.forEach((moto: any) => {
    if (moto.model && !uniqueModels.has(moto.model)) {
      uniqueModels.set(moto.model, {
        id: moto.id,
        name: moto.model,
        image: undefined
      })
    }
  })
  models.value = Array.from(uniqueModels.values())
}

function onModelSelected(modelId: string | number) {
  selectedModelId.value = modelId
  const motorcycle = motorcycleStore.motorcycles.find((m: any) => m.id === modelId) as any
  if (motorcycle && motorcycle.price) {
    const price = parseFloat(String(motorcycle.price)) || null
    quoteParams.value.price = price
    if (price) {
      quoteParams.value.downPayment = Math.round(price * 0.2)
    }
  }
}

watch(() => quoteParams.value.price, (newPrice, oldPrice) => {
  if (newPrice && oldPrice === null) {
    quoteParams.value.downPayment = Math.round(newPrice * 0.2)
  }
})

function goNext() {
  if (step.value === 0 && canProceed.value) {
    step.value = 1
  } else if (step.value === 1 && canProceed.value) {
    step.value = 2
    fetchOffers()
  }
}

function goBack() {
  if (step.value > 0) {
    step.value--
  }
}

async function fetchOffers() {
  if (!selectedModelId.value || !quoteParams.value.price || !quoteParams.value.term) {
    return
  }

  loading.value = true
  try {
    const motorcycleData = {
      motorcycle_id: selectedModelId.value,
      loan_term_months: quoteParams.value.term,
      down_payment_amount: (quoteParams.value.downPayment || 0) / (quoteParams.value.price || 1),
      paquete: '1',
      insurance_payment_method: quoteParams.value.insurancePaymentMethod || 'Contado'
    }

    const response = await motorcycleStore.fetchQuotes(motorcycleData)
    
    if (response.quotes && Array.isArray(response.quotes)) {
      quotes.value = response.quotes
      offers.value = response.quotes.map((quote: any) => ({
        id: quote.bank || Math.random(),
        bank: quote.bank || 'Banco',
        monthly: quote.quote?.monthly_payment || 0,
        apr: quote.quote?.apr || 0,
        term: quoteParams.value.term,
        down_payment: quoteParams.value.downPayment,
        fee: quote.quote?.fee || 0,
        bank_logo: quote.bank_logo
      }))
    } else {
      quotes.value = []
      offers.value = []
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
    offers.value = []
  } finally {
    loading.value = false
  }
}

function onOfferSelected(quote: any) {
  selectedOffer.value = quote
  showDetails.value = true
}

function getBankLogoUrl(bankLogoDomain: string) {
  if (!bankLogoDomain) return ''
  return `https://logo.clearbit.com/${bankLogoDomain}`
}

function handleModalImageError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
  }
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
    const brandCard = target.closest('.brand-card')
    if (brandCard) {
      const brandId = brandCard.getAttribute('data-brand-id')
      if (brandId) {
        imageLoaded.value[brandId] = false
      }
    }
  }
}

function handleImageLoad(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    const brandCard = target.closest('.brand-card')
    if (brandCard) {
      const brandId = brandCard.getAttribute('data-brand-id')
      if (brandId) {
        imageLoaded.value[brandId] = true
      }
    }
  }
}

// Lifecycle
onMounted(() => {
  loadBrands()
})
</script>

<style scoped>
/* Inter Font - Global */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

.quote-generator-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 1rem;
  padding-bottom: 2rem;
}

/* Header */
.quote-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
}

.quote-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.quote-subtitle {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

/* Progress Indicator */
.progress-wrapper {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2FFF96 0%, #26e085 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: #26e085;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  text-align: center;
}

.progress-step.active .step-label {
  color: #26e085;
  font-weight: 600;
}

/* Main Card */
.main-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* Step Content */
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  margin-bottom: 1.5rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.step-description {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

/* Search Input */
.search-input {
  margin-bottom: 1.5rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 0.9375rem;
}

/* Brands Grid */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .brands-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .brands-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.brand-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 100px;
}

.brand-card:active {
  transform: scale(0.95);
}

.brand-card.selected {
  border-color: #26e085;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.1) 0%, rgba(38, 224, 133, 0.1) 100%);
  box-shadow: 0 4px 12px rgba(38, 224, 133, 0.2);
}

.brand-image-wrapper {
  width: 100%;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.brand-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.2s ease;
}

.brand-placeholder {
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.brand-placeholder.hidden {
  display: none;
}

.brand-card.selected .brand-image {
  filter: brightness(1.1);
}

.brand-card.selected .brand-placeholder {
  color: #26e085;
}

.brand-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.2;
}

.selected-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: #26e085;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
}

/* Model Selector */
.model-selector {
  margin-top: 1rem;
}

.model-select {
  width: 100%;
}

/* Selected Motorcycle Info */
.selected-motorcycle-info {
  margin-bottom: 1.5rem;
}

.motorcycle-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.1) 0%, rgba(38, 224, 133, 0.1) 100%);
  border: 2px solid #26e085;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #26e085;
  font-weight: 600;
  font-size: 0.9375rem;
}

/* Form Fields */
.form-fields {
  width: 100%;
}

.form-group {
  width: 100%;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-style: italic;
}

.full-width-input {
  width: 100%;
}

.currency-prefix {
  color: #6b7280;
  font-weight: 500;
}

/* Summary Card */
.summary-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-top: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 700;
}

/* Review Card */
.review-card {
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.05) 0%, rgba(38, 224, 133, 0.05) 100%);
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.review-motorcycle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.review-brand {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.review-model {
  font-size: 1.125rem;
  color: #1a1a1a;
  font-weight: 700;
}

.review-price {
  text-align: right;
}

.price-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.price-value {
  font-size: 1.25rem;
  color: #26e085;
  font-weight: 800;
}

/* Offers Container */
.offers-container {
  margin-top: 1.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
  text-align: center;
}

.empty-icon {
  color: #d1d5db;
}

.empty-text {
  color: #6b7280;
  font-size: 0.9375rem;
}

.retry-button {
  margin-top: 0.5rem;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.nav-button {
  flex: 1;
  height: 3rem;
  font-weight: 600;
  border-radius: 0.75rem;
  font-size: 1rem;
}

/* Modal */
.offer-details {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0.5rem;
}

.modal-bank-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.modal-bank-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-bank-logo {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
  border-radius: 0.5rem;
  background: #f9fafb;
  padding: 0.5rem;
}

.modal-bank-logo-placeholder {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
  color: #9ca3af;
}

.modal-bank-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.modal-quote-section {
  margin-bottom: 1.5rem;
}

.modal-section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .modal-details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.modal-detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-detail-item.full-width {
  grid-column: 1 / -1;
}

.modal-detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.modal-detail-value {
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 600;
}

.modal-detail-value.highlight {
  font-size: 1.5rem;
  color: #26e085;
  font-weight: 700;
}

.coverage-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.coverage-tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.1) 0%, rgba(38, 224, 133, 0.1) 100%);
  border: 1px solid rgba(38, 224, 133, 0.2);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #26e085;
  font-weight: 500;
}

.modal-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

/* Responsive */
@media (min-width: 768px) {
  .quote-generator-container {
    padding: 2rem;
    max-width: 48rem;
    margin: 0 auto;
  }

  .quote-title {
    font-size: 2.25rem;
  }

  .quote-subtitle {
    font-size: 1.125rem;
  }

  .brands-grid {
    gap: 1.25rem;
  }

  .brand-card {
    min-height: 120px;
    padding: 1.25rem 1rem;
  }
}

@media (min-width: 1024px) {
  .quote-generator-container {
    max-width: 64rem;
  }
}

/* Touch optimizations */
@media (hover: none) and (pointer: coarse) {
  .brand-card:hover {
    transform: none;
  }

  .brand-card:active {
    transform: scale(0.95);
  }
}
</style>
