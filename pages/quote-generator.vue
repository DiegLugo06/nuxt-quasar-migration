<template>
  <div class="quote-generator-container">
    <!-- Process Stepper for onCreditWeb flow -->
    <ProcessStepper v-if="flowProcessStore.flowProcess === 'onCreditWeb'" />
    

    <!-- Enhanced Progress indicator (only show if not using ProcessStepper) -->
    <div v-if="flowProcessStore.flowProcess !== 'onCreditWeb'" class="progress-wrapper">
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }">
            <div class="progress-shine"></div>
          </div>
        </div>
      </div>
      <div class="progress-steps">
        <div 
          v-for="(s, i) in steps" 
          :key="i"
          :class="['progress-step', { active: step >= i, completed: step > i }]"
        >
          <div class="step-number-wrapper">
            <div class="step-number">{{ i + 1 }}</div>
            <div class="step-check" v-if="step > i">
              <q-icon name="check" />
            </div>
          </div>
          <div class="step-label">{{ s.title }}</div>
        </div>
      </div>
    </div>

    <!-- Main content card with enhanced design -->
    <q-card class="main-card" flat>
      <!-- Elegant Progress Bar at the top -->
      <div class="elegant-progress-container">
        <div class="progress-track-wrapper">
          <div class="progress-line-bg">
            <div class="progress-fill-line" :style="{ width: `${progress}%` }"></div>
          </div>

          <div class="steps-overlay">
            <div 
              v-for="(s, i) in steps" 
              :key="i"
              class="step-node-wrapper"
            >
              <div
                :class="['step-node', { 'is-active': step === i, 'is-completed': step > i }]"
              >
                <div class="node-content">
                  <q-icon v-if="step > i" name="check" size="14px" />
                  <span v-else>{{ i + 1 }}</span>
                </div>
              </div>
              <div class="step-label">
                {{ getStepLabel(i + 1) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-card-section>
        <!-- STEP 1: Brand Selection -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="step === 0" class="step-content" key="step-0">

            <div v-if="loadingBrands" class="loading-container">
              <div class="loading-spinner-wrapper">
                <q-spinner size="3.5rem" color="primary" />
                <div class="spinner-ripple"></div>
              </div>
              <p class="loading-text">Cargando marcas...</p>
            </div>

            <div v-else class="brands-grid">
              <div v-if="!selectedBrand" class="brand-selection-hint">
                <q-icon name="touch_app" size="24px" class="hint-icon" />
                <p class="hint-text">Toca una marca para continuar</p>
              </div>
              <transition-group name="brand-list" tag="div" class="brands-grid-inner">
                <div
                  v-for="(brand, index) in visibleBrands"
                  :key="brand.id"
                  :data-brand-id="brand.id"
                  @click="selectBrand(brand)"
                  :class="['brand-card', { selected: selectedBrand?.id === brand.id }]"
                  :style="{ 'animation-delay': `${index * 0.05}s` }"
                >
                  <div class="brand-card-inner">
                    <div class="brand-image-wrapper">
                      <div class="brand-image-backdrop"></div>
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
                        <q-icon name="two_wheeler" size="40px" />
                      </div>
                    </div>
                    <div class="brand-name">{{ brand.name }}</div>
                    <div v-if="selectedBrand?.id === brand.id" class="selected-badge">
                      <q-icon name="check" size="18px" />
                    </div>
                    <div class="brand-card-glow"></div>
                  </div>
                </div>
              </transition-group>
            </div>

            <transition name="slide-up">
              <div v-if="selectedBrand" class="model-selector">
                <q-select
                  v-model="selectedModelId"
                  :options="filteredModelOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  placeholder="Selecciona el modelo"
                  outlined
                  size="lg"
                  class="model-select enhanced-input"
                  use-input
                  :readonly="!!selectedModelId"
                  input-debounce="300"
                  @filter="filterModels"
                  @update:model-value="onModelSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="two_wheeler" size="20px" class="input-icon" />
                  </template>
                  <template v-if="selectedModelId" v-slot:append>
                    <q-icon name="check_circle" size="20px" color="primary" />
                  </template>
                </q-select>
              </div>
            </transition>
          </div>
        </transition>

        <!-- STEP 2: Quote Parameters -->
          <div v-if="step === 1" class="step-content step-2-content" key="step-1">


            <div class="form-fields">
              <div class="form-group half-width">
                <label class="form-label">Precio de lista</label>
                <q-input
                  v-model="formattedPrice"
                  outlined
                  size="md"
                  placeholder="Ingresa el precio"
                  class="full-width-input enhanced-input step-2-input"
                  :rules="[val => val && parseNumberFromFormatted(val) > 0 || 'Ingresa un precio válido']"
                >
                  <template v-slot:prepend>
                    <span class="currency-prefix">$</span>
                  </template>
                </q-input>
              </div>

              <div class="form-group half-width">
                <label class="form-label">Enganche</label>
                <q-input
                  v-model="formattedDownPayment"
                  outlined
                  size="md"
                  placeholder="Ingresa el enganche"
                  class="full-width-input enhanced-input step-2-input"
                >
                  <template v-slot:prepend>
                    <span class="currency-prefix">$</span>
                  </template>
                </q-input>
                <p class="form-hint">
                  Por defecto: 20% del precio de lista
                </p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Plazo (meses)
                </label>
                <q-select
                  v-model="quoteParams.term"
                  :options="termOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  size="md"
                  placeholder="Selecciona el plazo"
                  class="full-width-input enhanced-input step-2-input"
                  clearable
                >
                </q-select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Pago del seguro
                </label>
                <q-select
                  v-model="quoteParams.insurancePaymentMethod"
                  :options="insurancePaymentOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  size="md"
                  placeholder="Selecciona el método de pago"
                  class="full-width-input enhanced-input step-2-input"
                >
                </q-select>
                <p class="form-hint">
                  Elige cómo deseas pagar el seguro
                </p>
              </div>
            </div>
          </div>

        <!-- STEP 3: Review & Offers -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="step === 2" class="step-content" key="step-2">

            <div v-if="loading" class="loading-container">
              <div class="loading-spinner-wrapper">
                <q-spinner size="3.5rem" color="primary" />
                <div class="spinner-ripple"></div>
              </div>
              <p class="loading-text">Buscando las mejores ofertas...</p>
              <p class="loading-subtext">Esto puede tomar unos segundos</p>
            </div>

            <template v-else>
              <transition name="fade">
                <div v-if="quotes.length > 0" class="offers-container">
                  <BankQuotes 
                    :quotes="quotes" 
                    @quote-card-clicked="handleQuoteCardClick"
                  />
                </div>
              </transition>

              <transition name="fade">
                <div v-if="quotes.length === 0" class="empty-state">
                <div class="empty-icon-wrapper">
                  <q-icon name="description" size="64px" class="empty-icon" />
                </div>
                <h3 class="empty-title">No hay ofertas disponibles</h3>
                <p class="empty-text">Intenta ajustar los parámetros de tu cotización</p>
                <q-btn 
                  color="primary" 
                  size="lg" 
                  @click="() => fetchOffers(false)" 
                  class="retry-button"
                  unelevated
                >
                  <q-icon name="refresh" class="q-mr-sm" />
                  Intentar de nuevo
                </q-btn>
              </div>
              </transition>

              <!-- Phone and Email Collection for onCreditWeb flow - Moved to step 3 after quotes -->
              <transition name="fade">
                <div v-if="flowProcessStore.flowProcess === 'onCreditWeb' && quotes.length > 0 && !loading" class="contact-info-section">
                  <h3 class="contact-section-title">Información de contacto</h3>
                  
                  <div class="contact-form-fields">
                    <div class="contact-form-group">
                      <label class="contact-form-label">Celular (WhatsApp)</label>
                      <q-input
                        v-model="phoneComputed"
                        outlined
                        size="md"
                        placeholder="(55) 1234 5678"
                        class="contact-input"
                        mask="(##) #### ####"
                        type="tel"
                        :rules="[
                          (val) => !!val || 'El celular es obligatorio',
                          (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
                        ]"
                      />
                    </div>

                    <div class="contact-form-group">
                      <label class="contact-form-label">Correo electrónico</label>
                      <q-input
                        v-model="clientStore.client.email"
                        outlined
                        size="md"
                        placeholder="correo@ejemplo.com"
                        class="contact-input"
                        type="email"
                        :rules="[
                          (val) => !!val || 'El correo es obligatorio',
                          (val) => /.+@.+\..+/.test(val) || 'Correo no válido',
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </transition>
            </template>
          </div>
        </transition>

        <!-- Enhanced Navigation buttons -->
        <div class="navigation-buttons">
          <transition name="slide-right">
            <q-btn
              v-if="step > 0"
              size="lg"
              outline
              color="primary"
              class="nav-button back-button"
              @click="goBack"
              unelevated
            >
              <q-icon name="arrow_back" class="q-mr-sm" />
              Anterior
            </q-btn>
          </transition>
          
          <transition name="slide-left">
            <q-btn
              v-if="step < 2"
              color="primary"
              size="lg"
              class="nav-button next-button"
              :disable="!canProceed"
              @click="goNext"
              unelevated
            >
              Continuar
              <q-icon name="arrow_forward" class="q-ml-sm" />
            </q-btn>
          </transition>

          <transition name="fade">
            <q-btn
              v-if="step === 2 && !loading && quotes.length === 0"
              color="primary"
              size="lg"
              class="nav-button fetch-button"
              :loading="loading"
              @click="() => fetchOffers(false)"
              unelevated
            >
              <q-icon name="search" class="q-mr-sm" />
              Ver ofertas
            </q-btn>
          </transition>

          <transition name="fade">
            <q-btn
              v-if="step === 2 && !loading && quotes.length > 0 && flowProcessStore.flowProcess !== 'onCreditWeb'"
              color="primary"
              size="lg"
              class="nav-button continue-button"
              @click="continueToStoreSelection"
              unelevated
            >
              Continuar con el proceso
              <q-icon name="arrow_forward" class="q-ml-sm" />
            </q-btn>
          </transition>

          <!-- Send quotes button for onCreditWeb flow -->
          <transition name="fade">
            <q-btn
              v-if="step === 2 && !loading && quotes.length > 0 && flowProcessStore.flowProcess === 'onCreditWeb'"
              color="primary"
              size="lg"
              class="nav-button send-quotes-button"
              @click="confirmEmailNotification"
              :disable="!clientStore.client.email || !clientStore.client.phone || !/.+@.+\..+/.test(clientStore.client.email) || sendingQuotes"
              :loading="sendingQuotes"
              unelevated
            >
              Continuar
            </q-btn>
          </transition>
        </div>
      </q-card-section>
    </q-card>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMotorcycleStore } from '@/stores/motorcycleStore'
import { useFlowProcessStore } from '@/stores/flowProcessStore'
import { useClientStore } from '@/stores/clientStore'
import { useSolicitudStore } from '@/stores/solicitudStore'
import { useUserStore } from '@/stores/userStore'
import { useReportStore } from '@/stores/reportStore'
import { useQuasar } from 'quasar'
import BankQuotes from '@/components/BankQuotes.vue'
import ProcessStepper from '@/components/ProcessStepper.vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useRouter, useRoute } from 'vue-router'
import { useErrorHandling } from '~/composables/useErrorHandling'
import { useCookie } from '#app'

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
  invoice_motorcycle_value: number | null
  downPayment: number
  term: number | null
  insurancePaymentMethod: string
}

