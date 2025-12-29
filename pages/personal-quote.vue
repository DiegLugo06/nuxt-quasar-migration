<template>
  <ClientOnly>
    <ProcessStepper v-if="showStepper" />
    <div class="personal-quote-container">
      <div class="main-card">
        <div class="step-content">
          <div class="info-card">
            <div class="info-header">
              <div class="brand-icon-box">
                <q-icon name="description" size="24px" />
              </div>
              <h3 class="info-title">Documentos requeridos</h3>
            </div>

            <div class="requirements-list">
              <div v-for="(req, index) in requirements" :key="index" class="requirement-item">
                <div class="req-indicator"></div>
                <div class="requirement-icon-wrapper">
                  <q-icon :name="req.icon" size="20px" />
                </div>
                <span class="requirement-text">{{ req.text }}</span>
              </div>
            </div>
          </div>

          <div class="navigation-buttons">
            <q-btn outline class="nav-button back-btn" @click="router.push({ name: previousStep })">
              <q-icon name="arrow_back" class="q-mr-sm" /> Regresar
            </q-btn>
            <q-btn unelevated class="nav-button continue-btn" @click="router.push({ name: nextStep })">
              Continuar <q-icon name="arrow_forward" class="q-ml-sm" />
            </q-btn>
          </div>

          <div class="help-section">
            <q-btn flat class="help-link" icon="sms" @click="sendWhatsAppMessage('Hola tengo algunas dudas sobre el proceso.', getPhoneNumber())">
              ¿Dudas? Hablar con asesor
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { onMounted, nextTick, computed } from "vue";
import { useFlowProcessStore } from "@/stores/flowProcessStore";
import { useUserStore } from "@/stores/userStore";
import { useClientStore } from "@/stores/clientStore";
import { useMotorcycleStore } from "@/stores/motorcycleStore";
import { useSolicitudStore } from "@/stores/solicitudStore";
import { sendWhatsAppMessage } from "~/utils/whatsapp";
import ProcessStepper from "@/components/ProcessStepper.vue";

const router = useRouter();
const route = useRoute();
const flowProcessStore = useFlowProcessStore();

// Computed property to check if stepper should be shown
const showStepper = computed(() => {
  const shouldShow = flowProcessStore.flowProcess === 'onCreditWeb'
  console.log('[personal-quote] FlowProcess:', flowProcessStore.flowProcess)
  console.log('[personal-quote] Should show stepper:', shouldShow)
  console.log('[personal-quote] Routes:', flowProcessStore.routes)
  return shouldShow
})

const { previousStep, nextStep } = flowProcessStore.getPreviousAndNextStep(
  route.name as string
);

const piniaStores = {
  user: useUserStore(),
  flow: useFlowProcessStore(),
  client: useClientStore(),
  motorcycle: useMotorcycleStore(),
  solicitud: useSolicitudStore(),
};

// Requirements list - using computed to ensure reactivity
const requirements = computed(() => [
  { icon: 'store', text: 'Sucursal donde te gustaría ser atendido' },
  { icon: 'badge', text: 'INE o CURP' },
  { icon: 'home', text: 'Domicilio' },
  { icon: 'verified_user', text: 'Autorizar Consulta Buro de Crédito' },
]);

// Get phone number with fallback logic
const getPhoneNumber = () => {
  const DEFAULT_PHONE = "5610194726";
  const FINVA_PHONE = "5610534973";

  // If flowProcess is onCreditWeb use finva phone
  if (
    piniaStores.flow.flowProcess == "onCreditWeb" ||
    piniaStores.flow.flowProcess == "sferaProcess"
  ) {
    return FINVA_PHONE;
  }

  // If finvaAgent has phone_number, use it
  if (piniaStores.user.finvaAgent?.phone_number) {
    return piniaStores.user.finvaAgent.phone_number.replace("+52", "");
  }

  // If user has phone_number, use it
  if (piniaStores.user.user?.phone_number) {
    return piniaStores.user.user.phone_number.replace("+52", "");
  }

  // Otherwise use default phone
  return DEFAULT_PHONE;
};

