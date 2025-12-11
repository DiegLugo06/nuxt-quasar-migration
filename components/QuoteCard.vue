<template>
  <q-card
    class="quote-card-banner shadow-8"
    :style="{ borderTop: '8px solid ' + primaryColor }"
  >
    <q-card-section class="bg-white q-py-lg">
      <div class="text-h6 text-bold q-mb-xs" :style="{ color: primaryColor }">
        {{ title }}
      </div>
      <div class="text-subtitle2 text-grey-7 q-mb-md">{{ subtitle }}</div>
      <div class="row items-center justify-between q-py-md weekly-payment-section">
        <div class="text-h4 text-bold" :style="{ color: primaryColor }">
          $ {{ formatCurrency(weeklyPayment) }}
        </div>
        <div class="text-h6 text-grey-8">
          <q-icon name="schedule" class="q-mr-xs" />
          Semanal
        </div>
      </div>
      <q-separator class="q-my-sm" />
      <div class="row items-center justify-between q-pt-md">
        <div class="text-body2 text-grey-7">
          Plazo: <span class="text-bold">{{ term }}</span>
        </div>
        <q-btn
          label="Detalles"
          color="primary"
          outline
          round
          icon="arrow_forward"
          size="sm"
          class="q-ml-md"
          @click="handleViewDetails"
        />
      </div>
    </q-card-section>
    <q-card-section class="bg-grey-1 q-pa-sm text-center">
      <div class="row items-center no-wrap">
        <div class="col-3 text-left">
          <img
            v-if="lenderLogo"
            :src="lenderLogo"
            alt="Lender Logo"
            style="height: 24px"
          />
          <q-icon v-else name="account_balance" size="24px" class="text-grey-6" />
        </div>
        <div class="col-9 text-right text-caption text-grey-6">
          Financiado por <strong>{{ lenderName }}</strong>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  weeklyPayment: {
    type: [String, Number],
    required: true,
  },
  term: {
    type: String,
    required: true,
  },
  lenderLogo: {
    type: String,
    default: "",
  },
  lenderName: {
    type: String,
    required: true,
  },
  primaryColor: {
    type: String,
    default: "#004BA0",
  },
});

const emit = defineEmits(["viewDetails"]);

const formatCurrency = (value) => {
  if (!value) return '0.00'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const handleViewDetails = () => {
  emit("viewDetails");
};
</script>

<style scoped>
/* Quote Card Banner Styling */
.quote-card-banner {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.quote-card-banner:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 75, 160, 0.2) !important;
}

/* Weekly Payment Highlight */
.weekly-payment-section {
  background-color: rgba(0, 75, 160, 0.05);
  padding: 15px 10px;
  border-radius: 8px;
}

/* Responsive adjustments for the card */
@media (max-width: 600px) {
  .weekly-payment-section .text-h4 {
    font-size: 1.75rem;
  }
}
</style>
