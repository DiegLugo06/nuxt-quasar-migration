<template>
  <div class="bank-quotes-container">

    <div class="quotes-list">
      <div
        v-for="(bankGroup, index) in quotesWithInsurance"
        :key="index"
        class="quote-card"
        :class="{ 'quote-card-selected': selectedCardIndex === index }"
        @click="handleQuoteCardClick(bankGroup[0], index)"
      >
        <div class="quote-card-content">
          <div class="quote-card-header">
            <div class="bank-info">
              <div class="bank-logo-container">
                <img
                  :src="bankLogo(bankGroup[0].bank_logo, bankGroup[0].bank)"
                  :alt="bankGroup[0].bank"
                  class="bank-logo"
                  @error="handleBankLogoError"
                />
              </div>
              <div class="bank-details">
                <h3 class="bank-name">{{ bankGroup[0].bank }}</h3>
              </div>
            </div>

            <div v-if="hasInsuranceForBank(bankGroup)" class="insurance-toggle-container">
              <span class="insurance-label">
                {{ bankToggles[index] ? 'Seguro incluido' : 'Sin Seguro' }}
              </span>
              <q-toggle
                v-model="bankToggles[index]"
                :disable="!isToggleEnabled(bankGroup)"
                color="dark"
                dense
                size="sm"
              />
            </div>
          </div>

          <div class="payment-unified-container">
            <div class="payment-section initial-base">
              <div class="centered-icon-wrapper">
                <q-icon name="account_balance_wallet" size="24px" />
              </div>
              <div class="payment-info">
                <p class="payment-label">Pago inicial</p>
                <p v-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Contado' && shouldShowLifeUnemploymentInsurance(bankGroup) && getLifeUnemploymentInsuranceAmount(bankGroup, index) > 0" class="payment-label-info">
                  Enganche + Comisión por apertura + Seguro + Vida/Desempleo
                </p>
                <p v-else-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Contado'" class="payment-label-info">
                  Enganche + Comisión por apertura + Seguro
                </p>
                <p v-else class="payment-label-info">
                  Enganche + Comisión por apertura
                </p>
                <div class="payment-amount-small">{{ formatCurrency(getInitialPayment(bankGroup, index)) }}</div>
              </div>
            </div>

            <div class="payment-section monthly-highlight">
              <div class="centered-icon-wrapper">
                <q-icon name="payments" size="24px" />
              </div>
              <div class="payment-info">
                <p class="payment-label">Pago mensual</p>
                <p v-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Financiado' && shouldShowLifeUnemploymentInsurance(bankGroup) && getLifeUnemploymentInsuranceAmount(bankGroup, index) > 0" class="payment-label-info">
                  Incluye seguro + vida/desempleo
                </p>
                <p v-else-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Financiado'" class="payment-label-info">
                  Incluye pago del seguro
                </p>
                <div class="payment-amount">{{ formatCurrency(getMonthlyPayment(bankGroup, index)) }}</div>
              </div>
            </div>

            <div class="payment-details-row">
              <div class="detail-item">
                <span class="detail-label">Tasa de interés</span>
                <span class="detail-value">{{ ((bankGroup[0].avg_interest_rate || 0) * 100).toFixed(2) }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total a pagar</span>
                <span class="detail-value">{{ formatCurrency(getTotalAmount(bankGroup, index)) }}</span>
              </div>
            </div>
          </div>

          <div class="quote-card-footer">
            <div class="insurance-details-stack">
              <div v-if="bankToggles[index]" class="insurance-status-item">
                <q-icon name="verified" size="16px" />
                <span class="status-text">Seguro incluido: <strong>AMPLIA</strong></span>
              </div>
              
              <div v-if="bankToggles[index] && shouldShowLifeUnemploymentInsurance(bankGroup)" class="insurance-status-item">
                <q-icon name="verified_user" size="16px" />
                <span class="status-text">Seguro de vida y desempleo incluido</span>
              </div>

              <div class="compatibility-tag">
                <q-icon name="check_circle" size="16px" />
                <span>Oferta compatible con tu moto</span>
              </div>
            </div>
            
            <p class="quote-disclaimer">*Esta cotización es aproximada.</p>
          </div>
        </div>
      </div>
    </div>

    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

const config = useRuntimeConfig()

// Props
const props = defineProps({
  quotes: {
    type: Array,
    required: false,
    default: () => [],
  },
  modelId: {
    type: [String, Number],
    required: false,
    default: null,
  },
  quoteParams: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  insurancePaymentMethod: {
    type: String,
    default: 'Financiamiento',
  },
})

// State
const bankToggles = ref<Record<number, boolean>>({})
const selectedCardIndex = ref<number | null>(null)

// Computed
const quotesWithInsurance = computed(() => {
  if (props.quotes && props.quotes.length > 0) {
    const bankGroups: Record<string, any[]> = {}
    props.quotes.forEach((quote: any) => {
      const bankName = quote.bank || 'Unknown'
      if (!bankGroups[bankName]) {
        bankGroups[bankName] = []
      }
      bankGroups[bankName].push(quote)
    })
    return Object.values(bankGroups)
  }
  return []
})

// Methods
const hasInsuranceForBank = (bankGroup: any[]) => {
  return bankGroup.some((quote: any) => 
    quote.quote?.insurance_applied && quote.quote?.insurance_amount > 0
  )
}

const shouldShowInsurance = (bankGroup: any[], index: number) => {
  return bankToggles.value[index] || false
}

const getInitialPayment = (bankGroup: any[], index: number) => {
  const quote = shouldShowInsurance(bankGroup, index)
    ? bankGroup.find((q: any) => q.quote?.insurance_applied && q.quote?.insurance_amount > 0)
    : bankGroup.find((q: any) => !q.quote?.insurance_applied || q.quote?.insurance_amount === 0)
  return quote?.quote?.initial_payment || quote?.down_payment || 0
}

const getMonthlyPayment = (bankGroup: any[], index: number) => {
  const quote = shouldShowInsurance(bankGroup, index)
    ? bankGroup.find((q: any) => q.quote?.insurance_applied && q.quote?.insurance_amount > 0)
    : bankGroup.find((q: any) => !q.quote?.insurance_applied || q.quote?.insurance_amount === 0)
  return quote?.quote?.monthly_payment || quote?.monthly || 0
}

const getTotalAmount = (bankGroup: any[], index: number) => {
  const quote = shouldShowInsurance(bankGroup, index)
    ? bankGroup.find((q: any) => q.quote?.insurance_applied && q.quote?.insurance_amount > 0)
    : bankGroup.find((q: any) => !q.quote?.insurance_applied || q.quote?.insurance_amount === 0)
  return quote?.quote?.total_loan_amount || 0
}

const getCoverageNames = (bankGroup: any[], index: number) => {
  const quote = shouldShowInsurance(bankGroup, index)
    ? bankGroup.find((q: any) => q.quote?.insurance_applied && q.quote?.insurance_amount > 0)
    : bankGroup.find((q: any) => !q.quote?.insurance_applied || q.quote?.insurance_amount === 0)
  return quote?.quote?.coverage_names || []
}

const getInsuranceMethod = (bankGroup: any[], index: number) => {
  const quote = shouldShowInsurance(bankGroup, index)
    ? bankGroup.find((q: any) => q.quote?.insurance_applied && q.quote?.insurance_amount > 0)
    : bankGroup.find((q: any) => !q.quote?.insurance_applied || q.quote?.insurance_amount === 0)
  return quote?.quote?.insurance_method || 'Financiado'
}

const getLifeUnemploymentInsuranceAmount = (bankGroup: any[], index: number) => {
  const quote = shouldShowInsurance(bankGroup, index)
    ? bankGroup.find((q: any) => q.quote?.insurance_applied && q.quote?.insurance_amount > 0)
    : bankGroup.find((q: any) => !q.quote?.insurance_applied || q.quote?.insurance_amount === 0)
  return quote?.quote?.life_unemployment_insurance_amount || 0
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Get bank logo from Supabase storage
const bankLogo = (bankLogoDomain: string, bankName: string) => {
  // Use bank name directly if available, otherwise extract from domain
  let normalizedBankName = ''
  
  if (bankName) {
    // Use the bank name directly, normalized to lowercase
    normalizedBankName = bankName.toLowerCase().trim()
  } else if (bankLogoDomain) {
    // Fallback: extract bank name from domain (e.g., "bbva.com" -> "bbva")
    if (bankLogoDomain.includes('.')) {
      normalizedBankName = bankLogoDomain.split('.')[0].toLowerCase()
    } else {
      normalizedBankName = bankLogoDomain.toLowerCase()
    }
  } else {
    // No bank identifier available
    return '/assets/bank-placeholder.png'
  }
  
  // Get Supabase project ID from config
  const supabaseProjectId = config.public.SUPABASE_PROJECT_ID
  
  if (!supabaseProjectId) {
    console.warn('SUPABASE_PROJECT_ID not configured, falling back to placeholder')
    return '/assets/bank-placeholder.png'
  }
  
  // Build Supabase storage URL: documents/banks/{bankName}.webp
  return `https://${supabaseProjectId}.supabase.co/storage/v1/object/public/documents/banks/${normalizedBankName}.webp`
}

// Handle bank logo loading errors
const handleBankLogoError = (event: Event) => {
  // Fallback to placeholder if Supabase image fails to load
  const target = event.target as HTMLImageElement
  if (target && target.src && !target.src.includes('bank-placeholder')) {
    target.src = '/assets/bank-placeholder.png'
  }
}

const isToggleEnabled = (bankGroup: any[]) => {
  const bankName = bankGroup[0]?.bank?.toLowerCase() || ''
  return ['maxikash', 'creditogo'].includes(bankName)
}

const shouldShowLifeUnemploymentInsurance = (bankGroup: any[]) => {
  const bankName = bankGroup[0]?.bank?.toUpperCase() || ''
  return ['HEY', 'BBVA', 'SANTANDER', 'BANREGIO', 'CREDITOGO'].includes(bankName)
}

const handleLogoError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    // Try to fallback to placeholder
    if (target.src && !target.src.includes('bank-placeholder')) {
      target.src = '/assets/bank-placeholder.png'
    } else {
      target.style.display = 'none'
    }
  }
}

