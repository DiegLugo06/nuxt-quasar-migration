<template>
  <ClientOnly>
    <ProcessStepper v-if="flowProcess === 'onCreditWeb'" />
    <div class="confirm-data-page">
      <div class="page-container">
        <q-card class="main-card">
          <q-card-section class="header-section">
            <div class="info-header">
              <div class="brand-icon-box">
                <q-icon name="description" size="24px" />
              </div>
              <h1 class="page-title">Confirma los siguientes datos y completa los restantes</h1>
            </div>
          </q-card-section>

          <q-card-section class="form-section">
            <!-- Reusable Form Component -->
            <ReusableForm
              v-if="client && Object.keys(client).length > 0"
              :fields="fields"
              :form="client"
              :submitButtonLabel="
                hasClientDataChanged() ? 'Actualizar datos' : 'Siguiente'
              "
              :submitButtonIcon="hasClientDataChanged() ? 'save' : 'arrow_forward'"
              :onSubmit="submitForm"
              backButtonLabel="Regresar"
              backButtonIcon="arrow_back"
            />
            <!-- Banner to show missing fields -->
            <q-banner
              v-if="missingFields.length > 0"
              class="missing-fields-banner"
            >
              Faltan los siguientes campos:<br />
              <p v-for="value in missingFields" :key="value">{{ value }}</p>
            </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { QSpinnerHourglass, useQuasar } from "quasar";
import { statesOfMexico } from "~/helpers/data";
import { trackUpdateConfirmPersonalData } from "~/helpers/track_events";
import { useErrorHandling } from "~/composables/useErrorHandling";
import { errorConditions } from "~/utils/errorConditions";
import { showLoading, hideLoading } from "~/utils/quasarDialogs";

const { $posthog } = useNuxtApp();
const $q = useQuasar();
const router = useRouter();
const clientStore = useClientStore();
const userStore = useUserStore();
const processStore = useFlowProcessStore();
const motorcycleStore = useMotorcycleStore();
const solicitudStore = useSolicitudStore();
const reportStore = useReportStore();

const { client, updateClientData, generateRfc, getNeighborhoods } = clientStore;
const user_id = userStore.user.id;
const { flowProcess } = processStore;
const { report } = reportStore;

console.log('[confirm-data] Page setup started');
console.log('[confirm-data] Client store:', client);
console.log('[confirm-data] Client sex value:', client.sex, 'Type:', typeof client.sex);

// Initialize radio field values to prevent _withMods errors
// Ensure sex field is always defined (even if null)
if (client.sex === undefined) {
  console.log('[confirm-data] Client sex was undefined, setting to null');
  client.sex = null
} else {
  console.log('[confirm-data] Client sex is defined:', client.sex);
}

const originalClientData = ref({});

const piniaStores = {
  user: useUserStore(),
  solicitud: useSolicitudStore(),
  flow: useFlowProcessStore(),
  client: useClientStore(),
  motorcycle: useMotorcycleStore(),
};

const { notifySentry } = useErrorHandling();

// Form fields configuration
const fields = [
  {
    predefined: "phone",
    disable: !!report.id,
  },
  {
    model: "email",
    label: "Correo electrónico",
    icon: "email",
    type: "email",
    rules: [(val) => !!val || "El correo es obligatorio"],
    disable: true,
  },
  {
    model: "name",
    label: "Primer nombre",
    icon: "person",
    rules: [(val) => !!val || "El primer nombre es obligatorio"],
    type: "text",
  },
  {
    model: "second_name",
    label: "Segundo nombre (Si aplica)",
    icon: "person_outline",
    type: "text",
  },
  {
    model: "first_last_name",
    label: "Apellido paterno",
    icon: "person",
    rules: [(val) => !!val || "El apellido paterno es obligatorio"],
    type: "text",
  },
  {
    model: "second_last_name",
    label: "Apellido materno",
    icon: "person_outline",
    type: "text",
  },
  {
    model: "birth_date",
    label: "Fecha de nacimiento",
    icon: "event",
    type: "date",
    mask: "YYYY/MM/DD",
  },
  {
    model: "born_state",
    label: "Estado de nacimiento",
    icon: "location_city",
    type: "select",
    options: statesOfMexico,
  },
  {
    model: "sex",
    label: "Sexo",
    icon: "wc",
    rules: [(val) => !!val || "El sexo es obligatorio"],
    options: [
      { label: "Masculino", value: "M" },
      { label: "Femenino", value: "F" },
    ],
    type: "radio",
    mapped: true,
  },
  {
    title: "Domicilio",
  },
  {
    subTitle:
      "De preferencia utiliza el domicilio que tengas en tus comprobantes",
  },
  {
    predefined: "streetAddress",
  },
  {
    model: "interior_number",
    label: "Número interior",
    icon: "meeting_room",
    rules: [
      (val) =>
        !val ||
        /^[a-zA-Z0-9\s]*$/.test(val) ||
        "No se permiten acentos o caracteres que no sean alfanuméricos",
      (val) => !val || val.length < 10 || "No se permiten más de 10 caracteres",
    ],
    type: "text",
  },
  {
    predefined: "neighborhoods",
  },
  {
    model: "housing_status",
    label: "Estado de vivienda",
    icon: "home",
    type: "select",
    options: ["Propia", "Rentada", "Hipoteca", "Con Familiares", "Otros"],
  },
  {
    predefined: "timeLivingThere",
  },
];