onMounted(async () => {
  // Check if this is an assisted quote process
  const urlParams = new URLSearchParams(window.location.search);
  const process = urlParams.get("process");
  const portalRegistration = urlParams.get("portalRegistration");

  if (process === "assistedQuote" || portalRegistration === "True") {
    // Set the flow process
    piniaStores.flow.$patch((state) => {
      state.flowProcess = "assistedQuote";
    });
    await nextTick();
    piniaStores.flow.$persist();

    // Pre-fill client data from URL parameters
    const clientPhone = urlParams.get("clientPhone");
    const clientEmail = urlParams.get("clientEmail");

    // Update client data using $patch
    piniaStores.client.$patch((state) => {
      if (clientPhone) {
        state.client.phone = `+52${clientPhone.replace(/\D/g, "")}`;
      }
      if (clientEmail) {
        state.client.email = clientEmail;
      }
    });

    // Force persistence to sessionStorage for clientStore
    await nextTick();
    piniaStores.client.$persist();

    // Store motorcycle and financing data in flowProcessStore
    const motorcycleData = {
      brand_motorcycle: urlParams.get("brand_motorcycle"),
      model_motorcycle: urlParams.get("model_motorcycle"),
      year_motorcycle: urlParams.get("year_motorcycle"),
      invoice_motorcycle_value: urlParams.get("invoice_motorcycle_value"),
      finance_term_months: urlParams.get("loanTerm"),
      insurance_payment: urlParams.get("insurance_payment"),
      time_to_buy_motorcycle: urlParams.get("time_to_buy_motorcycle"),
      registration_process: "assistedQuote",
    };

    // Set motorcycle data in flowProcessStore (this will be persisted to sessionStorage)
    piniaStores.flow.setMotorcycleData(motorcycleData);

    // Also update motorcycleStore with the data (including motorcycleId for internal use)
    const motorcycleId = urlParams.get("motorcycleId");

    // Use Object.assign to update motorcycleStore fields
    const motorcycleUpdates: any = {};

    if (motorcycleId) {
      motorcycleUpdates.motorcycleId = parseInt(motorcycleId);
    }
    if (motorcycleData.brand_motorcycle) {
      motorcycleUpdates.brandName = motorcycleData.brand_motorcycle;
      motorcycleUpdates.form = {
        ...piniaStores.motorcycle.form,
        brand: motorcycleData.brand_motorcycle,
      };
    }
    if (motorcycleData.model_motorcycle) {
      motorcycleUpdates.form = {
        ...(motorcycleUpdates.form || piniaStores.motorcycle.form),
        model: motorcycleData.model_motorcycle,
      };
    }
    if (motorcycleData.year_motorcycle) {
      motorcycleUpdates.form = {
        ...(motorcycleUpdates.form || piniaStores.motorcycle.form),
        year: parseInt(motorcycleData.year_motorcycle),
      };
    }
    if (motorcycleData.invoice_motorcycle_value) {
      motorcycleUpdates.form = {
        ...(motorcycleUpdates.form || piniaStores.motorcycle.form),
        price: motorcycleData.invoice_motorcycle_value,
      };
    }

    // Apply all updates at once using $patch
    piniaStores.motorcycle.$patch((state: any) => {
      if (motorcycleUpdates.motorcycleId !== undefined) {
        state.motorcycleId = motorcycleUpdates.motorcycleId;
      }
      if (motorcycleUpdates.brandName !== undefined) {
        state.brandName = motorcycleUpdates.brandName;
      }
      if (motorcycleUpdates.form) {
        Object.assign(state.form, motorcycleUpdates.form);
      }
    });

    // Force persistence to sessionStorage for motorcycleStore
    await nextTick();
    piniaStores.motorcycle.$persist();

    // Sync motorcycle data to solicitudStore with correct field names (excluding motorcycleId)

    // Use Object.assign to update all fields at once
    const solicitudUpdates: any = {};

    if (motorcycleData.brand_motorcycle) {
      solicitudUpdates.brand_motorcycle = motorcycleData.brand_motorcycle;
    }
    if (motorcycleData.model_motorcycle) {
      solicitudUpdates.model_motorcycle = motorcycleData.model_motorcycle;
    }
    if (motorcycleData.year_motorcycle) {
      solicitudUpdates.year_motorcycle = parseInt(motorcycleData.year_motorcycle);
    }
    if (motorcycleData.invoice_motorcycle_value) {
      solicitudUpdates.invoice_motorcycle_value = parseInt(
        motorcycleData.invoice_motorcycle_value
      );
    }
    if (motorcycleData.finance_term_months) {
      solicitudUpdates.finance_term_months = motorcycleData.finance_term_months;
    }
    if (motorcycleData.insurance_payment) {
      solicitudUpdates.insurance_payment = motorcycleData.insurance_payment;
    }
    if (motorcycleData.time_to_buy_motorcycle) {
      solicitudUpdates.time_to_buy_motorcycle =
        motorcycleData.time_to_buy_motorcycle;
    }
    if (motorcycleData.registration_process) {
      solicitudUpdates.registration_process =
        motorcycleData.registration_process;
    }

    // Apply all updates at once using $patch
    piniaStores.solicitud.$patch((state: any) => {
      Object.assign(state.solicitud, solicitudUpdates);
    });

    // Force persistence to sessionStorage
    await nextTick();
    piniaStores.solicitud.$persist();

    // Update solicitud in backend if it already exists
    if (piniaStores.solicitud.solicitud.id) {
      try {
        await piniaStores.solicitud.updateSolicitud();
      } catch (error) {
        // Error handling is done by the store
        console.error("Error updating solicitud:", error);
      }
    }
  }
});
</script>