// Stores
const motorcycleStore = useMotorcycleStore()
const solicitudStore = useSolicitudStore()
const flowProcessStore = useFlowProcessStore()
const clientStore = useClientStore()
const userStore = useUserStore()
const reportStore = useReportStore()

// Initialize piniaStores object (matching original pattern)
const piniaStores = {
  user: useUserStore(),
  solicitud: useSolicitudStore(),
  flow: useFlowProcessStore(),
  client: useClientStore(),
  motorcycle: useMotorcycleStore(),
  report: useReportStore(),
}

const route = useRoute()
const router = useRouter()
const { notifySentry } = useErrorHandling()

// Get next step from flow store
const { nextStep } = flowProcessStore.getPreviousAndNextStep(route.name || 'quote-generator') || { nextStep: 'confirm-store' }

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
const sendingQuotes = ref(false)
const offers = ref<Offer[]>([])
const quotes = ref<any[]>([])
const imageLoaded = ref<Record<string | number, boolean>>({})

// Quote params
const quoteParams = ref<QuoteParams>({
  invoice_motorcycle_value: null,
  downPayment: 0,
  term: null,
  insurancePaymentMethod: 'Contado'
})

const termOptions = [
  { label: '12 meses', value: 12 },
  { label: '24 meses', value: 24 },
  { label: '36 meses', value: 36 },
  { label: '48 meses', value: 48 },
  { label: '60 meses', value: 60 }
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

const filteredModelOptions = ref<Array<{ label: string; value: string | number }>>([])

watch(() => models.value, (newModels) => {
  const options = newModels.map(m => ({ label: m.name, value: m.id }))
  filteredModelOptions.value = options
}, { immediate: true })

function filterModels(val: string, update: (callback: () => void) => void) {
  // Only allow filtering if no model is selected
  if (selectedModelId.value) {
    return
  }
  
  update(() => {
    if (val === '') {
      filteredModelOptions.value = models.value.map(m => ({ label: m.name, value: m.id }))
    } else {
      const needle = val.toLowerCase()
      filteredModelOptions.value = models.value
        .map(m => ({ label: m.name, value: m.id }))
        .filter(v => v.label.toLowerCase().indexOf(needle) > -1)
    }
  })
}

const selectedModel = computed(() => 
  models.value.find(m => m.id === selectedModelId.value) || null
)

const canProceed = computed(() => {
  if (step.value === 0) {
    return selectedBrand.value !== null && selectedModelId.value !== null
  }
  if (step.value === 1) {
    const hasQuoteParams = quoteParams.value.invoice_motorcycle_value !== null && 
           quoteParams.value.invoice_motorcycle_value > 0 &&
           quoteParams.value.term !== null
    
    return hasQuoteParams
  }
  return true
})

const formattedPrice = computed({
  get: () => formatNumberWithCommas(quoteParams.value.invoice_motorcycle_value),
  set: (val) => {
    quoteParams.value.invoice_motorcycle_value = parseNumberFromFormatted(val)
  }
})

const formattedDownPayment = computed({
  get: () => formatNumberWithCommas(quoteParams.value.downPayment),
  set: (val) => {
    quoteParams.value.downPayment = parseNumberFromFormatted(val)
  }
})

// Phone computed property for formatting
const phoneComputed = computed({
  get() {
    if (!clientStore.client.phone) return ''
    return clientStore.client.phone
      .replace("+52", "")
      .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2 $3");
  },
  set(value) {
    clientStore.client.phone = `+52${value.replace(/\D/g, "")}`;
  },
})

// Computed property to check for missing fields
const missingFields = computed(() => {
  const fieldLabels = {
    phone: "Celular",
    email: "Correo",
  };

  // Get missing field labels instead of keys
  return Object.entries(fieldLabels)
    .filter(([key]) => {
      if (key === "phone") {
        return !piniaStores.client.client.phone;
      }
      return !piniaStores.client.client[key];
    })
    .map(([_, label]) => label);
});

// Computed properties for validation states
const isPhoneValid = computed(() => {
  const phone = phoneComputed.value
  return phone && phone.length === 14
})

const isEmailValid = computed(() => {
  const email = clientStore.client.email
  return email && /.+@.+\..+/.test(email)
})

// Get step label for display below step node
function getStepLabel(stepNumber: number): string {
  const labels: Record<number, string> = {
    1: "Elige",
    2: "Detalles",
    3: "Cotiza"
  }
  return labels[stepNumber] || ""
}

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


async function loadBrands() {
  loadingBrands.value = true
  try {
    await motorcycleStore.fetchMotorcycles()
    const uniqueBrands = new Map<string | number, Brand>()

    const config = useRuntimeConfig()

    console.log('Config:', config.public)
    console.log('SUPABASE_PROJECT_ID:', config.public.SUPABASE_PROJECT_ID)

    motorcycleStore.motorcycles.forEach((moto: any) => {
      if (moto.brand && !uniqueBrands.has(moto.brand)) {
        // normalize brand name for filename 
        const normalizeBrandName = (name: string): string => {
          if (!name) return 'unknown'
          return name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-\._]/g, '')
          .replace(/-+/g, '-')
          .trim()
        }
        const normalizedBrandName = normalizeBrandName(moto.brand)

        // Construct supabase URL 
        const supabaseProjectId = config.public.SUPABASE_PROJECT_ID
        let imageUrl : string | undefined = undefined

        if (supabaseProjectId) {
          imageUrl = `https://${supabaseProjectId}.supabase.co/storage/v1/object/public/marketplace-assets/brands/${normalizedBrandName}.png`
          
          console.log (`Brand: ${moto.brand} - Image URL: ${imageUrl}`)
        } else {
          console.log (`Brand: ${moto.brand} - No image URL found`)
        }

        uniqueBrands.set(moto.brand, {
          id: moto.brand,
          name: moto.brand,
          imageUrl: imageUrl
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
    const invoiceValue = parseFloat(String(motorcycle.price)) || null
    quoteParams.value.invoice_motorcycle_value = invoiceValue
    if (invoiceValue) {
      quoteParams.value.downPayment = Math.round(invoiceValue * 0.2)
    }
  }
}

watch(() => quoteParams.value.invoice_motorcycle_value, (newValue, oldValue) => {
  if (newValue && oldValue === null) {
    quoteParams.value.downPayment = Math.round(newValue * 0.2)
  }
})

function goNext() {
  if (step.value === 0 && canProceed.value) {
    step.value = 1
  } else if (step.value === 1 && canProceed.value) {
    step.value = 2
    fetchOffers(false)
  }
}

function goBack() {
  if (step.value > 0) {
    step.value--
  }
}

async function fetchOffers(notification = false) {
  if (!selectedModelId.value || !quoteParams.value.invoice_motorcycle_value || !quoteParams.value.term) {
    return
  }

  loading.value = true
  try {
    const motorcycleData: any = {
      motorcycle_id: selectedModelId.value,
      loan_term_months: quoteParams.value.term,
      down_payment_amount: (quoteParams.value.downPayment || 0) / (quoteParams.value.invoice_motorcycle_value || 1),
      paquete: '1',
      insurance_payment_method: quoteParams.value.insurancePaymentMethod || 'Contado'
    }

    // Add notification data if requested
    if (notification) {
      if (!piniaStores.client?.client?.email || !piniaStores.client?.client?.phone) {
        $q.notify({
          type: 'negative',
          message: 'El correo y el teléfono del cliente es requerido para notificaciones',
          position: 'top'
        })
        throw new Error('The client email and phone are required for notifications')
      }

      Object.assign(motorcycleData, {
        send_notification: true,
        client_email: piniaStores.client.client.email,
        client_phone: piniaStores.client.client.phone.replace("+52", "+521"),
        motorcycle_id: selectedModelId.value,
      })
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
  } catch (error: any) {
    console.error('Error fetching offers:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al obtener cotizaciones',
      position: 'top'
    })
    offers.value = []
  } finally {
    loading.value = false
  }
}

// Alias for calculateQuotes (matching original naming)
const calculateQuotes = fetchOffers

// Function to send notifications only (without fetching quotes again)
async function sendNotificationsOnly() {
  if (!selectedModelId.value || !quoteParams.value.invoice_motorcycle_value || !quoteParams.value.term) {
    return
  }

  if (!piniaStores.client?.client?.email || !piniaStores.client?.client?.phone) {
    $q.notify({
      type: 'negative',
      message: 'El correo y el teléfono del cliente es requerido para notificaciones',
      position: 'top'
    })
    throw new Error('The client email and phone are required for notifications')
  }

  try {
    const motorcycleData: any = {
      motorcycle_id: selectedModelId.value,
      loan_term_months: quoteParams.value.term,
      down_payment_amount: (quoteParams.value.downPayment || 0) / (quoteParams.value.invoice_motorcycle_value || 1),
      paquete: '1',
      insurance_payment_method: quoteParams.value.insurancePaymentMethod || 'Contado',
      send_notification: true,
      client_email: piniaStores.client.client.email,
      client_phone: piniaStores.client.client.phone.replace("+52", "+521"),
    }

    // Call the API to send notifications (this will use existing quotes if available)
    await motorcycleStore.fetchQuotes(motorcycleData)
  } catch (error: any) {
    console.error('Error sending notifications:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al enviar notificaciones',
      position: 'top'
    })
    throw error
  }
}

function handleQuoteCardClick(quote: any) {
  // Scroll to contact form section when quotes are clicked
  if (flowProcessStore.flowProcess === 'onCreditWeb' && step.value === 2) {
    setTimeout(() => {
      const contactSection = document.querySelector('.contact-info-section')
      if (contactSection) {
        contactSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        // Add a subtle highlight effect
        contactSection.classList.add('highlight-contact')
        setTimeout(() => {
          contactSection.classList.remove('highlight-contact')
        }, 2000)
      }
    }, 100)
  }
}


function continueToStoreSelection() {
  // Save quote params to solicitud store
  solicitudStore.setQuoteParams(quoteParams.value)
  
  // Navigate to store selection page
  router.push('/confirm-store')
}

// Confirm email notification and register client
const confirmEmailNotification = async () => {
  // Check for missing fields first
  if (missingFields.value.length > 0) {
    $q.notify({
      type: 'negative',
      message: `Por favor, completa los siguientes campos: ${missingFields.value.join(", ")}`,
      position: 'top'
    })
    return
  }

  sendingQuotes.value = true

  // Validate email format
  const emailRegex = /.+@.+\..+/
  if (!emailRegex.test(piniaStores.client.client.email)) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, ingresa un correo electrónico válido',
      position: 'top'
    })
    return
  }

  // Validate phone number length
  const phoneNumber = piniaStores.client.client.phone.replace("+52", "")
  if (phoneNumber.length !== 10) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, ingresa un número de teléfono válido de 10 dígitos',
      position: 'top'
    })
    return
  }

  try {
    // Send notifications only (quotes should already be fetched)
    // If quotes are not available, fetch them with notifications
    if (quotes.value.length > 0) {
      await sendNotificationsOnly()
    } else {
      // If quotes are not available, fetch them with notifications
      await calculateQuotes(true)
    }

    // Check if client exists before registering as unknown
    try {
      const { validatePhoneAndEmail, getClient } = piniaStores.client
      const { status, type, clue } = await validatePhoneAndEmail()

      if (status === "validated") {
        // Client exists, get their data
        const validation = await getClient()
        const { client_id, report, id, has_purchases } = validation

        if (client_id) {
          // Only update report store if we have new report data
          if (report) {
            piniaStores.report.report.id = report
          }

          if (piniaStores.flow.flowProcess == "onCreditWeb") {
            try {
              const userId = await piniaStores.user.getNextFinvaUserAssigned()
              piniaStores.solicitud.solicitud.finva_user_id = userId
            } catch (error: any) {
              console.error('Error getting next finva user assigned:', error)
              notifySentry(error, {
                pageName: "quote-generator",
                additionalContext: {
                  operation: "getNextFinvaUserAssigned",
                  response: error.response?.data,
                  status: error.response?.status,
                  url: error.config?.url,
                  clientPhone: piniaStores.client.client.phone,
                  clientEmail: piniaStores.client.client.email,
                  storeId: piniaStores.solicitud.solicitud.preferred_store_id,
                },
              })
            }
          }
          // Continue with the flow for existing client
          sendingQuotes.value = false
          $q.dialog({
            title: "Oferta Personalizada",
            message: `
            <div class="text-body1">
              ¿Quieres que te hagamos una Oferta de crédito personalizada?
            </div>
            `,
            html: true,
            ok: {
              label: "Sí, continuar",
              color: "primary",
              class: "custom-modal-button",
            },
            persistent: true,
          }).onOk(() => {
            router.push({ name: nextStep || 'confirm-store' })
          })
          return
        }
      }
    } catch (validationError) {
      // Client doesn't exist (404) or validation failed, continue with unknown client registration
      console.log("Client validation failed, proceeding with unknown client registration:", validationError)
    }

    // Client is unknown, proceed with registration
    let userId: number | null = null
    if (piniaStores.flow.flowProcess == "onCreditWeb") {
      try {
        if (
          !piniaStores.user.finvaAgent.id ||
          piniaStores.user.finvaAgent.id === 6
        ) {
          userId = await piniaStores.user.getNextFinvaUserAssigned()
        } else {
          userId = piniaStores.user.finvaAgent.id
        }
        const finvaUserIdCookie = useCookie("finvaUserId", {
          default: () => null,
          maxAge: 60 * 60 * 24 * 365, // 1 year
        })
        finvaUserIdCookie.value = userId
        piniaStores.solicitud.solicitud.finva_user_id = userId
        if (!piniaStores.user.user.id || piniaStores.user.user.id === 6) {
          piniaStores.user.registration_mode = "autoassigned"
          piniaStores.solicitud.solicitud.registration_mode =
            piniaStores.user.registration_mode
        } else {
          piniaStores.solicitud.solicitud.registration_mode =
            piniaStores.user.registration_mode
        }
      } catch (error: any) {
        console.error('Error getting finva user:', error)
        notifySentry(error, {
          pageName: "quote-generator",
          additionalContext: {
            operation: "getNextFinvaUserAssigned",
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            clientPhone: piniaStores.client.client.phone,
            clientEmail: piniaStores.client.client.email,
            storeId: piniaStores.solicitud.solicitud.preferred_store_id,
          },
        })
      }
    } else {
      userId = piniaStores.user.user.id
    }

    const motorcycleId =
      selectedModelId.value ||
      motorcycleStore.motorcycleId ||
      motorcycleStore.motorcycles.find((m: any) => 
        m.brand === selectedBrand.value?.name && m.model === selectedModel.value?.name
      )?.id

    const motorcycleData = {
      loan_term_months: quoteParams.value.term,
      down_payment_amount: (quoteParams.value.downPayment || 0) / (quoteParams.value.invoice_motorcycle_value || 1),
      motorcycle_id: motorcycleId,
      paquete: "1",
      insurance_payment_method: quoteParams.value.insurancePaymentMethod || 'Contado',
    }

    // Register unknown client
    await piniaStores.client.registerUnknownClient(
      piniaStores.flow.flowProcess,
      userId,
      motorcycleId,
      motorcycleData,
      piniaStores.flow.holdingStorePage,
      piniaStores.solicitud.solicitud.utm_source,
      piniaStores.solicitud.solicitud.utm_medium,
      piniaStores.solicitud.solicitud.utm_campaign,
      piniaStores.solicitud.solicitud.utm_content,
      piniaStores.solicitud.solicitud.utm_term,
      piniaStores.solicitud.solicitud.other_url_params
    )

    // Then show the personalized offer dialog
    sendingQuotes.value = false
    $q.dialog({
      title: "Oferta Personalizada",
      message: `
      <div class="text-body1">
        ¿Quieres que te hagamos una Oferta de crédito personalizada?
      </div>
      `,
      html: true,
      ok: {
        label: "Sí, continuar",
        color: "primary",
        class: "custom-modal-button",
      },
      persistent: true,
    }).onOk(() => {
      router.push({ name: nextStep || 'confirm-store' })
    })
  } catch (error: any) {
    sendingQuotes.value = false
    console.error('Error in confirmEmailNotification:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al enviar cotizaciones',
      position: 'top'
    })
    router.push({ name: nextStep || 'confirm-store' })
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