// Function to check if client data has changed
const hasClientDataChanged = () => {
  return Object.keys(client).some(
    (key) => client[key] !== originalClientData.value[key]
  );
};

// Computed property to check for missing fields
const missingFields = computed(() => {
  const fieldLabels = {
    name: "Nombre",
    first_last_name: "Primer Apellido",
    second_last_name: "Segundo Apellido",
    birth_date: "Fecha de Nacimiento",
    sex: "Sexo",
    email: "Correo Electrónico",
    phone: "Teléfono",
    street_address: "Dirección",
    zip_code: "Código Postal",
    rfc: "RFC",
    suburb_colonia: "Colonia",
    housing_status: "Estado de vivienda",
  };
  return Object.entries(fieldLabels)
    .filter(([key]) => client[key] === "" || client[key] == null)
    .map(([_, label]) => label);
});

// Helper function to show notifications
const showNotification = (type, message) => {
  $q.notify({ type, message, position: "top" });
};

// Submit form handler
const submitForm = async () => {
  if (missingFields.value.length > 0) {
    showNotification(
      "negative",
      "Por favor, completa todos los campos obligatorios."
    );
    return;
  }

  try {
    if (hasClientDataChanged()) {
      showLoading("Actualizando información del usuario...");
      await updateClientData(user_id);
      showNotification("positive", "Información actualizada correctamente.");

      // Track data update with PostHog
      if ($posthog) {
        const posthog = $posthog();
        trackUpdateConfirmPersonalData(posthog);
      }
    }

    // Set cliente_id in solicitudStore if not already set
    if (client.id && !solicitudStore.solicitud.cliente_id) {
      solicitudStore.solicitud.cliente_id = client.id;
    }

    // Handle motorcycle data sync for assistedQuote flow
    if (processStore.flowProcess === "assistedQuote") {
      const motorcycleData = {
        brand_motorcycle:
          motorcycleStore.motorcycleById?.brand || motorcycleStore.form.brand,
        model_motorcycle:
          motorcycleStore.motorcycleById?.model || motorcycleStore.form.model,
        year_motorcycle:
          motorcycleStore.motorcycleById?.year || motorcycleStore.form.year,
        invoice_motorcycle_value: motorcycleStore.motorcyclePrice,
        percentage_down_payment:
          (parseInt(motorcycleStore.form.downPayment) || 20) / 100,
        time_to_buy_motorcycle: motorcycleStore.timeToBuyMotorcycle,
        finance_term_months:
          piniaStores.flow.getMotorcycleData?.()?.finance_term_months,
      };

      Object.assign(solicitudStore.solicitud, motorcycleData);
      if (solicitudStore.solicitud.id) {
        await solicitudStore.updateSolicitud();
      }
    }

    return "proceed";
  } catch (error) {
    if (
      error.response?.data?.error == "A client with this phone already exists."
    ) {
      showNotification(
        "negative",
        "El número de telefono que estás tratando actualizar ya se encuentra registrado"
      );
      router.push({ name: "confirm-data" });
      return;
    }
    notifySentry(error, {
      pageName: "confirm-data",
      shouldSkipError: errorConditions["confirm-data"],
    });
    showNotification("negative", `Error inesperado: ${error.message || error}`);
  } finally {
    hideLoading();
  }
};

onMounted(async () => {
  console.log('[confirm-data] onMounted started');
  console.log('[confirm-data] Client in onMounted:', client);
  console.log('[confirm-data] Client sex in onMounted:', client.sex);
  
  try {
    // Generate RFC if not already set
    if (!client.rfc) {
      console.log('[confirm-data] Generating RFC...');
      await generateRfc();
    }

    // Fetch neighborhoods if ZIP code is valid
    if (client.zip_code?.length === 5) {
      console.log('[confirm-data] Fetching neighborhoods...');
      showLoading("Cargando colonias...");
      await getNeighborhoods();
      hideLoading();
    }

    // Store the original client data for comparison
    originalClientData.value = { ...client };
    console.log('[confirm-data] Original client data stored:', originalClientData.value);
    console.log('[confirm-data] onMounted completed successfully');
  } catch (error) {
    console.error('[confirm-data] Error in onMounted:', error);
    notifySentry(error, {
      pageName: "confirm-data",
      shouldSkipError: errorConditions["confirm-data"],
    });
    if (error.response?.data?.error == "No data found for this zip code") {
      showNotification(
        "negative",
        "Código postal no encontrado, favor de validarlo"
      );
    } else {
      showNotification(
        "negative",
        "Error al cargar los datos iniciales." + error
      );
    }
    hideLoading();
  }
});
</script>

