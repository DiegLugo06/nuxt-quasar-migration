<template>
  <div class="space-y-6 px-4 sm:px-8" v-if="isNotEvaluating">
    <ProcessStepper />
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-xl sm:text-2xl font-bold text-primary">
        Tenemos muy buenas noticias
      </h2>
      <p v-if="approvedEvaluationResult" class="text-gray-700 mt-2">
        Estas son los bancos y financieras donde tienes muy buenas posibilidades
        de obtener el crédito para tu moto:
      </p>
      <p
        v-else-if="piniaStores.flow.flowProcess != 'cashWeb'"
        class="text-gray-700 mt-2"
      >
        Tenemos la mejor opción de crédito para tu moto, tu asesor te la dará a
        conocer:
      </p>
    </div>

    <!-- Bank Cards -->
    <div
      v-if="approvedEvaluationResult"
      class="flex flex-wrap justify-center items-center gap-4 h-auto"
    >
      <div
        v-for="bank in approvedBanks"
        :key="bank.bank_id"
        class="w-36 sm:w-48 border rounded-lg p-3 bg-white hover:shadow-md transition-all duration-300 text-center cursor-pointer transform hover:scale-105"
        @click="showBankModal(bank)"
      >
        <div class="flex flex-col items-center">
          <img
            v-if="
              ['maxikash', 'zona-autoestrena'].includes(
                bank.bank_name.toLowerCase().replace(' ', '-')
              )
            "
            :src="`/assets/${bank.bank_name
              .toLowerCase()
              .replace(' ', '-')}-logo.png`"
            :alt="bank.bank_name"
            class="w-14 h-14 sm:w-36 sm:h-36 object-contain mb-2"
          />
          <img
            v-else
            :src="bankLogo(bank.bank_name)"
            :alt="bank.bank_name"
            class="w-14 h-14 sm:w-36 sm:h-36 object-contain mb-2"
            @error="handleBankLogoError"
          />
          <h3 class="text-lg font-semibold text-gray-800">
            {{ bank.bank_name }}
          </h3>
          <q-icon name="check_circle" size="16px" class="text-primary mt-1" />
        </div>
      </div>
    </div>

    <!-- Advisor Info -->
    <div
      class="border rounded-lg p-4 text-sm sm:text-base text-gray-800 max-w-md mx-auto space-y-2"
    >
      <p>
        <strong class="text-primary">
          {{
            getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
              ? "Nuestro asesor"
              : piniaStores.user.user.name || "Nuestro asesor"
          }}
          {{
            getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
              ? "virtual "
              : piniaStores.user.user.first_last_name || ""
          }}</strong
        >
        se contactará contigo para
        {{
          getCurrentFlowProcess() == "cashWeb" || getCurrentFlowProcess() == "sferaProcess"
            ? "dar seguimiento a la compra de tu motocicleta"
            : "presentarte la oferta de crédito personalizada."
        }}
      </p>
      <div class="flex items-center">
        <q-icon name="email" size="16px" class="text-primary mr-2" />
        <span>{{
          getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
            ? "contacto@finva-app.com"
            : piniaStores.user.user.email || "contacto@finva-app.com"
        }}</span>
      </div>
      <div class="flex items-center">
        <q-icon name="phone" size="16px" class="text-primary mr-2" />
        <span>{{
          getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
            ? chatbotPhone
            : piniaStores.user.user.phone_number || defaultAdvisorPhone
        }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4">
      <q-btn
        outline
        color="primary"
        label="WhatsApp con asesor"
        class="w-full sm:w-auto"
        icon="chat"
        @click="startWhatsAppChat"
      />
    </div>

    <!-- Bank Modal -->
    <q-dialog v-model="showModal" persistent>
      <q-card class="bank-modal-card">
        <q-card-section class="text-center q-pb-none">
          <div class="modal-header">
            <q-icon name="check_circle" size="48px" class="text-primary mb-3" />
            <h4 class="text-xl font-bold text-gray-800 mb-2">
              ¡Excelente elección!
            </h4>
            <p class="text-gray-600 text-sm">
              Has seleccionado
              <strong class="text-primary">{{
                selectedBank?.bank_name
              }}</strong>
            </p>
          </div>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="modal-content">
            <div class="advisor-info-card">
              <div class="advisor-avatar">
                <q-icon name="person" size="32px" class="text-primary" />
              </div>
              <div class="advisor-details">
                <h5 class="text-lg font-semibold text-gray-800 mb-1">
                  {{
                    getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
                      ? "Nuestro asesor"
                      : piniaStores.user.user.name || "Nuestro asesor"
                  }}
                  {{
                    getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
                      ? "virtual"
                      : piniaStores.user.user.first_last_name || ""
                  }}
                </h5>
                <p class="text-sm text-gray-600 mb-2">
                  Tu asesor financiero asignado
                </p>
                <div class="contact-info">
                  <div class="contact-item">
                    <q-icon
                      name="email"
                      size="16px"
                      class="text-primary mr-2"
                    />
                    <span class="text-sm">{{
                      getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
                        ? "contacto@finva-app.com"
                        : piniaStores.user.user.email ||
                          "contacto@finva-app.com"
                    }}</span>
                  </div>
                  <div class="contact-item">
                    <q-icon
                      name="phone"
                      size="16px"
                      class="text-primary mr-2"
                    />
                    <span class="text-sm">{{
                      getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
                        ? chatbotPhone
                        : piniaStores.user.user.phone_number ||
                          defaultAdvisorPhone
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="message-section">
              <p class="text-gray-700 text-sm leading-relaxed">
                Para continuar con el proceso y conocer tu oferta envíe un
                mensaje de WhatsApp a
                <strong class="text-primary">
                  {{
                    getCurrentFlowProcess() == "onCreditWeb" || getCurrentFlowProcess() == "sferaProcess"
                      ? "nuestro asesor virtual"
                      : piniaStores.user.user.name || "nuestro asesor"
                  }}
                </strong>
              </p>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md q-pt-none">
          <div class="modal-actions">
            <q-btn
              flat
              label="Cerrar"
              color="grey"
              class="q-mr-sm"
              @click="closeModal"
            />
            <q-btn
              color="primary"
              label="Enviar WhatsApp"
              icon="chat"
              class="whatsapp-btn"
              @click="sendWhatsAppToAdvisor"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- WhatsApp Iframe Modal -->
    <q-dialog v-model="showWhatsAppIframeModal" persistent>
      <q-card class="whatsapp-iframe-modal-card">
        <q-card-section class="text-center q-pb-none">
          <div class="modal-header">
            <q-icon name="info" size="48px" class="text-primary mb-3" />
            <h4 class="text-xl font-bold text-gray-800 mb-2">
              Contacta a tu asesor por WhatsApp
            </h4>
            <p class="text-gray-600 text-sm">
              Para contactar a tu asesor, copia el enlace y ábrelo en una nueva
              pestaña
            </p>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="modal-content">
            <div class="instruction-section">
              <div class="instruction-step">
                <div class="step-number">1</div>
                <p class="text-sm text-gray-700">
                  Haz clic en el botón <strong>"Copiar enlace"</strong> para
                  copiar el enlace de WhatsApp al portapapeles
                </p>
              </div>
              <div class="instruction-step">
                <div class="step-number">2</div>
                <p class="text-sm text-gray-700">
                  Abre una <strong>nueva pestaña</strong> en tu navegador
                </p>
              </div>
              <div class="instruction-step">
                <div class="step-number">3</div>
                <p class="text-sm text-gray-700">
                  <strong>Pega el enlace</strong> en la barra de direcciones y
                  presiona Enter
                </p>
              </div>
            </div>

            <div class="link-display">
              <div class="link-text">
                {{ whatsAppLinkForIframe }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md q-pt-none">
          <div class="modal-actions-iframe">
            <q-btn
              flat
              label="Cerrar"
              color="grey"
              @click="closeWhatsAppIframeModal"
            />
            <div class="action-buttons">
              <q-btn
                color="primary"
                label="Copiar enlace"
                icon="content_copy"
                class="copy-btn"
                @click="copyWhatsAppLink"
              />
              <q-btn
                color="positive"
                label="Intentar abrir"
                icon="open_in_new"
                class="open-btn"
                @click="openWhatsAppInNewTab"
              />
            </div>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { QSpinnerHourglass, useQuasar } from "quasar";
import { sendWhatsAppMessage } from "~/utils/whatsapp";
import { trackApiError } from "~/helpers/error_tracking";
import { useErrorHandling } from "~/composables/useErrorHandling";
import { errorConditions } from "~/utils/errorConditions";
import { trackGetNextFinvaUserAssigned } from "~/helpers/track_events";
import { useIframeNavigation } from "~/composables/useIframeNavigation";
import { showLoading, hideLoading, showNotificationSuccess, showNotificationError, showNotificationInfo } from "~/utils/quasarDialogs";

const config = useRuntimeConfig();

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const { $posthog } = useNuxtApp();

// Iframe navigation composable
const {
  isFromIframe,
  isInIframe,
  markRegistrationComplete,
  sendMessageToParent,
} = useIframeNavigation();

// Initialize stores
const piniaStores = {
  user: useUserStore(),
  solicitud: useSolicitudStore(),
  flow: useFlowProcessStore(),
  client: useClientStore(),
  motorcycle: useMotorcycleStore(),
};

const { previousStep, nextStep } = piniaStores.flow.getPreviousAndNextStep(
  route.name
);

const approvedEvaluationResult = ref(false);
const banks = ref([]);
const finvaAgent = piniaStores.user.finvaAgent;
const isNotEvaluating = ref(false);
const defaultAdvisorPhone = "+52 (56) 1042 0474";
const chatbotPhone = "+52 (56) 1053 4973";

// Modal state
const showModal = ref(false);
const selectedBank = ref(null);

// WhatsApp iframe modal state
const showWhatsAppIframeModal = ref(false);
const whatsAppLinkForIframe = ref("");
const whatsAppMessageForIframe = ref("");

const solicitudStatus = route.query.solicitudStatus;

const { notifySentry } = useErrorHandling();

// Helper function to get current flowProcess with fallback
const getCurrentFlowProcess = () => {
  try {
    if (piniaStores.flow.flowProcess) {
      return piniaStores.flow.flowProcess;
    }

    if (typeof window !== "undefined" && window.sessionStorage) {
      const flowProcessData = sessionStorage.getItem("flowProcess");
      if (flowProcessData) {
        const parsed = JSON.parse(flowProcessData);
        return parsed.flowProcess;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting flow process:", error);
    return null;
  }
};

// Get bank logo from Supabase storage
const bankLogo = (bankName) => {
  if (!bankName) {
    return '/assets/bank-placeholder.png';
  }
  
  const normalizedBankName = bankName.toLowerCase().trim();
  
  const supabaseProjectId = config.public?.SUPABASE_PROJECT_ID;
  
  if (!supabaseProjectId) {
    console.warn('SUPABASE_PROJECT_ID not configured, falling back to placeholder');
    return '/assets/bank-placeholder.png';
  }
  
  return `https://${supabaseProjectId}.supabase.co/storage/v1/object/public/documents/banks/${normalizedBankName}.webp`;
};

