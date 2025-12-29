<template>
  <ProcessStepper />
  <div class="page-container">
    <!-- Header Section -->
    <div class="text-center mb-8 -mt-10">
      <p class="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
        {{
          solicitudes.length > 0
            ? "Si tu solicitud ya fue registrada, contacta a tu asesor para continuar con el proceso."
            : ""
        }}
      </p>
    </div>

    <!-- Applications Grid -->
    <div v-if="solicitudes.length > 0" class="applications-grid">
      <div
        v-for="application in solicitudes"
        :key="application.id"
        class="application-card"
      >
        <div class="application-header">
          <div class="flex items-center justify-between mb-3">
            <div class="application-id">
              <q-icon name="receipt_long" size="20px" class="mr-2" />
              <span class="font-bold">ID: {{ application.id }}</span>
            </div>
            <q-badge color="primary" class="status-badge"> Pendiente </q-badge>
          </div>
          <p class="text-gray-500 text-sm flex items-center">
            <q-icon name="event" size="16px" class="mr-1" />
            {{ formatDate(application.created_at) }}
          </p>
        </div>

        <div class="application-details">
          <div v-if="application.brand_motorcycle" class="detail-item">
            <div class="detail-icon">
              <q-icon name="motorcycle" size="20px" class="text-primary" />
            </div>
            <div class="detail-content">
              <p class="detail-label">Motocicleta</p>
              <p class="detail-value">
                {{ application.brand_motorcycle || "N/A" }}
                {{ application.model_motorcycle || "" }}
              </p>
            </div>
          </div>

          <div v-if="application.year_motorcycle" class="detail-item">
            <div class="detail-icon">
              <q-icon name="event" size="20px" class="text-primary" />
            </div>
            <div class="detail-content">
              <p class="detail-label">Año</p>
              <p class="detail-value">{{ application.year_motorcycle }}</p>
            </div>
          </div>

          <div v-if="application.invoice_motorcycle_value" class="detail-item">
            <div class="detail-icon">
              <q-icon name="attach_money" size="20px" class="text-primary" />
            </div>
            <div class="detail-content">
              <p class="detail-label">Valor</p>
              <p class="detail-value">
                {{ formatToMexicanPesos(application.invoice_motorcycle_value) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="flowProcessStore.flowProcess != 'onCreditWeb' && flowProcessStore.flowProcess != 'sferaProcess'"
          class="application-actions"
        >
          <q-btn
            unelevated
            color="primary"
            @click="continueSolicitud(application.id)"
            class="continue-btn"
            icon-right="arrow_forward"
            label="Continuar"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <q-icon name="description" size="64px" class="text-gray-300" />
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">
        No tienes solicitudes
      </h3>
      <p class="text-gray-500 mb-6">
        Comienza tu proceso de crédito creando una nueva solicitud
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons-container">
      <q-btn
        outline
        color="primary"
        @click="router.push({ name: previousStep })"
        class="action-btn"
        icon="arrow_back"
        label="Regresar"
      />
      <q-btn
        unelevated
        color="primary"
        @click="createNewSolicitud"
        class="action-btn primary-action"
        icon="add"
        label="Nueva Solicitud"
      />
      <q-btn
        outline
        color="primary"
        @click="showAdvisorModal = true"
        class="action-btn"
        icon="support_agent"
        label="Contactar Asesor"
      />
    </div>

    <!-- Advisor Contact Modal -->
    <q-dialog v-model="showAdvisorModal" persistent>
      <q-card class="advisor-modal-card">
        <q-card-section class="text-center q-pb-none">
          <div class="modal-header">
            <div class="advisor-icon-container">
              <q-icon name="support_agent" size="48px" class="text-white" />
            </div>
            <h4 class="text-xl font-bold text-gray-800 mb-2">
              ¿Necesitas ayuda?
            </h4>
            <p class="text-gray-600 text-sm">
              Nuestro equipo de asesores está listo para ayudarte
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
                  {{ userStore.finvaAgent.name || "Nuestro Asesor" }}
                  {{ userStore.finvaAgent.first_last_name || "" }}
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
                    <span class="text-sm">
                      {{
                        userStore.finvaAgent.email || "contacto@finva-app.com"
                      }}
                    </span>
                  </div>
                  <div class="contact-item">
                    <q-icon
                      name="phone"
                      size="16px"
                      class="text-primary mr-2"
                    />
                    <span class="text-sm">
                      {{
                        userStore.finvaAgent.phone_number ||
                        "+52 (55) 3043 5463"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="message-section">
              <p class="text-gray-700 text-sm leading-relaxed">
                <strong class="text-primary"
                  >¿Tienes dudas sobre tus solicitudes?</strong
                >
                <br />
                Nuestro asesor te ayudará a resolver cualquier pregunta y te
                guiará en el proceso de crédito.
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
              @click="showAdvisorModal = false"
            />
            <q-btn
              color="primary"
              label="Enviar WhatsApp"
              icon="chat"
              class="whatsapp-btn"
              @click="contactAdvisor"
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
            <div class="action-buttons-modal">
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
import { useIframeNavigation } from "~/composables/useIframeNavigation";
import { showLoading, hideLoading, showNotificationError, showNotificationSuccess, showNotificationInfo } from "~/utils/quasarDialogs";

console.log('[validate-applications] Imports loaded');
console.log('[validate-applications] useQuasar imported:', typeof useQuasar);

const router = useRouter();
const route = useRoute();
console.log('[validate-applications] Initializing Quasar...');
const $q = useQuasar();
console.log('[validate-applications] $q initialized:', !!$q);
console.log('[validate-applications] $q type:', typeof $q);
console.log('[validate-applications] $q.screen exists:', $q?.screen ? 'yes' : 'no');
console.log('[validate-applications] $q.screen type:', typeof $q?.screen);
const clientStore = useClientStore();
const solicitudStore = useSolicitudStore();
const flowProcessStore = useFlowProcessStore();
const userStore = useUserStore();

const { isInIframe } = useIframeNavigation();

const { client } = clientStore;
const { getSolicitudById, fetchSolicitudes } = solicitudStore;
const { getPreviousAndNextStep } = flowProcessStore;
const { previousStep, nextStep } = getPreviousAndNextStep(route.name);

const solicitudes = computed(() => solicitudStore.solicitudes);

// Modal states
const showAdvisorModal = ref(false);
const showWhatsAppIframeModal = ref(false);
const whatsAppLinkForIframe = ref("");

// Function to fetch the applications
const fetchApplications = async () => {
  try {
    showLoading("Consultando solicitudes registradas ...");
    await fetchSolicitudes(client.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    hideLoading();
  } catch (err) {
    hideLoading();
    showNotificationError(
      `Error al consultar solicitudes previas ${err}`
    );
  }
};

// Format the date
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function formatToMexicanPesos(value) {
  const priceValue = parseInt(value, 10);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(priceValue);
}

const continueSolicitud = async (solicitudId) => {
  try {
    await getSolicitudById(solicitudId);
    router.push({ name: nextStep });
  } catch (err) {
    showNotificationError(
      `Error al consultar solicitud seleccionada ${err}`
    );
  }
};

// Create new solicitud handler
const createNewSolicitud = () => {
  solicitudStore.solicitud.id = null;
  router.push({ name: nextStep });
};

// Contact advisor handler
const contactAdvisor = () => {
  let advisorPhone = "5610534973";

  if (
    (flowProcessStore.flowProcess == "onCreditWeb" || flowProcessStore.flowProcess == "sferaProcess") &&
    userStore.finvaAgent?.phone_number
  ) {
    advisorPhone = userStore.finvaAgent?.phone_number.replace("+52", "");
  } else if (
    flowProcessStore.flowProcess != "onCreditWeb" && flowProcessStore.flowProcess != "sferaProcess" &&
    userStore.user?.phone_number
  ) {
    advisorPhone = userStore.user.phone_number.replace("+52", "");
  }

  const message = `Hola, necesito ayuda con mis solicitudes de crédito. ¿Me pueden asesorar?`;

  if (isInIframe()) {
    const whatsappLink = `https://wa.me/${advisorPhone}?text=${encodeURIComponent(
      message
    )}`;
    whatsAppLinkForIframe.value = whatsappLink;
    showWhatsAppIframeModal.value = true;
    showAdvisorModal.value = false;
  } else {
    sendWhatsAppMessage(message, advisorPhone);
    showAdvisorModal.value = false;
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
    if (navigator?.clipboard?.writeText) {
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
  window.open(whatsAppLinkForIframe.value, "_blank");
  showNotificationInfo(
    "Si no se abrió WhatsApp, usa el botón de copiar y pega el enlace en tu navegador."
  );
};

onMounted(async () => {
  await fetchApplications();
  if (solicitudStore.solicitudes.length == 0) {
    if (flowProcessStore.flowProcess == "onCreditWeb" || flowProcessStore.flowProcess == "sferaProcess") {
      router.push({ name: nextStep });
    } else {
      $q.dialog({
        title:
          '<div class="text-xl font-bold text-center">¡Ya casi terminas!</div>',
        message: `
          <div class="q-mb-md text-left font-bold">
            <p class="text-gray-500 text-center mb-3">
              Obtén ya la mejor oferta de crédito, completa los siguientes pasos:
            </p>
            <ol class="list-decimal q-ml-md text-body2">
              <li>Llena la solicitud de crédito digital</li>
            </ol>
          </div>
        `,
        html: true,
        ok: {
          label: "Llena Solicitud de Crédito",
          color: "primary",
          push: true,
          style: "padding: 10px 20px; font-weight: bold;",
        },
        persistent: true,
        class: "rounded-lg shadow-lg bg-white flex justify-center",
      }).onOk(() => {
        router.push({ name: nextStep });
      });
    }
  }
});
</script>

<style scoped>
/* Page Container */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* Applications Grid */
.applications-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  margin-bottom: 2rem;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  justify-content: center;
}

/* Application Cards */
.application-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  max-width: 100%;
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.application-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.application-id {
  display: flex;
  align-items: center;
  color: #1f2937;
  font-size: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.application-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.application-actions {
  display: flex;
  justify-content: flex-end;
}

.continue-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  padding: 10px 24px;
  font-size: 14px;
  background: linear-gradient(135deg, var(--q-primary) 0%, #1d4ed8 100%);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-state-icon {
  margin-bottom: 20px;
}

/* Action Buttons Container */
.action-buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  padding: 10px 24px;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 160px;
}

.primary-action {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1d4ed8 100%);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

/* Advisor Modal Styles */
.advisor-modal-card {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 20px 0 10px 0;
}

.advisor-icon-container {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
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

/* WhatsApp Iframe Modal Styles */
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

.action-buttons-modal {
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

/* Responsive Design */
@media (max-width: 640px) {
  .page-container {
    padding: 1rem 0.75rem;
  }

  .application-card {
    padding: 16px;
  }

  .advisor-modal-card,
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

  .action-buttons-modal {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .whatsapp-btn,
  .copy-btn,
  .open-btn {
    width: 100%;
  }

  .action-btn {
    min-width: 100%;
  }

  .action-buttons-container {
    flex-direction: column;
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

@media (min-width: 641px) and (max-width: 1023px) {
  .page-container {
    padding: 2rem 1.5rem;
  }

  .applications-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 400px));
    gap: 1.5rem;
  }

  .action-buttons-container {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1024px) {
  .page-container {
    padding: 2.5rem 2rem;
  }

  .applications-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 420px));
    gap: 2rem;
    max-width: 900px;
  }

  .application-card {
    min-height: 320px;
    display: flex;
    flex-direction: column;
  }

  .application-details {
    flex: 1;
  }

  .action-buttons-container {
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .action-btn {
    min-width: 180px;
  }
}
</style>