// Emits
const emit = defineEmits(['update-insurance-option', 'quote-card-clicked', 'selected'])

const handleQuoteCardClick = (quote: any, index: number) => {
  selectedCardIndex.value = selectedCardIndex.value === index ? null : index
  emit('quote-card-clicked', quote)
  emit('selected', quote)
}

// Lifecycle
onMounted(() => {
  quotesWithInsurance.value.forEach((bankGroup: any[], index: number) => {
    const bankName = bankGroup[0]?.bank?.toLowerCase() || ''
    const hasInsurance = hasInsuranceForBank(bankGroup)
    bankToggles.value[index] = hasInsurance && !['maxikash', 'creditogo'].includes(bankName)
  })
})
</script>

<style scoped>
/* Core Business Colors */
.bank-quotes-container {
  --text-dark: #242424;
  --bg-monthly: #2FFF96;
  --bg-initial: #f0fdf4;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

.quotes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quote-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.quote-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.quote-card-selected {
  border: 2px solid var(--text-dark);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.quote-card-content {
  padding: 0;
}

.quote-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

/* Header */
.bank-logo-container {
  width: 44px;
  height: 44px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.bank-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.bank-details {
  flex: 1;
}

.bank-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0;
}

.insurance-toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
}

.insurance-label {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-dark);
  text-transform: uppercase;
  white-space: nowrap;
}

