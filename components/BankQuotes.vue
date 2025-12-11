<template>
  <div class="bank-quotes-container">
    <h2 v-if="title" class="quotes-title">{{ title }}</h2>

    <div class="quotes-grid">
      <q-card
        v-for="(bankGroup, index) in quotesWithInsurance"
        :key="index"
        class="bank-quote-card"
        @click="handleQuoteCardClick(bankGroup[0])"
      >
        <q-card-section>
          <!-- Bank Header -->
          <div class="bank-header">
            <div class="bank-info">
              <div class="bank-logo-wrapper">
                <img
                  v-if="['maxikash'].includes(bankGroup[0].bank.toLowerCase())"
                  :src="`/assets/${bankGroup[0].bank.toLowerCase()}-logo.png`"
                  :alt="bankGroup[0].bank"
                  class="bank-logo"
                  @error="handleLogoError"
                />
                <img
                  v-else-if="bankGroup[0].bank_logo"
                  :src="getBankLogoUrl(bankGroup[0].bank_logo)"
                  :alt="bankGroup[0].bank"
                  class="bank-logo"
                  @error="handleLogoError"
                />
                <div v-else class="bank-logo-placeholder">
                  <q-icon name="account_balance" size="24px" />
                </div>
              </div>
              <h3 class="bank-name">{{ bankGroup[0].bank }}</h3>
            </div>

            <!-- Insurance Toggle -->
            <div v-if="hasInsuranceForBank(bankGroup)" class="insurance-toggle">
              <span class="toggle-label">
                {{ bankToggles[index] ? 'Seguro incluido' : 'Incluir seguro' }}
              </span>
              <q-toggle
                v-model="bankToggles[index]"
                :disable="!isToggleEnabled(bankGroup)"
                size="sm"
                color="primary"
                class="insurance-switch"
              />
            </div>
            <div v-else class="no-insurance">
              <q-icon name="info" size="16px" />
              <span class="text-sm">Seguro no disponible</span>
            </div>
          </div>

          <!-- Main Payment Info -->
          <div class="payment-info">
            <div class="payment-row">
              <span class="payment-label">
                <span v-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Contado' && shouldShowLifeUnemploymentInsurance(bankGroup) && getLifeUnemploymentInsuranceAmount(bankGroup, index) > 0">
                  Enganche + Comisión + Seguro + Vida/Desempleo:
                </span>
                <span v-else-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Contado'">
                  Enganche + Comisión + Seguro:
                </span>
                <span v-else>
                  Enganche + Comisión por apertura:
                </span>
              </span>
              <span class="payment-value">
                {{ formatCurrency(getInitialPayment(bankGroup, index)) }}
              </span>
            </div>

            <div class="payment-row highlight">
              <span class="payment-label">
                <span v-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Contado'">
                  Pago mensual:
                </span>
                <span v-else-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Financiado' && shouldShowLifeUnemploymentInsurance(bankGroup) && getLifeUnemploymentInsuranceAmount(bankGroup, index) > 0">
                  Pago mensual (incluye seguro + vida/desempleo):
                </span>
                <span v-else-if="shouldShowInsurance(bankGroup, index) && getInsuranceMethod(bankGroup, index) === 'Financiado'">
                  Pago mensual (incluye seguro):
                </span>
                <span v-else>
                  Pago mensual:
                </span>
              </span>
              <span class="payment-value monthly">
                {{ formatCurrency(getMonthlyPayment(bankGroup, index)) }}
              </span>
            </div>
          </div>

          <!-- Loan Details -->
          <q-card class="loan-details-card">
            <q-card-section class="q-pa-md">
              <div class="loan-details-grid">
                <div class="detail-item">
                  <span class="detail-label">Plazo:</span>
                  <span class="detail-value">{{ bankGroup[0].quote?.loan_term_months || bankGroup[0].term || 'N/A' }} meses</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Tasa de interés:</span>
                  <span class="detail-value">
                    {{ ((bankGroup[0].avg_interest_rate || bankGroup[0].apr || 0) * 100).toFixed(1) }}%
                  </span>
                </div>

                <div class="detail-item">
                  <q-tooltip>
                    Comisión por apertura + Enganche + Pagos mensuales
                  </q-tooltip>
                  <div class="detail-item-with-info">
                    <q-icon name="info" size="14px" />
                    <span class="detail-label">Total a pagar:</span>
                  </div>
                  <span class="detail-value">
                    {{ formatCurrency(getTotalAmount(bankGroup, index)) }}
                  </span>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Compatibility Badge -->
          <div class="compatibility-badge">
            <q-icon name="check_circle" size="16px" />
            <span>Oferta compatible con tu moto</span>
          </div>

          <!-- Insurance Info -->
          <div v-if="shouldShowInsurance(bankGroup, index)" class="insurance-info">
            <div class="insurance-item">
              <img
                src="/assets/qualitas-logo.jpeg"
                alt="QUALITAS"
                class="insurance-logo"
                @error="handleLogoError"
              />
              <span class="insurance-text">Seguro incluido: AMPLIA</span>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="info"
                class="info-button"
              >
                <q-popup-proxy>
                  <q-card>
                    <q-card-section>
                      <div class="coverage-list">
                        <div
                          v-for="(coverage, idx) in getCoverageNames(bankGroup, index)"
                          :key="idx"
                          class="coverage-item"
                        >
                          <q-icon name="check" size="14px" class="coverage-icon" />
                          <span>{{ coverage }}</span>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-popup-proxy>
              </q-btn>
            </div>

            <!-- Life Unemployment Insurance -->
            <div
              v-if="shouldShowLifeUnemploymentInsurance(bankGroup) && getLifeUnemploymentInsuranceAmount(bankGroup, index) > 0"
              class="insurance-item life-insurance"
            >
              <q-icon name="shield" size="20px" />
              <span class="insurance-text">Seguro de vida y desempleo incluido</span>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="info"
                class="info-button"
              >
                <q-popup-proxy>
                  <q-card>
                    <q-card-section>
                      <div class="life-insurance-info">
                        <div class="info-title">Seguro de Vida y Desempleo</div>
                        <div class="info-description">Protección adicional incluida en el financiamiento</div>
                        <div class="info-amount">
                          Monto: {{ formatCurrency(getLifeUnemploymentInsuranceAmount(bankGroup, index)) }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-popup-proxy>
              </q-btn>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="disclaimer">
            <p v-if="shouldShowInsurance(bankGroup, index)" class="disclaimer-text">
              *Esta cotización es aproximada.
            </p>
            <p v-else class="disclaimer-text">
              *Esta cotización es aproximada, no incluye el seguro y es requerido por la financiera
            </p>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
  title: {
    type: String,
    default: 'Opciones de financiamiento',
  },
  insurancePaymentMethod: {
    type: String,
    default: 'Financiamiento',
  },
})