// Handle URL parameters for redirect from motorcycle detail page
// route and router are already declared above

async function handleRedirectParams() {
  const motorcycleId = route.query.motorcycle_id as string
  const brand = route.query.brand as string
  const model = route.query.model as string
  const year = route.query.year as string
  const priceParam = route.query.price as string
  const stepParam = route.query.step as string

  // If we have motorcycle parameters, skip to step 2
  if (motorcycleId && brand && model) {
    // Ensure motorcycles are loaded
    if (motorcycleStore.motorcycles.length === 0) {
      await motorcycleStore.fetchMotorcycles()
    }
    
    // Set the brand
    const brandObj = brands.value.find(b => b.name === brand) || {
      id: brand,
      name: brand,
      imageUrl: undefined
    }
    
    if (!brands.value.find(b => b.name === brand)) {
      brands.value.push(brandObj)
    }
    
    selectedBrand.value = brandObj
    
    // Set the model
    const modelName = decodeURIComponent(model)
    const motorcycle = motorcycleStore.motorcycles.find((m: any) => 
      m.id === parseInt(motorcycleId) || 
      (m.brand === brand && (m.model === modelName || m.name?.includes(modelName)))
    ) as any
    
    if (motorcycle) {
      selectedModelId.value = motorcycle.id
      models.value = [{
        id: motorcycle.id,
        name: modelName,
        image: motorcycle.image
      }]
      
      // Set invoice_motorcycle_value from query param or motorcycle data
      if (priceParam) {
        const invoiceValue = parseFloat(priceParam.replace(/[^0-9.]/g, '')) || null
        quoteParams.value.invoice_motorcycle_value = invoiceValue
        if (invoiceValue) {
          quoteParams.value.downPayment = Math.round(invoiceValue * 0.2)
        }
      } else if (motorcycle.price) {
        const invoiceValue = parseFloat(String(motorcycle.price)) || null
        quoteParams.value.invoice_motorcycle_value = invoiceValue
        if (invoiceValue) {
          quoteParams.value.downPayment = Math.round(invoiceValue * 0.2)
        }
      }
    } else {
      // If motorcycle not found in store, use query params
      selectedModelId.value = parseInt(motorcycleId)
      models.value = [{
        id: parseInt(motorcycleId),
        name: modelName,
        image: undefined
      }]
      
      // Set invoice_motorcycle_value from query param
      if (priceParam) {
        const invoiceValue = parseFloat(priceParam.replace(/[^0-9.]/g, '')) || null
        quoteParams.value.invoice_motorcycle_value = invoiceValue
        if (invoiceValue) {
          quoteParams.value.downPayment = Math.round(invoiceValue * 0.2)
        }
      }
    }
    
    // Skip to step 2 if step parameter is 'financing' or if we have all required params
    if (stepParam === 'financing' || (motorcycleId && brand && model)) {
      step.value = 1 // Step 2 (index 1)
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadBrands()
  // Handle redirect params after brands are loaded
  handleRedirectParams()
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e8f5e9 100%);
  padding: 0.5rem;
  padding-bottom: 0.5rem;
  padding-top: calc(0.5rem + 80px + 32px + 15px); /* Account for Navbar (~80px) + ProcessStepper (32px) + MotorcyclePreview (~60px when visible) */
  position: relative;
  overflow-x: hidden;
}

/* Enhanced Header - Reduced sizes for mobile */
.quote-header {
  text-align: center;
  margin-bottom: 1rem;
  padding-top: 0.5rem;
  position: relative;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  border-radius: 0.75rem;
  margin-bottom: 0.375rem;
  box-shadow: 0 4px 12px rgba(38, 224, 133, 0.15);
  animation: float 3s ease-in-out infinite;
}

.header-icon {
  color: white;
  font-size: 1.25rem;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

.quote-title {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a1a 0%, #26e085 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.quote-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* Enhanced Progress Indicator */
.progress-wrapper {
  margin-bottom: 2.5rem;
}

.progress-bar-container {
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2FFF96 0%, #26e085 50%, #1dd1a1 100%);
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
  position: relative;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}

.step-number-wrapper {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: white;
  border: 3px solid #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.step-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  box-shadow: 0 4px 12px rgba(38, 224, 133, 0.3);
}

.progress-step.completed .step-check {
  transform: translate(-50%, -50%) scale(1);
}

.progress-step.active .step-number {
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  border-color: #26e085;
  color: white;
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(38, 224, 133, 0.4);
}

.progress-step.completed .step-number {
  background: white;
  border-color: #26e085;
  color: transparent;
}

.step-label {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
}

.progress-step.active .step-label {
  color: #26e085;
  font-weight: 700;
  transform: translateY(-2px);
}

.progress-step.completed .step-label {
  color: #26e085;
  font-weight: 600;
}

/* Enhanced Main Card */
.main-card {
  background: white;
  border-radius: 2rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin: 0;
}

.main-card :deep(.q-card-section) {
  padding: 0.75rem 1rem;
}

/* Removed main-card::before to use progress bar instead */

/* Enhanced Step Content */
.step-content {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem;
  margin: 0;
}

/* ============================================
   STEP 2 - ENHANCED BUSINESS STYLES
   ============================================ */

.step-2-content {
  animation: none !important;
  max-width: 600px; /* Centered narrow layout for better readability */
  margin: 0 auto;
}

/* Header Refinement */
.step-2-content .step-header {
  margin-bottom: 1.5rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.step-2-content .step-title {
  font-weight: 800;
  font-size: 1.35rem;
  color: #242424;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 0;
}

/* Form Layout Grid */
.step-2-content .form-fields {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns on desktop */
  gap: 0.25rem;
  margin-top: 1rem;
}

/* Form Group - Mobile First */
.step-2-content .form-group {
  grid-column: span 2; /* Default to full width */
  display: flex;
  flex-direction: column;
  margin-bottom: 0.125rem;
}

/* Override Quasar's default field margins */
.step-2-content :deep(.q-field) {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}

.step-2-content :deep(.q-field__bottom) {
  padding-top: 0 !important;
  margin-top: 0 !important;
  min-height: 0 !important;
}

/* Remove any default padding from field wrapper */
.step-2-content :deep(.q-field__wrapper) {
  padding: 0 !important;
  margin: 0 !important;
}

/* Specific fields can stay half-width on desktop */
@media (min-width: 600px) {
  .step-2-content .form-group.half-width {
    grid-column: span 1;
  }
}

/* Label Styling */
.step-2-content .form-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #242424; /* Black for labels */
  margin-bottom: 0.125rem;
  padding: 0;
  display: block;
  width: 100%;
  line-height: 1;
}

/* Unified Input Styling */
.step-2-content :deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  background: #fcfcfc;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

/* Interaction States */
.step-2-content :deep(.q-field--outlined.q-field--focused .q-field__control) {
  background: #ffffff;
  border-color: #242424; /* Black border on focus for business look */
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.step-2-content :deep(.q-field__native),
.step-2-content :deep(.q-field__input) {
  font-weight: 600;
  color: #242424;
}

/* Currency and Icons */
.step-2-content .currency-prefix {
  font-weight: 700;
  color: #242424;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 4px;
  font-size: 0.875rem;
}

.step-2-content :deep(.currency-prefix) {
  font-weight: 700;
  color: #242424;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 4px;
  font-size: 0.875rem;
}

/* Custom Hint Styling */
.step-2-content .form-hint {
  font-size: 0.75rem;
  color: #242424;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  line-height: 1.2;
  font-weight: 400;
  opacity: 0.7;
}

.step-2-content .form-hint::before {
  content: '•';
  color: #26e085;
  font-weight: bold;
}

.step-2-content .form-hint .q-icon {
  display: none;
}

/* Select Field Customization */
.step-2-content :deep(.q-select .q-icon) {
  transition: transform 0.2s ease;
  color: #242424;
}

.step-2-content :deep(.q-field--focused .q-icon) {
  transform: rotate(180deg);
}

.step-2-content .step-2-input {
  margin: 0 !important;
  padding: 0 !important;
}

.step-2-content .step-2-input :deep(.q-field) {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}
/* Compact spacing adjustments */
.step-header {
  margin-bottom: 1.25rem;
  text-align: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}


.step-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: #f8f9fa;
  border: 1.5px solid #e9ecef;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.step-icon {
  color: #242424;
  font-size: 1.5rem;
}

.step-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #242424;
  margin: 0 0 0.375rem 0;
  letter-spacing: -0.02em;
}

.step-description {
  font-size: 0.9375rem;
  color: #6c757d;
  margin: 0;
  font-weight: 400;
}

/* Enhanced Inputs */
.search-input,
.enhanced-input {
  margin-bottom: 0.75rem;
}

:deep(.enhanced-input .q-field__control) {
  border-radius: 0.75rem;
  border-color: #dee2e6;
  transition: all 0.3s ease;
}

:deep(.enhanced-input .q-field--focused .q-field__control) {
  box-shadow: 0 0 0 2px rgba(47, 255, 150, 0.1);
  border-color: #2FFF96;
}

:deep(.enhanced-input .q-field--focused .q-field__prepend) {
  color: #2FFF96;
}

.input-icon {
  color: #242424;
  opacity: 0.6;
  transition: all 0.3s ease;
}

:deep(.enhanced-input .q-field--focused .input-icon) {
  color: #2FFF96;
  opacity: 1;
}

.label-icon {
  color: #242424;
  margin-right: 0.5rem;
  font-size: 1rem;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.form-group:hover .label-icon {
  opacity: 1;
  color: #242424;
}

/* Enhanced Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1.5rem;
}

.loading-spinner-wrapper {
  position: relative;
  display: inline-block;
}

.spinner-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 3px solid rgba(38, 224, 133, 0.2);
  animation: ripple 1.5s ease-out infinite;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.loading-text {
  color: #475569;
  font-size: 1rem;
  font-weight: 600;
}

.loading-subtext {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: -0.5rem;
}

/* Enhanced Brands Grid */
.brands-grid {
  margin-bottom: 2rem;
}

.brand-selection-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(165, 222, 253, 0.1) 0%, rgba(165, 222, 253, 0.2) 100%);
  border-radius: 0.75rem;
  border: 2px dashed rgba(165, 222, 253, 0.4);
  animation: pulseHint 2s ease-in-out infinite;
}

@keyframes pulseHint {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.01);
  }
}

