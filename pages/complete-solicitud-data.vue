<template>
  <client-only>
    <ProcessStepper />
    <div class="space-y-6 px-4 sm:px-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-xl sm:text-2xl font-bold text-primary">
          Completa tu información
        </h2>
        <p class="text-gray-700 mt-2">
          Necesitamos algunos datos adicionales para continuar con tu solicitud
          de crédito.
        </p>
      </div>

      <q-card class="glass-card rounded-2xl overflow-hidden">
        <q-card-section class="p-5 sm:p-7">
          <div class="flex items-center gap-3 mb-4">
            <div class="icon-badge icon-badge--secondary">
              <q-icon name="edit_note" size="22px" />
            </div>
            <div>
              <div class="text-base sm:text-lg font-semibold text-slate-900">
                Datos de la solicitud
              </div>
              <div class="text-xs sm:text-sm text-slate-600">
                Completa ingresos, empleo y referencias.
              </div>
            </div>
          </div>

          <ReusableForm
            title="Completa los siguientes datos"
            :fields="fields"
            :form="solicitud"
            submitButtonLabel="Continuar"
            submitButtonIcon="arrow_forward"
            :onSubmit="submitForm"
          />

          <q-banner
            v-if="missingFields.length > 0"
            class="mx-auto bg-red-2 text-red-8 q-mb-md text-center w-max rounded-lg mt-4"
          >
            Faltan los siguientes campos:<br />
            <p v-for="label in missingFields" :key="label">
              {{ label }}
            </p>
          </q-banner>
        </q-card-section>
      </q-card>
    </div>
  </client-only>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { QSpinnerHourglass, useQuasar } from "quasar";
import {
  bankOptions,
  companyTypeOptions,
  creditHistoryDescriptions,
  famRelationTypes,
} from "~/helpers/data";
import { useErrorHandling } from "~/composables/useErrorHandling";
import { showLoading, hideLoading, showNotificationSuccess, showNotificationError, showNotificationWarning } from "~/utils/quasarDialogs";

definePageMeta({
  layout: false,
});

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const flowProcessStore = useFlowProcessStore();
const solicitudStore = useSolicitudStore();

const { notifySentry } = useErrorHandling();

// Get navigation steps
const { getPreviousAndNextStep } = flowProcessStore;
const { previousStep, nextStep } = getPreviousAndNextStep(route.name);

// Reactive reference to the solicitud from store (needed for ReusableForm :form prop)
const solicitud = computed(() => solicitudStore.solicitud);

const isSaving = ref(false);

const normalizeSolicitudForReusableForm = () => {
  if (!solicitudStore.solicitud) return;

  // ReusableForm expects these as arrays (it reads [0])
  if (
    solicitudStore.solicitud.income_source_type &&
    !Array.isArray(solicitudStore.solicitud.income_source_type)
  ) {
    solicitudStore.solicitud.income_source_type = [
      solicitudStore.solicitud.income_source_type,
    ];
  }
  if (
    solicitudStore.solicitud.income_proof &&
    !Array.isArray(solicitudStore.solicitud.income_proof)
  ) {
    solicitudStore.solicitud.income_proof = [
      solicitudStore.solicitud.income_proof,
    ];
  }
  if (!solicitudStore.solicitud.income_source_type)
    solicitudStore.solicitud.income_source_type = [""];
  if (!solicitudStore.solicitud.income_proof)
    solicitudStore.solicitud.income_proof = [""];

  // Ensure optional strings exist so computed setters in ReusableForm don't crash
  solicitudStore.solicitud.current_job_phone =
    solicitudStore.solicitud.current_job_phone || "+52";
  solicitudStore.solicitud.last_job_phone =
    solicitudStore.solicitud.last_job_phone || "+52";
  solicitudStore.solicitud.fam_reference_phone =
    solicitudStore.solicitud.fam_reference_phone || "+52";
  solicitudStore.solicitud.friend_reference_phone =
    solicitudStore.solicitud.friend_reference_phone || "+52";

  // Ensure time fields have default format
  if (!solicitudStore.solicitud.time_current_job)
    solicitudStore.solicitud.time_current_job = "0 years 0 months";
  if (!solicitudStore.solicitud.time_last_job)
    solicitudStore.solicitud.time_last_job = "0 years 0 months";
  if (!solicitudStore.solicitud.friend_reference_time_knowing)
    solicitudStore.solicitud.friend_reference_time_knowing = "0 years";

  // Ensure zip codes are strings
  if (solicitudStore.solicitud.current_job_zip_code)
    solicitudStore.solicitud.current_job_zip_code = String(
      solicitudStore.solicitud.current_job_zip_code
    );
  if (solicitudStore.solicitud.fam_reference_zip_code)
    solicitudStore.solicitud.fam_reference_zip_code = String(
      solicitudStore.solicitud.fam_reference_zip_code
    );
  if (solicitudStore.solicitud.friend_reference_zip_code)
    solicitudStore.solicitud.friend_reference_zip_code = String(
      solicitudStore.solicitud.friend_reference_zip_code
    );
};

