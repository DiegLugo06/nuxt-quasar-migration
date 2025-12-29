<template>
  <ClientOnly>
    <ProcessStepper />
    <div class="flex flex-col justify-center items-center">
      <div class="px-4 pb-4 rounded-md space-y-4 max-w-2xl">
        <!-- Explanation Section -->
        <q-card flat bordered class="p-4">
          <h3 class="text-lg font-semibold text-primary mb-3 text-center">
            ¿Por qué hacemos una consulta a tu Buró de Crédito?
          </h3>
          <div class="space-y-3 text-gray-700 text-start">
            <ul class="list-disc pl-5 space-y-2">
              <li>
                Muy sencillo, solo queremos darte la mejor oferta de crédito
                para ti, así es, personalizada
              </li>
              <li>
                Con tu perfil crediticio buscamos varias opciones y encontramos
                la mejor para ti
              </li>
              <li>
                No te preocupes por tu información, la resguardamos con los más
                altos estándares de seguridad y privacidad
              </li>
            </ul>
          </div>
        </q-card>

        <!-- Primera caja: Términos y validación de NIP -->
        <q-card v-if="!firstValidate" flat bordered class="p-1">
          <q-card-section
            v-if="!firstValidate"
            class="flex flex-col items-center text-center space-y-3"
          >
            <p class="text-center">
              Ingrese el NIP obtenido vía Whatsapp al número {{ client.phone }}
            </p>
            <q-input
              v-model="nip"
              placeholder="NIP"
              outlined
              class="custom-input"
              :disable="firstValidate"
              maxlength="6"
              type="tel"
            />
            <div class="flex flex-row">
              <label>
                <q-checkbox
                  v-model="termsAccepted"
                  @update:model-value="(val) => {
                    console.log('[buro-credito-request] Terms checkbox @update:model-value:', {
                      newValue: val,
                      type: typeof val,
                      previousValue: termsAccepted.value
                    });
                    startTimer();
                  }"
                />
                <span class="space-x-2">
                  Acepto los
                  <a
                    href="https://www.kiban.com/terminos-condiciones"
                    class="text-blue-500 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    términos y condiciones
                  </a>
                  y cláusula de medios electrónicos tales como NIP.
                </span>
              </label>
            </div>
            <div class="flex space-x-1">
              <q-btn
                class="rounded-full"
                :class="{ 'text-xs': isMobileScreen, 'text-md': !isMobileScreen }"
                icon="restart_alt"
                :disable="!termsAccepted || firstValidate || isTimerActive"
                @click="sendNipRequest"
                color="primary"
                label="Reenviar NIP"
                :loading="loadingSendNip"
              />
              <q-btn
                class="rounded-full"
                :class="{ 'text-xs': isMobileScreen, 'text-md': !isMobileScreen }"
                icon="done"
                :disable="!canValidateNip"
                @click="validateNipRequest"
                color="primary"
                label="Validar"
                :loading="loadingValidateNip"
              />
            </div>

            <!-- Timer Label -->
            <span
              v-if="isTimerActive"
              class="text-gray-600 text-sm mt-2 text-center"
            >
              Tiempo restante para reenviar NIP: {{ timeRemaining }} segundos
            </span>
          </q-card-section>
        </q-card>

        <!-- Segunda caja: Autorización (solo visible después de validar primer NIP) -->
        <q-card v-if="firstValidate" flat bordered class="p-4">
          <q-card-section>
            <p class="text-xs mb-4">
              Por este conducto, autorizo expresamente a Nkonect S.A. de C.V.
              para que a través de sus funcionarios facultados lleve a cabo
              investigaciones sobre mi comportamiento crediticio en las
              Sociedades de Información Crediticia que estime conveniente.
              <br /><br />
              Asimismo, declaro que conozco la naturaleza y alcance de la
              información que se solicitará, del uso que Nkonect S.A. de C.V.
              hará de tal información y de que ésta podrá realizar consultas
              periódicas de mi historial crediticio, consintiendo que esta
              autorización se encuentre vigente por un período de 3 años
              contados a partir de la fecha de su expedición y en todo caso
              durante el tiempo que mantengamos relación jurídica.
            </p>

            <q-input
              v-model="nipAuth"
              placeholder="Autorizar (con el mismo NIP verificado)"
              outlined
              class="bg-white text-black rounded-md custom-input mb-4"
              maxlength="6"
              mask="######"
            />

            <q-btn
              class="rounded-full w-full"
              :class="{ 'text-xs': $q.screen.xs, 'text-md': !$q.screen.xs }"
              icon="done_all"
              @click="confirmNipValidation"
              color="primary"
              label="Autorizar"
              :disable="!nipAuth || nipAuth.length !== 6"
              :loading="loadingConfirmNip"
            />
          </q-card-section>
        </q-card>
      </div>

      <q-btn
        class="rounded-full mt-4"
        :class="{ 'text-xs': $q.screen.xs, 'text-md': !$q.screen.xs }"
        icon="arrow_back"
        @click="backToLastStep"
        color="primary"
        label="Regresar"
      />
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { QSpinnerHourglass, useQuasar } from "quasar";
import { trackQueryInsertBC, trackSendSolicitud } from "~/helpers/track_events";
import { trackApiError } from "~/helpers/error_tracking";
import { COOKIE_CONFIG } from "~/utils/cookieConfig";
import { useErrorHandling } from "~/composables/useErrorHandling";
import { errorConditions } from "~/utils/errorConditions";
import { showLoading, hideLoading, showNotificationSuccess, showNotificationError, showNotificationWarning } from "~/utils/quasarDialogs";