.hint-icon {
  color: #A5DEFD;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.hint-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
  letter-spacing: 0.02em;
}

.brands-grid-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .brands-grid-inner {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.875rem;
  }
}

@media (min-width: 1024px) {
  .brands-grid-inner {
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
  }
}

.brand-list-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.brand-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.brand-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: brandCardEnter 0.5s ease-out backwards;
}

@keyframes brandCardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.brand-card-inner {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2.5px solid #e2e8f0;
  border-radius: 1rem;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 72px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;
}

.brand-card:hover .brand-card-inner {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-color: #A5DEFD;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.brand-card:active .brand-card-inner {
  transform: translateY(-2px) scale(0.98);
}

.brand-card.selected .brand-card-inner {
  border-color: #A5DEFD;
  border-width: 3px;
  background: linear-gradient(135deg, rgba(165, 222, 253, 0.15) 0%, rgba(165, 222, 253, 0.25) 100%);
  box-shadow: 
    0 6px 20px rgba(165, 222, 253, 0.4),
    0 0 0 2px rgba(165, 222, 253, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transform: translateY(-2px) scale(1.02);
}

.brand-card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(38, 224, 133, 0.2) 0%, transparent 70%);
  transition: all 0.5s ease;
  pointer-events: none;
}

.brand-card.selected .brand-card-glow {
  width: 200%;
  height: 200%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.brand-image-wrapper {
  width: 100%;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.brand-image-backdrop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, rgba(165, 222, 253, 0.15) 0%, rgba(165, 222, 253, 0.25) 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.brand-card.selected .brand-image-backdrop {
  opacity: 1;
}

.brand-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.brand-placeholder {
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
}

.brand-placeholder .q-icon {
  font-size: 2rem;
}

.brand-placeholder.hidden {
  display: none;
}

.brand-card.selected .brand-image {
  filter: brightness(1.1) drop-shadow(0 2px 6px rgba(165, 222, 253, 0.4));
  transform: scale(1.08);
}

.brand-card.selected .brand-placeholder {
  color: #A5DEFD;
}

.brand-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  line-height: 1.2;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
  margin-top: 0.125rem;
}

.brand-card.selected .brand-name {
  color: #1e40af;
  font-weight: 800;
}

.selected-badge {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #A5DEFD 0%, #7BC8F0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #242424;
  font-size: 0.7rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(165, 222, 253, 0.5);
  animation: badgePop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid white;
}

@keyframes badgePop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Enhanced Model Selector */
.model-selector {
  margin-top: 1.5rem;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.model-select {
  width: 100%;
}

/* Simple Professional Input Styling */
.model-select :deep(.q-field--outlined .q-field__control) {
  border-radius: 0.75rem;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.model-select :deep(.q-field--outlined.q-field--focused .q-field__control) {
  border-color: #A5DEFD;
  box-shadow: 0 0 0 3px rgba(165, 222, 253, 0.1);
}

.model-select :deep(.q-field--outlined.q-field--readonly .q-field__control) {
  background: #f8fafc;
  border-color: #A5DEFD;
  cursor: default;
}

.model-select :deep(.q-field__native),
.model-select :deep(.q-field__input) {
  font-weight: 500;
  color: #242424;
  font-size: 0.9375rem;
}

.model-select :deep(.q-field--readonly .q-field__native),
.model-select :deep(.q-field--readonly .q-field__input) {
  color: #1e40af;
  font-weight: 600;
}

.model-select :deep(.q-field__prepend) {
  padding-right: 0.5rem;
}

.model-select :deep(.q-field__append) {
  padding-left: 0.5rem;
}

/* Dropdown Menu Styling */
.model-select :deep(.q-menu) {
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10000;
}

.model-select :deep(.q-item) {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin: 0.25rem 0.5rem;
  transition: all 0.2s ease;
  min-height: auto;
}

.model-select :deep(.q-item:hover) {
  background: rgba(165, 222, 253, 0.1);
  color: #1e40af;
}

.model-select :deep(.q-item--active) {
  background: rgba(165, 222, 253, 0.15);
  color: #1e40af;
  font-weight: 600;
}

.model-select :deep(.q-item__label) {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.5;
}


/* Form Fields */
.form-fields {
  width: 100%;
  margin-top: 0.5rem;
}

.form-fields .form-group {
  padding-left: 0;
  padding-right: 0;
}

.form-group {
  width: 100%;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
}

.form-group:hover {
  background: rgba(47, 255, 150, 0.02);
  padding: 0.5rem 0.5rem;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.form-group-valid {
  background: rgba(47, 255, 150, 0.03);
  border-left: 3px solid #2FFF96;
  padding-left: 0.5rem;
  margin-left: 0;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #242424;
  margin-bottom: 0.375rem;
  margin-left: 0;
  padding-left: 0;
  transition: all 0.3s ease;
  gap: 0.5rem;
}

.form-label .label-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.form-group:hover .form-label {
  color: #242424;
}

.valid-icon {
  color: #2FFF96;
  margin-left: auto;
  animation: checkPop 0.3s ease;
}

@keyframes checkPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  font-weight: 400;
}

.form-hint .q-icon {
  color: #6c757d;
  opacity: 0.6;
}

/* Contact Info Section - Simple Business Style */
.contact-info-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.contact-info-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.contact-section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #242424;
  margin: 0 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  position: relative;
  padding-bottom: 0.75rem;
}

.contact-section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 2rem;
  height: 2px;
  background: linear-gradient(90deg, #A5DEFD 0%, transparent 100%);
  border-radius: 2px;
}

.contact-form-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 600px) {
  .contact-form-fields {
    grid-template-columns: 1fr 1fr;
  }
}

.contact-form-group {
  display: flex;
  flex-direction: column;
}

.contact-form-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.contact-input :deep(.q-field--outlined .q-field__control) {
  border-radius: 0.625rem;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  transition: all 0.2s ease;
}

.contact-input :deep(.q-field--outlined.q-field--focused .q-field__control) {
  background: #ffffff;
  border-color: #242424;
  box-shadow: 0 0 0 3px rgba(36, 36, 36, 0.05);
}

.contact-input :deep(.q-field__native),
.contact-input :deep(.q-field__input) {
  font-weight: 500;
  color: #242424;
  font-size: 0.9375rem;
}

.contact-info-section.highlight-contact {
  background: linear-gradient(135deg, rgba(165, 222, 253, 0.05) 0%, rgba(165, 222, 253, 0.1) 100%);
  border-color: #A5DEFD;
  border-width: 1.5px;
  box-shadow: 0 4px 16px rgba(165, 222, 253, 0.15);
}

/* Validation States */
.form-group-valid {
  position: relative;
}

.form-group-valid .form-label {
  color: #242424;
}

.form-group-valid .label-icon {
  color: #2FFF96;
  opacity: 1;
}

.form-group-valid :deep(.enhanced-input .q-field__control) {
  border-color: #2FFF96;
  background: rgba(47, 255, 150, 0.02);
}

.form-group-valid :deep(.enhanced-input .q-field--focused .q-field__control) {
  border-color: #2FFF96;
  box-shadow: 0 0 0 2px rgba(47, 255, 150, 0.1);
  background: rgba(47, 255, 150, 0.03);
}

.form-group-valid :deep(.enhanced-input .input-icon) {
  color: #2FFF96;
  opacity: 1;
}

.form-group-valid :deep(.enhanced-input .q-field--focused .input-icon) {
  color: #2FFF96;
  opacity: 1;
}

.form-group-valid :deep(.enhanced-input .q-field__messages) {
  display: none;
}

.contact-input {
  transition: all 0.3s ease;
}

.full-width-input {
  width: 100%;
}

.currency-prefix {
  color: #242424;
  font-weight: 600;
  opacity: 0.7;
}

:deep(.enhanced-input .q-field--focused .currency-prefix) {
  color: #2FFF96;
  opacity: 1;
}



/* Offers Container */
.offers-container {
  margin-top: 1rem;
}

/* Enhanced Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1.5rem;
  text-align: center;
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.1) 0%, rgba(38, 224, 133, 0.1) 100%);
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.empty-icon {
  color: #cbd5e1;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.empty-text {
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0;
}

.retry-button {
  margin-top: 0.5rem;
  border-radius: 0.875rem;
  padding: 0.75rem 1.5rem;
}

/* Enhanced Navigation Buttons */
.navigation-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  padding-bottom: 0.5rem;
  border-top: 2px solid #f1f5f9;
  position: relative;
  z-index: 1;
}