// Handle bank logo loading errors
const handleBankLogoError = (event) => {
  const target = event.target;
  if (target && target.src && !target.src.includes('bank-placeholder')) {
    target.src = '/assets/bank-placeholder.png';
  }
};

// Approved banks computation
const approvedBanks = computed(() => {
  return banks.value.filter((bank) => bank.best_offer !== undefined);
});

const startWhatsAppChat = () => {
  const sessionFlowProcess = typeof window !== "undefined" && sessionStorage.getItem("flowProcess")
    ? JSON.parse(sessionStorage.getItem("flowProcess")).flowProcess
    : null;

  const currentFlowProcess = piniaStores.flow.flowProcess || sessionFlowProcess;

  let advisorPhone = "5610194726";

  if (piniaStores.flow.flowProcess == "onCreditWeb" || piniaStores.flow.flowProcess == "sferaProcess") {
    advisorPhone = "5610534973";
  } else if (piniaStores.user.finvaAgent?.phone_number) {
    advisorPhone = piniaStores.user.finvaAgent?.phone_number.replace("+52", "");
  } else if (piniaStores.user.user?.phone_number) {
    advisorPhone = piniaStores.user.user.phone_number.replace("+52", "");
  }

  const message = `Hola, me interesa obtener más información sobre ${
    currentFlowProcess == "cashWeb" ? "la compra" : "el proceso de crédito"
  } de la motocicleta ${piniaStores.solicitud.solicitud.brand_motorcycle} ${
    piniaStores.solicitud.solicitud.model_motorcycle
  } ${
    piniaStores.solicitud.solicitud.year_motorcycle
  }, recientemente terminé de registrar mi solicitud con ID ${
    piniaStores.solicitud.solicitud.id
  }.`;

  if (isInIframe()) {
    const whatsappLink = `https://wa.me/${advisorPhone}?text=${encodeURIComponent(
      message
    )}`;
    whatsAppLinkForIframe.value = whatsappLink;
    whatsAppMessageForIframe.value = message;
    showWhatsAppIframeModal.value = true;
  } else {
    sendWhatsAppMessage(message, advisorPhone);
  }
};