console.log('[buro-credito-request] Imports loaded');
console.log('[buro-credito-request] useQuasar imported:', typeof useQuasar);

const { $posthog } = useNuxtApp();
console.log('[buro-credito-request] Initializing Quasar...');
const $q = useQuasar();
console.log('[buro-credito-request] $q initialized:', !!$q);
console.log('[buro-credito-request] $q type:', typeof $q);
console.log('[buro-credito-request] $q.screen exists:', $q?.screen ? 'yes' : 'no');
console.log('[buro-credito-request] $q.screen type:', typeof $q?.screen);
const router = useRouter();
const route = useRoute();
const clientStore = useClientStore();
const reportStore = useReportStore();

// Computed property for screen size to prevent undefined errors
const isMobileScreen = computed(() => {
  console.log('[buro-credito-request] isMobileScreen computed - checking...');
  console.log('[buro-credito-request] $q exists:', !!$q);
  if (!$q) {
    console.warn('[buro-credito-request] $q is undefined in isMobileScreen computed');
    return false;
  }
  console.log('[buro-credito-request] $q.screen exists:', !!$q.screen);
  if (!$q.screen) {
    console.warn('[buro-credito-request] $q.screen is undefined in isMobileScreen computed');
    return false;
  }
  console.log('[buro-credito-request] $q.screen.xs exists:', $q.screen.xs !== undefined);
  const isMobile = $q.screen.xs || false;
  console.log('[buro-credito-request] isMobileScreen result:', isMobile);
  return isMobile;
});
const solicitudStore = useSolicitudStore();
const userStore = useUserStore();
const flowProcessStore = useFlowProcessStore();
const { notifySentry } = useErrorHandling();

const { client } = clientStore;
const { report, sendNip, validateNip, requestBc } = reportStore;
const { solicitud, createSolicitud } = solicitudStore;
const { user, registration_mode, finvaAgent } = userStore;
const { getPreviousAndNextStep } = flowProcessStore;
const { previousStep, nextStep } = getPreviousAndNextStep(route.name);

// Reactive state
const nip = ref("");
const nipAuth = ref("");
const id = ref(null);
const termsAccepted = ref(false);
const firstValidate = ref(false);
const isTimerActive = ref(false);
const timeRemaining = ref(15);