.nav-button {
  flex: 1;
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
  border-radius: 0.75rem;
}

.nav-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.nav-button:hover:not(:disabled)::before {
  left: 100%;
}

.nav-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.nav-button:active:not(:disabled) {
  transform: translateY(0);
}

.next-button,
.fetch-button,
.continue-button,
.send-quotes-button {
  background: linear-gradient(135deg, #2FFF96 0%, #26E885 100%) !important;
  color: #242424 !important;
  box-shadow: 0 4px 12px rgba(47, 255, 150, 0.4), 0 2px 4px rgba(47, 255, 150, 0.2);
}

.next-button:hover:not(:disabled),
.fetch-button:hover:not(:disabled),
.continue-button:hover:not(:disabled),
.send-quotes-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #26E885 0%, #2FFF96 100%) !important;
  box-shadow: 0 6px 16px rgba(47, 255, 150, 0.5), 0 4px 8px rgba(47, 255, 150, 0.3);
}

.next-button:active:not(:disabled),
.fetch-button:active:not(:disabled),
.continue-button:active:not(:disabled),
.send-quotes-button:active:not(:disabled) {
  box-shadow: 0 2px 8px rgba(47, 255, 150, 0.3);
}

.back-button {
  border: 2px solid #e2e8f0;
  background: white;
  color: #242424 !important;
}