// State
const bankToggles = ref<Record<number, boolean>>({})

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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const getBankLogoUrl = (bankLogoDomain: string) => {
  if (!bankLogoDomain) return ''
  return `https://logo.clearbit.com/${bankLogoDomain}`
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
    target.style.display = 'none'
  }
}

// Emits
const emit = defineEmits(['update-insurance-option', 'quote-card-clicked', 'selected'])

const handleQuoteCardClick = (quote: any) => {
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
/* Inter Font */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.bank-quotes-container {
  width: 100%;
}

.quotes-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}

.quotes-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .quotes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .quotes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.bank-quote-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e5e7eb;
}

.bank-quote-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(38, 224, 133, 0.15);
  border-color: #26e085;
}

/* Bank Header */
.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.bank-logo-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bank-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bank-logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
  color: #9ca3af;
}

.bank-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.insurance-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.toggle-label {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}

.insurance-switch {
  flex-shrink: 0;
}

.no-insurance {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Payment Info */
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.payment-row.highlight {
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.1) 0%, rgba(38, 224, 133, 0.1) 100%);
  border-radius: 0.75rem;
  border: 1px solid rgba(38, 224, 133, 0.2);
}

.payment-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
}

.payment-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
}

.payment-value.monthly {
  font-size: 1.5rem;
  color: #26e085;
}

/* Loan Details */
.loan-details-card {
  margin-bottom: 1.25rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.loan-details-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.detail-item-with-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: right;
}

/* Compatibility Badge */
.compatibility-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #26e085;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(38, 224, 133, 0.1);
  border-radius: 0.5rem;
}

/* Insurance Info */
.insurance-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.insurance-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
}

.insurance-item.life-insurance {
  color: #3b82f6;
}

.insurance-logo {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.insurance-text {
  flex: 1;
}

.info-button {
  color: #9ca3af;
}

.coverage-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.coverage-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.coverage-icon {
  color: #26e085;
  flex-shrink: 0;
}

.life-insurance-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.info-title {
  font-weight: 600;
  color: #1a1a1a;
}

.info-description {
  color: #6b7280;
}

.info-amount {
  color: #3b82f6;
  font-weight: 500;
}

/* Disclaimer */
.disclaimer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.disclaimer-text {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 640px) {
  .bank-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .insurance-toggle {
    width: 100%;
    justify-content: space-between;
  }

  .payment-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .payment-value {
    text-align: left;
  }
}
</style>