console.log('[buro-credito-request] Initial state:', {
  nip: nip.value,
  termsAccepted: termsAccepted.value,
  firstValidate: firstValidate.value
});

// Watch for NIP changes
watch(nip, (newValue, oldValue) => {
  console.log('[buro-credito-request] NIP changed:', {
    oldValue: oldValue,
    newValue: newValue,
    newLength: newValue?.length || 0,
    isNumeric: /^\d*$/.test(newValue || ''),
    is6Digits: (newValue || '').length === 6 && /^\d{6}$/.test(newValue || '')
  });
}, { immediate: true });

// Watch for termsAccepted changes
watch(() => termsAccepted.value, (newValue, oldValue) => {
  console.log('[buro-credito-request] termsAccepted changed:', {
    oldValue: oldValue,
    newValue: newValue
  });
}, { immediate: true });

// Watch for firstValidate changes
watch(() => firstValidate.value, (newValue, oldValue) => {
  console.log('[buro-credito-request] firstValidate changed:', {
    oldValue: oldValue,
    newValue: newValue
  });
}, { immediate: true });

// Computed property to check if NIP is valid
const isNipValid = computed(() => {
  const nipValue = nip.value || "";
  const length = nipValue.length;
  const isNumeric = /^\d*$/.test(nipValue);
  const is6Digits = length === 6 && /^\d{6}$/.test(nipValue);
  const isValid = is6Digits;
  
  console.log('[buro-credito-request] isNipValid computed:', {
    nip: nipValue,
    length: length,
    isNumeric: isNumeric,
    is6Digits: is6Digits,
    isValid: isValid,
    type: typeof nipValue
  });
  
  return isValid;
});

// Computed property to check if validate button should be enabled
const canValidateNip = computed(() => {
  const termsOk = termsAccepted.value;
  const notFirstValidate = !firstValidate.value;
  const nipValid = isNipValid.value;
  const canValidate = termsOk && notFirstValidate && nipValid;
  
  console.log('[buro-credito-request] canValidateNip computed:', {
    termsAccepted: termsOk,
    notFirstValidate: notFirstValidate,
    nipValid: nipValid,
    canValidate: canValidate,
    breakdown: {
      'termsAccepted.value': termsAccepted.value,
      '!firstValidate.value': !firstValidate.value,
      'isNipValid.value': isNipValid.value
    },
    rawValues: {
      nip: nip.value,
      nipLength: nip.value?.length || 0,
      termsAccepted: termsAccepted.value,
      firstValidate: firstValidate.value,
      isNipValidResult: isNipValid.value
    },
    buttonWillBeDisabled: !canValidate,
    reason: !canValidate ? (
      !termsOk ? 'Terms not accepted' :
      !notFirstValidate ? 'First validate already done' :
      !nipValid ? 'NIP not valid' :
      'Unknown'
    ) : 'All conditions met - button enabled'
  });
  
  return canValidate;
});

// Loading state for each action
const loadingSendNip = ref(false);
const loadingValidateNip = ref(false);
const loadingConfirmNip = ref(false);

const piniaStores = {
  client: useClientStore(),
  user: useUserStore(),
  solicitud: useSolicitudStore(),
  report: useReportStore(),
  flowProcess: useFlowProcessStore(),
};

// Check if any required client data is missing
const hasNullValue = computed(() => {
  const values = [
    client.first_last_name,
    client.name,
    client.rfc,
    client.email,
    client.curp,
    client.street_address,
    client.zip_code,
  ];
  return values.some(
    (value) => value === null || value === undefined || value === ""
  );
});

const kiban_error_map = {
  LENGTH_ERROR: "El NIP debe contener 6 dígitos.",
  "NIP Incorrecto.": "El NIP ingresado es incorrecto",
  cp: "Código postal",
  "postal code not found": "Código postal",
};