// Fields configuration (same as update page)
const fields = [
  { title: "Ingresos" },
  { predefined: "incomeSourceType" },
  { predefined: "incomeProof" },
  { predefined: "monthlyIncome" },
  { predefined: "debtPayFromIncome" },

  { title: "Crediticio" },
  {
    model: "client_credit_history_description",
    label: "Describe tu historial crediticio",
    tooltip:
      "A partir de las siguientes opciones selecciona la que más describa tu situación",
    icon: "description",
    type: "select",
    options: creditHistoryDescriptions,
  },
  {
    model: "clients_banks",
    label: "¿Eres cliente de algún banco?",
    tooltip:
      "Selecciona los bancos de la siguiente lista que seas cliente o ninguno en caso de que no se mencione el tuyo",
    icon: "account_balance",
    type: "select",
    hint: "Puedes seleccionar más de una opción",
    options: bankOptions,
    multiple: true,
  },
  {
    model: "possible_guarantor",
    label: "En caso de ser necesario ¿Puedes conseguir un aval?",
    icon: "supervisor_account",
    options: [
      { label: "No", value: "NO" },
      { label: "Si", value: "Si" },
    ],
    type: "radio",
    mapped: true,
  },

  { title: "Dirección del empleo" },
  { predefined: "streetJobAddress" },
  {
    model: "current_job_interior_number",
    label: "Número interior",
    icon: "home_work",
    type: "text",
  },
  { predefined: "neighborhoodsJob" },

  { title: "Especificación empleo" },
  {
    model: "name_current_job",
    label: "Nombre empresa",
    tooltip:
      "Si conoces la Razón social usa ese nombre, de lo contrario el nombre comercial",
    icon: "work",
    type: "text",
  },
  {
    model: "current_job_business_line",
    label: "¿A qué se dedica la empresa? (Giro de la empresa)",
    tooltip: "Ej. Comercialización de autos, Venta al por menor, Banco...",
    icon: "business",
    type: "text",
  },
  {
    model: "type_company_current_job",
    label: "Tipo de empresa",
    icon: "businesses_center",
    type: "select",
    options: companyTypeOptions,
  },
  {
    model: "current_job_position",
    label: "Cargo que usted desempeña",
    icon: "work",
    type: "text",
  },
  { predefined: "jobPhone" },
  { predefined: "lastJob" },

  { title: "Referencia 1: Familiar que NO viva con usted" },
  {
    model: "fam_reference_names",
    label: "Nombres",
    icon: "people",
    type: "text",
    rules: [(val) => !!val || "Al menos un nombre es obligatorio"],
  },
  {
    model: "fam_reference_first_last_name",
    label: "Apellido paterno",
    icon: "person",
    type: "text",
    rules: [(val) => !!val || "El apellido paterno es obligatorio"],
  },
  {
    model: "fam_reference_second_last_name",
    label: "Apellido materno",
    icon: "person",
    type: "text",
  },
  { predefined: "famReferencePhone" },
  {
    model: "fam_reference_relation",
    label: "Parentezco",
    icon: "group",
    type: "select",
    options: famRelationTypes,
  },
  {
    model: "fam_reference_street_address",
    label: "Dirección completa del domicilio",
    icon: "location_city",
    type: "text",
    rules: [
      (val) => !!val || "La dirección es obligatoria",
      (val) =>
        /^[a-zA-Z0-9\\s]*$/.test(val) ||
        "No se permiten acentos o caracteres que no sean alfanuméricos",
    ],
  },
  { predefined: "neighborhoodsFamReference" },

  { title: "Referencia 2: Conocido y/o amigo" },
  {
    model: "friend_reference_names",
    label: "Nombres",
    icon: "people",
    type: "text",
    rules: [(val) => !!val || "Al menos un nombre es obligatorio"],
  },
  {
    model: "friend_reference_first_last_name",
    label: "Apellido paterno",
    icon: "person",
    type: "text",
    rules: [(val) => !!val || "El apellido paterno es obligatorio"],
  },
  {
    model: "friend_reference_second_last_name",
    label: "Apellido materno",
    icon: "person",
    type: "text",
  },
  { predefined: "friendReferencePhone" },
  { predefined: "friendReferenceTimeKnowing" },
  {
    model: "friend_reference_street_address",
    label: "Dirección completa del domicilio",
    icon: "location_city",
    type: "text",
    rules: [
      (val) => !!val || "La dirección es obligatoria",
      (val) =>
        /^[a-zA-Z0-9\\s]*$/.test(val) ||
        "No se permiten acentos o caracteres que no sean alfanuméricos",
    ],
  },
  { predefined: "neighborhoodsFriendReference" },
];