<style scoped>
.confirm-data-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 1rem;
  padding-top: calc(1rem + 80px + 94px); /* Account for navbar + stepper */
  padding-bottom: 2rem;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.main-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
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

.header-section {
  padding: 2rem 1.5rem 1rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.brand-icon-box {
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

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #242424;
  margin: 0;
  line-height: 1.3;
  text-align: center;
}

@media (min-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
}

.form-section {
  padding: 1rem 1.5rem 2rem;
}

.missing-fields-banner {
  margin-top: 1.5rem;
  background: rgba(239, 68, 68, 0.1) !important;
  color: #dc2626 !important;
  border-radius: 0.75rem;
  text-align: center;
  padding: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.missing-fields-banner :deep(.q-banner__content) {
  color: #dc2626 !important;
}

/* Style ReusableForm buttons to match design pattern */
/* Target buttons within the form section */
.form-section :deep(.q-btn) {
  min-height: 48px !important;
  max-height: 48px !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  border-radius: 0.75rem !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
}

/* Submit/Forward Button (Primary - Green Gradient) */
.form-section :deep(.q-btn[type="submit"]) {
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%) !important;
  color: #242424 !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(47, 255, 150, 0.3) !important;
}

.form-section :deep(.q-btn[type="submit"] .q-btn__content),
.form-section :deep(.q-btn[type="submit"] .q-btn__label),
.form-section :deep(.q-btn[type="submit"] .q-icon),
.form-section :deep(.q-btn[type="submit"] span),
.form-section :deep(.q-btn[type="submit"] .q-btn__wrapper) {
  color: #242424 !important;
}

.form-section :deep(.q-btn[type="submit"]:hover:not(:disabled)) {
  background: linear-gradient(135deg, #26e085 0%, #1fb870 100%) !important;
  box-shadow: 0 6px 16px rgba(47, 255, 150, 0.4) !important;
  transform: translateY(-2px);
}

.form-section :deep(.q-btn[type="submit"]:hover:not(:disabled) .q-btn__content),
.form-section :deep(.q-btn[type="submit"]:hover:not(:disabled) .q-btn__label),
.form-section :deep(.q-btn[type="submit"]:hover:not(:disabled) .q-icon),
.form-section :deep(.q-btn[type="submit"]:hover:not(:disabled) span),
.form-section :deep(.q-btn[type="submit"]:hover:not(:disabled) .q-btn__wrapper) {
  color: #242424 !important;
}

.form-section :deep(.q-btn[type="submit"]:active:not(:disabled)) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(47, 255, 150, 0.3) !important;
}

.form-section :deep(.q-btn[type="submit"]:disabled) {
  background: #d1d5db !important;
  color: #9ca3af !important;
  cursor: not-allowed;
  box-shadow: none !important;
}

/* Back Button (Outline style - Gray Border) */
/* Target the button that is NOT type="submit" and has the back icon */
.form-section :deep(.q-btn:not([type="submit"])) {
  border: 2px solid #e2e8f0 !important;
  background: white !important;
  color: #242424 !important;
}

.form-section :deep(.q-btn:not([type="submit"]):hover:not(:disabled)) {
  border-color: #cbd5e1 !important;
  background: #f8fafc !important;
  transform: translateY(-2px);
}

.form-section :deep(.q-btn:not([type="submit"]):active:not(:disabled)) {
  transform: translateY(0);
}

/* Style form inputs */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 0.75rem;
  background: #fcfcfc;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s ease;
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  background: #ffffff;
  border-color: #242424;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.q-field__native),
:deep(.q-field__input) {
  font-weight: 600;
  color: #242424;
}

:deep(.q-field__label) {
  color: #242424;
  font-weight: 500;
  opacity: 0.7;
}

.custom-input {
  background-color: white;
  border-radius: 0.75rem;
  padding-left: 1.75rem;
  padding-right: 1.75rem;
  height: 75px;
  font-size: 16px;
}

.custom-loading {
  background-color: rgba(0, 0, 0, 1) !important;
  color: white !important;
}

@media (max-width: 640px) {
  .confirm-data-page {
    padding: 0.75rem;
    padding-top: calc(0.75rem + 80px + 94px);
  }

  .header-section {
    padding: 1.5rem 1rem 0.75rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .form-section {
    padding: 0.75rem 1rem 1.5rem;
  }
}
</style>