// Send NIP request
const sendNipRequest = async () => {
  loadingSendNip.value = true;
  showLoading("Enviando NIP...");
  try {
    const id_sended = await sendNip(client.phone);
    id.value = id_sended;
    showNotificationSuccess("NIP enviado correctamente a su número.");
  } catch (error) {
    notifySentry(error, {
      pageName: "buro-credito-request",
      shouldSkipError: errorConditions["buro-credito-request"],
      additionalContext: {
        operation: "sendNipRequest",
        component: "CreditReportForm",
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        clientPhone: client.phone,
        clientEmail: client.email,
      },
    });
    trackApiError(error, "buro-credito-request", "sendNipRequest");
    showNotificationError("Error enviando el NIP. Intente nuevamente.");
  } finally {
    loadingSendNip.value = false;
    hideLoading();
  }
};

// Validate NIP request
const validateNipRequest = async () => {
  loadingValidateNip.value = true;
  showLoading("Validando NIP...");
  try {
    const id_validated = await validateNip(id.value, nip.value);
    if (id_validated) {
      showNotificationSuccess("NIP validado correctamente.");
      firstValidate.value = true;
      nipAuth.value = nip.value;
    } else {
      showNotificationError("Error en la validación del NIP.");
    }
  } catch (error) {
    notifySentry(error, {
      pageName: "buro-credito-request",
      shouldSkipError: errorConditions["buro-credito-request"],
      additionalContext: {
        operation: "validateNipRequest",
        component: "CreditReportForm",
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        clientPhone: client.phone,
        clientEmail: client.email,
      },
    });
    trackApiError(error, "buro-credito-request", "validateNipRequest");
    if (error.response?.status === 400) {
      const field_error =
        kiban_error_map[
          error.response.data?.data?.details?.[0]?.code ||
            error.response.data?.data?.details?.errorMessage
        ];
      showNotificationError(`Error al validar el NIP: ${field_error || ""}`);
      return;
    }
    showNotificationError(
      `Ocurrió un error al procesar la solicitud. ${error}`
    );
  } finally {
    loadingValidateNip.value = false;
    hideLoading();
  }
};