const shouldAskLastJob = computed(() => {
  const years = parseInt(
    solicitudStore.solicitud?.time_current_job?.split(" ")[0]
  );
  return Number.isFinite(years) && years === 0;
});

// Computed property to check for missing fields (returns labels)
const missingFields = computed(() => {
  const fieldLabels = {
    // income-source
    income_source_type: "Forma de percibir ingresos",
    income_proof: "Comprobación de ingresos",
    monthly_income: "Ingreso mensual",
    debt_pay_from_income: "Pago de deudas mensual",
    client_credit_history_description: "Historial crediticio",
    clients_banks: "Bancos con cuentas activas",
    possible_guarantor: "Aval disponible",
    // job-description
    current_job_street_address: "Dirección del empleo",
    current_job_zip_code: "C.P. del empleo",
    current_job_suburb_colonia: "Colonia del empleo",
    name_current_job: "Nombre de empresa",
    current_job_business_line: "Giro de la empresa",
    current_job_position: "Cargo/Puesto",
    current_job_phone: "Teléfono del trabajo",
    // family reference
    fam_reference_names: "Nombres ref. familiar",
    fam_reference_first_last_name: "Apellido paterno ref. familiar",
    fam_reference_phone: "Teléfono ref. familiar",
    fam_reference_relation: "Parentesco ref. familiar",
    fam_reference_street_address: "Dirección ref. familiar",
    fam_reference_zip_code: "C.P. ref. familiar",
    fam_reference_suburb_colonia: "Colonia ref. familiar",
    // friend reference
    friend_reference_names: "Nombres ref. amigo",
    friend_reference_first_last_name: "Apellido paterno ref. amigo",
    friend_reference_phone: "Teléfono ref. amigo",
    friend_reference_time_knowing: "Tiempo de conocer ref. amigo",
    friend_reference_street_address: "Dirección ref. amigo",
    friend_reference_zip_code: "C.P. ref. amigo",
    friend_reference_suburb_colonia: "Colonia ref. amigo",
  };

  if (shouldAskLastJob.value) {
    fieldLabels.time_last_job = "Tiempo en empleo anterior";
    fieldLabels.name_last_job = "Nombre empleo anterior";
    fieldLabels.last_job_phone = "Teléfono empleo anterior";
  }

  // Get missing field labels
  return Object.entries(fieldLabels)
    .filter(([key]) => {
      const value = solicitudStore.solicitud?.[key];
      if (key === "income_source_type" || key === "income_proof") {
        return !Array.isArray(value) || !value[0];
      }
      if (Array.isArray(value)) return value.length === 0;
      return value === null || value === undefined || value === "";
    })
    .map(([_, label]) => label);
});

const submitForm = async () => {
  if (missingFields.value.length > 0) {
    showNotificationError(
      "Por favor, completa todos los campos obligatorios."
    );
    return;
  }

  showLoading("Guardando información...");
  isSaving.value = true;
  try {
    // Update the solicitud with the form data
    await solicitudStore.updateSolicitud();
    showNotificationSuccess("Información guardada correctamente.");
    
    // Navigate to next step
    if (nextStep) {
      // Pass query parameter to indicate we're coming from the flow
      router.push({ 
        name: nextStep,
        query: { fromFlow: 'true', from: 'complete-solicitud-data' }
      });
    } else {
      showNotificationWarning("No hay siguiente paso configurado.");
    }
    return "proceed";
  } catch (error) {
    notifySentry(error, {
      pageName: "complete-solicitud-data",
      shouldSkipError: () => false,
      additionalContext: {
        operation: "updateSolicitud",
        solicitudId: solicitudStore.solicitud?.id,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      },
    });
    showNotificationError(`Error inesperado: ${error.message || error}`);
  } finally {
    isSaving.value = false;
    hideLoading();
  }
};

// Normalize solicitud data when component mounts
onMounted(() => {
  // Ensure solicitud exists
  if (!solicitudStore.solicitud?.id) {
    showNotificationError(
      "No se encontró la solicitud. Por favor, regresa al paso anterior."
    );
    if (previousStep) {
      setTimeout(() => {
        router.push({ name: previousStep });
      }, 2000);
    }
    return;
  }
  
  normalizeSolicitudForReusableForm();
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(16px);
  box-shadow: 0 25px 50px rgba(2, 6, 23, 0.08), 0 4px 12px rgba(2, 6, 23, 0.04);
}

.icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--q-primary);
}
.icon-badge--secondary {
  background: var(--q-primary);
}

.custom-loading {
  background-color: rgba(0, 0, 0, 1) !important;
  color: white !important;
}
</style>