.back-button:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

/* Custom Modal Button Styling */
:deep(.custom-modal-button) {
  background: linear-gradient(135deg, #2FFF96 0%, #26E885 100%) !important;
  color: #242424 !important;
  box-shadow: 0 4px 12px rgba(47, 255, 150, 0.4), 0 2px 4px rgba(47, 255, 150, 0.2) !important;
  border: none !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

:deep(.custom-modal-button:hover) {
  background: linear-gradient(135deg, #26E885 0%, #2FFF96 100%) !important;
  box-shadow: 0 6px 16px rgba(47, 255, 150, 0.5), 0 4px 8px rgba(47, 255, 150, 0.3) !important;
}

:deep(.custom-modal-button:active) {
  box-shadow: 0 2px 8px rgba(47, 255, 150, 0.3) !important;
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}



/* Responsive */
@media (min-width: 768px) {
  .quote-generator-container {
    padding: 1rem;
    padding-top: calc(1rem + 80px + 32px + 15px); /* Account for Navbar + ProcessStepper + MotorcyclePreview */
    padding-bottom: 1rem;
    max-width: 50rem;
    margin: 0 auto;
  }

  .quote-title {
    font-size: 1.5rem;
  }

  .quote-subtitle {
    font-size: 0.875rem;
  }

  .header-icon-wrapper {
    width: 3rem;
    height: 3rem;
    margin-bottom: 0.5rem;
  }

  .header-icon {
    font-size: 1.5rem;
  }

  .quote-generator-container {
    padding-top: calc(2.5rem + 200px); /* Account for MotorcyclePreview + ProcessStepper */
  }

  .brands-grid-inner {
    gap: 1.5rem;
  }

  .brand-card-inner {
    min-height: 140px;
    padding: 1.5rem 1rem;
  }

  .step-title {
    font-size: 2rem;
  }

  .step-description {
    font-size: 1.125rem;
  }
}

/* ============================================
   ELEGANT PROGRESS BAR - TOP OF CONTAINER
   ============================================ */

.elegant-progress-container {
  width: 100%;
  padding: 18px 24px 28px 24px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  margin: 0;
  border-radius: 2rem 2rem 0 0;
}

.progress-track-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 32px;
  max-width: 100%;
  padding-bottom: 20px;
}

/* The Horizontal Line */
.progress-line-bg {
  position: absolute;
  width: calc(100% - 48px);
  left: 24px;
  height: 2.5px;
  background: #f1f1f1;
  border-radius: 2.5px;
  z-index: 1;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.progress-fill-line {
  height: 100%;
  background: linear-gradient(90deg, #A5DEFD 0%, #A5DEFD 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2.5px;
  position: relative;
  box-shadow: 0 1px 3px rgba(165, 222, 253, 0.3);
}

.progress-fill-line::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: #A5DEFD;
  border-radius: 0 2.5px 2.5px 0;
  box-shadow: 0 0 4px rgba(165, 222, 253, 0.5);
}

/* The Nodes (Circles with Numbers) */
.steps-overlay {
  position: absolute;
  width: calc(100% - 48px);
  left: 24px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  align-items: flex-start;
}

.step-node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.step-node {
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 2.5px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  position: relative;
}

.step-node::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  transition: all 0.4s ease;
}

.node-content {
  font-size: 0.7rem;
  font-weight: 800;
  color: #9ca3af;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

/* State: Active (Light Blue) */
.step-node.is-active {
  border-color: #A5DEFD;
  background: #A5DEFD;
  transform: scale(1.12);
  box-shadow: 0 3px 10px rgba(165, 222, 253, 0.4);
}

.step-node.is-active::before {
  background: rgba(165, 222, 253, 0.2);
  transform: scale(1.5);
}

.step-node.is-active .node-content {
  color: #242424;
}

/* State: Completed (Light Blue) */
.step-node.is-completed {
  background: #A5DEFD;
  border-color: #A5DEFD;
  box-shadow: 0 3px 10px rgba(165, 222, 253, 0.4);
}

.step-node.is-completed::before {
  background: rgba(165, 222, 253, 0.2);
  transform: scale(1.5);
}

.step-node.is-completed .node-content {
  color: #242424;
}

.step-node.is-completed .node-content .q-icon {
  animation: checkPop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Step Label Below Node */
.step-node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.step-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #9ca3af;
  text-align: center;
  white-space: nowrap;
  margin-top: 2px;
  transition: color 0.3s ease;
  line-height: 1.2;
}

.step-node-wrapper:hover .step-label {
  color: #242424;
}

.step-node-wrapper:has(.is-active) .step-label {
  color: #242424;
  font-weight: 700;
}

.step-node-wrapper:has(.is-completed) .step-label {
  color: #A5DEFD;
  font-weight: 600;
}

/* Step Label Below Node */
.step-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #9ca3af;
  text-align: center;
  white-space: nowrap;
  margin-top: 2px;
  transition: color 0.3s ease;
  line-height: 1.2;
}

.step-node-wrapper:hover .step-label {
  color: #242424;
}

.step-node-wrapper:has(.is-active) .step-label {
  color: #242424;
  font-weight: 700;
}

.step-node-wrapper:has(.is-completed) .step-label {
  color: #A5DEFD;
  font-weight: 600;
}

@keyframes checkPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (min-width: 1024px) {
  .quote-generator-container {
    max-width: 68rem;
    padding: 1rem;
    padding-top: calc(1rem + 80px + 32px + 15px); /* Account for Navbar + ProcessStepper + MotorcyclePreview */
    padding-bottom: 1rem;
  }

  .main-card {
    border-radius: 2.5rem;
  }

  .brands-grid-inner {
    gap: 1.75rem;
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