// Confirm NIP validation and request credit report
const confirmNipValidation = async () => {
  loadingConfirmNip.value = true;
  showLoading("Confirmando NIP...");
  try {
    const id_authorization = await validateNip(id.value, nipAuth.value);
    if (!id_authorization) {
      $q.dialog({
        title: "Error",
        message: "Error al tratar de validar el NIP, repita los pasos de nuevo",
      });
      nip.value = "";
      nipAuth.value = "";
      id.value = "";
      firstValidate.value = false;
      hideLoading();
      return;
    }
    if (hasNullValue.value) {
      showNotificationWarning(
        `Por favor complete los datos faltantes para continuar con el estudio de buró de crédito`
      );
      hideLoading();
      router.push({ name: "confirm-data" });
      return;
    }
    hideLoading();
    showLoading("Consultando buró de crédito...");
    const nameParts = client.name.split(" ");

    const body = {
      parameters_bc_pf_by_kiban: {
        productoRequerido: "059",
        hawk: true,
      },
      nombre: {
        apellidoPaterno: client.first_last_name,
        apellidoMaterno: client.second_last_name,
        primerNombre: nameParts.length > 1 ? nameParts[0] : client.name,
        segundoNombre:
          nameParts.length > 1
            ? `${nameParts.slice(-2).join(" ")} ${client.second_name || ""}`
            : client.second_name || "",
        rfc: client.rfc,
        email: client.email,
        curp: client.curp,
        numeroRegistroElectoral: client.id_number?.slice(-13),
      },
      domicilio: {
        direccion: {
          direccion: `${client.street_address}${
            client.interior_number ? " " + client.interior_number : ""
          }`,
          cp: client.zip_code,
        },
      },
      authorization: {
        tipo: "nip",
        id: id_authorization,
      },
    };
    try {
      await requestBc(client.id, body);
      if ($posthog) {
        const posthog = $posthog();
        trackQueryInsertBC(posthog, report.id);
      }
    } catch (error) {
      notifySentry(error, {
        pageName: "buro-credito-request",
        shouldSkipError: errorConditions["buro-credito-request"],
        additionalContext: {
          operation: "requestBc",
          component: "CreditReportForm",
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          clientPhone: client.phone,
          clientEmail: client.email,
          requestBody: body,
        },
      });
      trackApiError(error, "buro-credito-request", "requestBc");
      nip.value = "";
      nipAuth.value = "";
      id.value = "";
      firstValidate.value = false;
      if (error.response?.status === 400) {
        const field_error =
          kiban_error_map[
            error.response.data?.data?.details?.[0]?.code ||
              error.response.data?.data?.details?.errorMessage ||
              error.response?.data?.data?.details?.[0]?.errors?.[0]?.errors?.[0]
                ?.message
          ];
        if (field_error === "Código postal") {
          showNotificationError(
            `Información inválida, favor de revisar y corregir los siguientes campos: ${
              field_error || ""
            }`
          );
          router.push({ name: "confirm-data" });
          return;
        }
        showNotificationError(
          `Error al consultar buró de crédito: ${field_error || ""}`
        );
      } else {
        showNotificationError(
          `Error al tratar de consultar buró de crédito ${error}`
        );
      }
      return;
    }
    hideLoading();
    showLoading("Registrando solicitud...");
    showNotificationSuccess("Autorización exitosa y consulta completada.");
    try {
      solicitud.report_id = report.id;
      solicitud.user_id = user.id;
      solicitud.cliente_id = client.id;

      solicitud.registration_mode = registration_mode || null;

      // Set finva_user_id based on registration_mode
      if (registration_mode === "finvaAgent") {
        solicitud.finva_user_id = finvaAgent.id;
      }

      // Get next finva user from cookie if finva_user_id is not set
      if (
        !solicitud.finva_user_id &&
        flowProcessStore.flowProcess !== "assistedQuote"
      ) {
        const finvaUserIdCookie = useCookie("finvaUserId", COOKIE_CONFIG);
        if (!finvaUserIdCookie.value) {
          solicitud.finva_user_id = 6;
          notifySentry(new Error("No finva user id found"), {
            pageName: "buro-credito-request",
            shouldSkipError: errorConditions["buro-credito-request"],
            additionalContext: {
              operation: "createSolicitud",
              cookieValue: finvaUserIdCookie.value,
              solicitudData: solicitud,
            },
          });
        } else {
          solicitud.finva_user_id = finvaUserIdCookie.value;
        }
      }
      await createSolicitud(piniaStores.flowProcess.flowProcess);
      if (piniaStores.client.idValidated == false) {
        const user_email =
          piniaStores.flowProcess.flowProcess == "onCreditWeb" ||
          piniaStores.flowProcess.flowProcess == "sferaProcess"
            ? piniaStores.user.finvaAgent.email
            : piniaStores.user.user.email;
        piniaStores.client.notifyValidationFailed(user_email, solicitud.id);
      }
      if ($posthog) {
        const posthog = $posthog();
        trackSendSolicitud(
          posthog,
          solicitud.id,
          piniaStores.flowProcess.flowProcess
        );
      }
      showNotificationSuccess("Solicitud registrada.");
    } catch (error) {
      notifySentry(error, {
        pageName: "buro-credito-request",
        shouldSkipError: errorConditions["buro-credito-request"],
        additionalContext: {
          operation: "createSolicitud",
          component: "CreditReportForm",
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          clientPhone: client.phone,
          clientEmail: client.email,
          solicitudId: solicitud.id,
        },
      });
      trackApiError(error, "buro-credito-request", "createSolicitud");
      showNotificationError(
        "Hubo un error al registrar tu solicitud, avisa a tu asesor."
      );
      hideLoading();
      return;
    }
    hideLoading();
    router.push({ name: nextStep });
  } catch (error) {
    notifySentry(error, {
      pageName: "buro-credito-request",
      shouldSkipError: errorConditions["buro-credito-request"],
      additionalContext: {
        operation: "confirmNipValidation",
        component: "CreditReportForm",
        response: error.response?.data,
      },
    });
    trackApiError(error, "buro-credito-request", "confirmNipValidation");
    showNotificationError(
      "Ocurrió un error inesperado. Por favor intente nuevamente."
    );
    nip.value = "";
    nipAuth.value = "";
    id.value = "";
    firstValidate.value = false;
    await sendNipRequest();
  } finally {
    loadingConfirmNip.value = false;
    hideLoading();
  }
};