/* Unified Container Styling */
.payment-unified-container {
  margin: 0 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.payment-section {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.monthly-highlight { 
  background-color: var(--bg-monthly); 
  color: var(--text-dark); 
}

.initial-base { 
  background-color: var(--bg-initial); 
  color: var(--text-dark); 
  border-top: 1px solid rgba(0,0,0,0.05); 
}

.centered-icon-wrapper {
  width: 52px;
  height: 52px;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.payment-info {
  flex-grow: 1;
}

.payment-label {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text-dark);
  line-height: 1.4;
}

.payment-label-info {
  font-weight: 400;
  opacity: 0.7;
  font-size: 0.75rem;
  margin: 0 0 8px 0;
  color: var(--text-dark);
  line-height: 1.3;
  display: block;
}

.payment-amount { 
  font-size: 1.75rem; 
  font-weight: 900; 
  letter-spacing: -1px; 
  color: var(--text-dark);
  margin: 4px 0;
}

.payment-amount-small { 
  font-size: 1.4rem; 
  font-weight: 800; 
  color: var(--text-dark);
  margin: 4px 0;
}

.payment-term-badge {
  display: inline-block;
  background: var(--text-dark);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 6px;
}

.payment-details-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f9f9f9;
  padding: 16px 20px;
  gap: 20px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.detail-label {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.detail-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-dark);
  letter-spacing: -0.01em;
  word-break: break-word;
}

/* Footer & Insurance Items */
.quote-card-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.insurance-details-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insurance-status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-dark);
  opacity: 0.8;
}

.insurance-status-item .q-icon {
  color: var(--text-dark);
  opacity: 0.6;
}

.status-text {
  flex: 1;
  color: var(--text-dark);
  font-weight: 500;
}

.status-text strong {
  font-weight: 700;
}

.compatibility-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-dark);
  font-weight: 500;
  opacity: 0.7;
  margin-top: 4px;
}

.compatibility-tag .q-icon {
  color: var(--text-dark);
  opacity: 0.6;
}

.quote-disclaimer {
  font-size: 0.7rem;
  color: #9e9e9e;
  margin-top: 16px;
  margin-bottom: 0;
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  .payment-section { 
    padding: 16px; 
    gap: 12px; 
  }
  .payment-amount { 
    font-size: 1.4rem; 
  }
  .centered-icon-wrapper { 
    width: 40px; 
    height: 40px; 
  }
  .payment-unified-container {
    margin: 0 12px 12px 12px;
  }
  .quote-card-header {
    padding: 12px;
  }
  .quote-card-footer {
    padding: 12px;
  }
  .payment-details-row {
    padding: 12px 16px;
    gap: 16px;
  }
  .detail-value {
    font-size: 0.9rem;
  }
  .insurance-status-item {
    font-size: 0.75rem;
    gap: 6px;
  }
  .compatibility-tag {
    font-size: 0.75rem;
    gap: 5px;
  }
  .payment-label-info {
    font-size: 0.75rem;
  }
}
</style>