<style scoped>
/* Inter Font - Global */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

.personal-quote-container {
  min-height: 100vh;
  background: #fcfcfc;
  padding: 120px 1rem 3rem; /* Adjust based on stepper height */
  display: flex;
  justify-content: center;
}

/* Main Card */
.main-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(36, 36, 36, 0.08);
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
}

/* Brand Accent Line */
.main-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #242424 0%, #2FFF96 100%);
  z-index: 1;
}

/* Step Content */
.step-content {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
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

.step-header {
  margin-bottom: 2rem;
  text-align: center;
}

.step-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, rgba(36, 36, 36, 0.04) 0%, rgba(47, 255, 150, 0.04) 100%);
  border: 2px solid rgba(36, 36, 36, 0.08);
  border-radius: 1rem;
  margin-bottom: 1.25rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.step-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(47, 255, 150, 0.15) 0%, transparent 70%);
  transition: transform 0.4s ease;
}

.step-icon-wrapper:hover {
  border-color: #2FFF96;
  transform: scale(1.05);
}

.step-icon-wrapper:hover::before {
  transform: translate(-50%, -50%) scale(1);
}

.step-icon {
  color: #242424;
  font-size: 1.75rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-icon-wrapper:hover .step-icon {
  color: #2FFF96;
  filter: drop-shadow(0 2px 4px rgba(47, 255, 150, 0.3));
}

.step-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #242424;
  margin: 0 0 0.625rem 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.step-description {
  font-size: 1rem;
  color: rgba(36, 36, 36, 0.7);
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

/* Info Card */
.info-card {
  padding: 2rem 1.5rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.brand-icon-box {
  color: #242424;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #242424;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Requirements List */
.requirements-list {
  display: flex;
  flex-direction: column;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 1rem;
  margin-bottom: 12px;
  background: #fbfbfb;
  border-radius: 16px;
  border: 1px solid #f1f1f1;
  transition: all 0.3s ease;
  position: relative;
}

.requirement-item:hover {
  transform: translateX(8px);
  border-color: #2FFF96;
  background: white;
}

.req-indicator {
  width: 4px;
  height: 100%;
  background: transparent;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.requirement-item:hover .req-indicator {
  background: #2FFF96;
}

.requirement-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #242424;
  color: #2FFF96;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.requirement-text {
  font-size: 0.875rem;
  color: #242424;
  font-weight: 500;
  flex: 1;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0 1.5rem;
}

.nav-button {
  flex: 1;
  height: 52px;
  border-radius: 14px;
  font-weight: 800;
  text-transform: none;
  transition: all 0.3s ease;
}

.continue-btn {
  background: #2FFF96 !important;
  color: #242424 !important;
  box-shadow: 0 8px 15px rgba(47, 255, 150, 0.2) !important;
}

.continue-btn:hover {
  box-shadow: 0 10px 20px rgba(47, 255, 150, 0.3) !important;
  transform: translateY(-2px);
}

.back-btn {
  border: 2px solid #242424 !important;
  color: #242424 !important;
  background: white !important;
}

.back-btn:hover {
  background: #f8fafc !important;
  border-color: #242424 !important;
}

/* Help Section */
.help-section {
  margin-top: 20px;
  text-align: center;
  border-top: 1px dashed #eee;
  padding: 16px 1.5rem 0 1.5rem;
}

.help-link {
  color: #666;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: none;
}

.help-link:hover {
  color: #242424;
}

/* Responsive */
@media (min-width: 768px) {
  .personal-quote-container {
    padding: 2.5rem;
    padding-top: calc(2.5rem + 200px); /* Account for MotorcyclePreview + ProcessStepper */
    max-width: 50rem;
    margin: 0 auto;
  }

  .step-content {
    padding: 1.75rem 1.5rem;
  }

  .info-card {
    padding: 1.75rem;
    margin-bottom: 1.75rem;
  }

  .navigation-buttons {
    flex-wrap: nowrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .personal-quote-container {
    max-width: 68rem;
    padding-top: calc(2.5rem + 200px); /* Account for MotorcyclePreview + ProcessStepper */
  }

  .main-card {
    border-radius: 2.5rem;
  }
}

</style>