// Navigate to the previous step
const backToLastStep = () => {
  router.push({ name: previousStep });
};

// Timer logic
const startTimer = () => {
  console.log('[buro-credito-request] startTimer called');
  isTimerActive.value = true;
  timeRemaining.value = 15;

  const timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      clearInterval(timerInterval);
      isTimerActive.value = false;
    }
  }, 1000);
};

onMounted(async () => {
  if (report.id) {
    showLoading("Registrando solicitud...");
    try {
      solicitud.report_id = report.id;
      solicitud.user_id = user.id;
      solicitud.cliente_id = client.id;
      solicitud.registration_mode = registration_mode || null;

      // Set finva_user_id based on registration_mode
      if (!solicitud.finva_user_id && registration_mode === "finvaAgent") {
        solicitud.finva_user_id = finvaAgent.id;
      }
      // Get next finva user from cookie if finva_user_id is not set
      if (
        !solicitud.finva_user_id &&
        flowProcessStore.flowProcess !== "assistedQuote"
      ) {
        const finvaUserIdCookie = useCookie("finvaUserId", COOKIE_CONFIG);
        if (!finvaUserIdCookie.value) {
          solicitud.finva_user_id = 6;
          notifySentry(new Error("No finva user id found"), {
            pageName: "buro-credito-request",
            shouldSkipError: errorConditions["buro-credito-request"],
            additionalContext: {
              operation: "createSolicitud",
              cookieValue: finvaUserIdCookie.value,
              solicitudData: solicitud,
            },
          });
        } else {
          solicitud.finva_user_id = finvaUserIdCookie.value;
        }
      }
      await createSolicitud(piniaStores.flowProcess.flowProcess);
      if (piniaStores.client.idValidated == false) {
        const user_email =
          piniaStores.flowProcess.flowProcess == "onCreditWeb" ||
          piniaStores.flowProcess.flowProcess == "sferaProcess"
            ? piniaStores.user.finvaAgent.email
            : piniaStores.user.user.email;
        piniaStores.client.notifyValidationFailed(user_email, solicitud.id);
      }
      if ($posthog) {
        const posthog = $posthog();
        trackSendSolicitud(
          posthog,
          solicitud.id,
          piniaStores.flowProcess.flowProcess
        );
      }
      showNotificationSuccess("Solicitud registrada.");
      router.push({ name: nextStep });
    } catch (error) {
      notifySentry(error, {
        pageName: "buro-credito-request",
        shouldSkipError: errorConditions["buro-credito-request"],
        additionalContext: {
          operation: "createSolicitud",
          component: "CreditReportForm",
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          clientPhone: client.phone,
          clientEmail: client.email,
          solicitudId: solicitud.id,
        },
      });
      trackApiError(error, "buro-credito-request", "createSolicitud");
      showNotificationError(
        "Hubo un error al registrar tu solicitud, avisa a tu asesor."
      );
    } finally {
      hideLoading();
      return;
    }
  }
  await sendNipRequest();
});
</script>

<style scoped>
.custom-input {
  background-color: white;
  border-radius: 0.75rem;
  padding-left: 1.75rem;
  padding-right: 1.75rem;
  height: 75px;
  font-size: 16px;
}
</style>