// Modal methods
const showBankModal = (bank) => {
  selectedBank.value = bank;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedBank.value = null;
};

const sendWhatsAppToAdvisor = () => {
  const sessionFlowProcess = typeof window !== "undefined" && sessionStorage.getItem("flowProcess")
    ? JSON.parse(sessionStorage.getItem("flowProcess")).flowProcess
    : null;

  const currentFlowProcess = piniaStores.flow.flowProcess || sessionFlowProcess;

  let advisorPhone = "5610194726";

  if (piniaStores.flow.flowProcess == "onCreditWeb" || piniaStores.flow.flowProcess == "sferaProcess") {
    advisorPhone = "5610534973";
  } else if (piniaStores.user.finvaAgent?.phone_number) {
    advisorPhone = piniaStores.user.finvaAgent?.phone_number.replace("+52", "");
  } else if (piniaStores.user.user?.phone_number) {
    advisorPhone = piniaStores.user.user.phone_number.replace("+52", "");
  }

  const message = `Hola, me interesa obtener más información sobre ${
    currentFlowProcess == "cashWeb" ? "la compra" : "el proceso de crédito"
  } de la motocicleta ${piniaStores.solicitud.solicitud.brand_motorcycle} ${
    piniaStores.solicitud.solicitud.model_motorcycle
  } ${
    piniaStores.solicitud.solicitud.year_motorcycle
  }, recientemente terminé de registrar mi solicitud con ID ${
    piniaStores.solicitud.solicitud.id
  }. Me interesa especialmente la oferta de ${selectedBank.value?.bank_name}.`;

  if (isInIframe()) {
    const whatsappLink = `https://wa.me/${advisorPhone}?text=${encodeURIComponent(
      message
    )}`;
    whatsAppLinkForIframe.value = whatsappLink;
    whatsAppMessageForIframe.value = message;
    showWhatsAppIframeModal.value = true;
    closeModal();
  } else {
    sendWhatsAppMessage(message, advisorPhone);
    closeModal();
  }
};

// WhatsApp iframe modal methods
const closeWhatsAppIframeModal = () => {
  showWhatsAppIframeModal.value = false;
};

const copyWhatsAppLink = async () => {
  const text = whatsAppLinkForIframe.value;
  if (!text) return showNotificationError("No hay enlace para copiar.");

  try {
    if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    showNotificationSuccess("¡Enlace copiado al portapapeles!");
  } catch (err) {
    showNotificationError(
      "No se pudo copiar el enlace. Por favor, cópialo manualmente."
    );
  }
};

const fallbackCopy = (text) => {
  if (typeof window === "undefined") return;
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "absolute";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

const openWhatsAppInNewTab = () => {
  if (typeof window !== "undefined") {
    window.open(whatsAppLinkForIframe.value, "_blank");
    showNotificationInfo(
      "Si no se abrió WhatsApp, usa el botón de copiar y pega el enlace en tu navegador."
    );
  }
};

onMounted(async () => {
  // Load finvaAgent if not already loaded (only for credit flows, not cashWeb)
  if (
    piniaStores.flow.flowProcess !== "cashWeb" &&
    !piniaStores.user.finvaAgent.id
  ) {
    try {
      if (
        piniaStores.flow.flowProcess === "assistedQuote" &&
        piniaStores.solicitud.solicitud.finva_user_id
      ) {
        await piniaStores.user.getFinvaUserDetails(
          piniaStores.solicitud.solicitud.finva_user_id
        );
      } else {
        await piniaStores.user.getNextFinvaUserAssigned();
      }

      if ($posthog) {
        const posthog = $posthog();
        trackGetNextFinvaUserAssigned(
          posthog,
          piniaStores.user.finvaAgent.id,
          piniaStores.client.client.email,
          piniaStores.client.client.phone
        );
      }
    } catch (error) {
      notifySentry(error, {
        pageName: "credit-approval-result",
        shouldSkipError: errorConditions["credit-approval-result"],
        additionalContext: {
          operation: "getNextFinvaUserAssigned",
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          clientPhone: piniaStores.client.client.phone,
          clientEmail: piniaStores.client.client.email,
          storeId: piniaStores.solicitud.solicitud.preferred_store_id,
        },
      });
    }
  }
  if (piniaStores.flow.flowProcess == "cashWeb") {
    isNotEvaluating.value = true;
    return;
  }
  try {
    showLoading("Evaluando solicitud ...");

    const evaluation = await piniaStores.solicitud.evaluateSolicitud();
    banks.value = evaluation.banks;
    const targetBankIds = [1, 2, 3, 8];

    approvedEvaluationResult.value = banks.value.some((bank) => {
      if (!targetBankIds.includes(bank.bank_id)) return false;

      return Object.entries(bank)
        .filter(([key]) => key !== "bank_id" && key !== "bank_name")
        .some(([_, value]) => value !== "Rechazado");
    });

    if (approvedEvaluationResult.value && solicitudStatus != "updated") {
      $q.dialog({
        title: "Confirmación",
        message:
          "¿Deseas continuar llenando los datos de tu solicitud o que tu asesor te ayude?",
        cancel: { push: true, label: "Mi asesor" },
        ok: { push: true, label: "Yo (más rápido)" },
        persistent: true,
      })
        .onOk(() => {
          // Navigate to the combined solicitud data page
          router.push({ name: "complete-solicitud-data" });
        })
        .onCancel(() => {
          // Skip to my-documents if they want advisor help
          router.push({ name: "my-documents" });
        });
    } else if (
      !approvedEvaluationResult.value &&
      solicitudStatus != "updated"
    ) {
      // If not approved, go directly to complete solicitud data
      router.push({ name: "complete-solicitud-data" });
    } else {
      isNotEvaluating.value = true;
    }
  } catch (error) {
    approvedEvaluationResult.value = false;

    notifySentry(error, {
      pageName: "credit-approval-result",
      shouldSkipError: errorConditions["credit-approval-result"],
      additionalContext: {
        operation: "evaluateSolicitud",
        userState: piniaStores.user.user,
        clientState: piniaStores.client.client,
        solicitudState: piniaStores.solicitud.solicitud,
      },
    });
    trackApiError(error, "credit-approval-result", "evaluateSolicitud");
  } finally {
    hideLoading();
  }
});
</script>

<style scoped>
.border {
  transition: all 0.2s ease;
}

.border:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.bank-modal-card {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 20px 0 10px 0;
}

.modal-content {
  padding: 0 20px;
}

.advisor-info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.advisor-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px auto;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.advisor-details {
  text-align: center;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.message-section {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.whatsapp-btn {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  padding: 8px 20px;
  box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.3);
  transition: all 0.3s ease;
}

.whatsapp-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(37, 211, 102, 0.4);
}

.whatsapp-iframe-modal-card {
  min-width: 400px;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.instruction-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.instruction-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.instruction-step:last-child {
  margin-bottom: 0;
}

.step-number {
  min-width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.link-display {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  border: 2px dashed #cbd5e1;
  margin-top: 16px;
}

.link-text {
  word-break: break-all;
  font-size: 12px;
  color: #475569;
  font-family: monospace;
  line-height: 1.6;
}

.modal-actions-iframe {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.copy-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  padding: 8px 16px;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.open-btn {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  padding: 8px 16px;
  box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.3);
  transition: all 0.3s ease;
}

.open-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(37, 211, 102, 0.4);
}

@media (max-width: 640px) {
  .bank-modal-card,
  .whatsapp-iframe-modal-card {
    min-width: 320px;
    max-width: 95vw;
    margin: 10px;
  }

  .modal-actions,
  .modal-actions-iframe {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .whatsapp-btn,
  .copy-btn,
  .open-btn {
    width: 100%;
  }

  .instruction-step {
    gap: 8px;
  }

  .step-number {
    min-width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .link-text {
    font-size: 10px;
  }
}
</style>

