<template>
  <ClientOnly>
    <ProcessStepper v-if="flowProcessStore.flowProcess === 'onCreditWeb'" />
    <div class="id-validation-page">
      <div class="page-container">
        <q-card class="main-card">
          <!-- Header Section -->
          <q-card-section class="header-section">
            <div class="info-header">
              <div class="brand-icon-box">
                <q-icon name="badge" size="24px" />
              </div>
              <h1 class="page-title">
                <template v-if="typeIdValidation != 'cardHolder'">
                  Identificación de quien solicita el crédito
                </template>
                <template v-else>
                  Identificación del titular de la tarjeta
                </template>
              </h1>
            </div>
          </q-card-section>

          <!-- Why we request INE -->
          <q-card-section class="info-section">
            <div class="info-card">
              <div class="info-title">
                <q-icon name="info" size="24px" class="q-mr-sm" />
                ¿Para qué te pedimos tu INE?
              </div>

              <div class="info-items">
                <div class="info-item">
                  <div class="info-icon">
                    <q-icon name="check" size="16px" />
                  </div>
                  <div class="info-text">
                    Tomar tus datos personales, ahorrándote trabajo manual y
                    evitando errores de dedo.
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <q-icon name="check" size="16px" />
                  </div>
                  <div class="info-text">
                    Verificar tu identidad, solo haciendo trámites de las
                    personas con INE válidas y solo entregando la motocicleta al
                    dueño de la INE verificada.
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <q-icon name="check" size="16px" />
                  </div>
                  <div class="info-text">
                    No te preocupes, guardamos tu INE e información de la manera
                    más segura.
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- File Upload Section -->
          <q-card-section class="upload-section">
            <div class="upload-container">
              <!-- Front ID -->
              <div class="upload-card">
                <div class="upload-header">
                  <q-icon name="camera_alt" size="28px" class="upload-icon" />
                  <div class="upload-title">INE (Frente)</div>
                </div>
                <div v-if="!previewFront" class="upload-preview">
                  <img
                    src="/assets/id-front-reference.jpeg"
                    alt="Placeholder INE Frente"
                    class="preview-image"
                    @error="handleImageError"
                  />
                </div>
                <div v-if="previewFront" class="upload-preview-selected">
                  <img
                    :src="previewFront"
                    alt="INE Frente seleccionada"
                    class="preview-image-selected"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    class="remove-preview-btn"
                    @click="removePreview('front')"
                  />
                </div>
                <q-file
                  v-model="officialIdFront"
                  label="Seleccionar imagen"
                  outlined
                  accept="image/*"
                  class="file-input"
                  clearable
                  :max-file-size="10485760"
                >
                  <template v-slot:prepend>
                    <q-icon name="upload_file" />
                  </template>
                </q-file>
                <div v-if="officialIdFront" class="file-selected-info">
                  <q-icon name="check_circle" color="positive" size="20px" />
                  <span class="file-name">{{ officialIdFront?.name || 'Archivo seleccionado' }}</span>
                </div>
              </div>

              <!-- Reverse ID -->
              <div class="upload-card">
                <div class="upload-header">
                  <q-icon name="camera_alt" size="28px" class="upload-icon" />
                  <div class="upload-title">INE (Reverso)</div>
                </div>
                <div v-if="!previewReverse" class="upload-preview">
                  <img
                    src="/assets/id-back-reference.png"
                    alt="Placeholder INE Reverso"
                    class="preview-image"
                    @error="handleImageError"
                  />
                </div>
                <div v-if="previewReverse" class="upload-preview-selected">
                  <img
                    :src="previewReverse"
                    alt="INE Reverso seleccionada"
                    class="preview-image-selected"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    class="remove-preview-btn"
                    @click="removePreview('reverse')"
                  />
                </div>
                <q-file
                  v-model="officialIdReverse"
                  label="Seleccionar imagen"
                  outlined
                  accept="image/*"
                  class="file-input"
                  clearable
                  :max-file-size="10485760"
                >
                  <template v-slot:prepend>
                    <q-icon name="upload_file" />
                  </template>
                </q-file>
                <div v-if="officialIdReverse" class="file-selected-info">
                  <q-icon name="check_circle" color="positive" size="20px" />
                  <span class="file-name">{{ officialIdReverse?.name || 'Archivo seleccionado' }}</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Action Buttons Section -->
          <q-card-section class="actions-section">
            <div class="actions-container">
              <div class="primary-actions">
                <q-btn
                  v-if="
                    client.id &&
                    typeIdValidation != 'cardHolder' &&
                    flowProcessStore.flowProcess !== 'creditCard'
                  "
                  label="Subir en otro momento"
                  color="grey-7"
                  outline
                  icon="arrow_forward"
                  class="action-btn"
                  @click="router.push('/confirm-data')"
                />
                <q-btn
                  label="Cargar"
                  unelevated
                  icon="file_upload"
                  class="action-btn primary-btn"
                  :loading="loading"
                  :disable="!officialIdFront || !officialIdReverse"
                  @click="ineValidation('automatic')"
                />
              </div>
              <div class="secondary-actions">
                <q-btn
                  label="¿Dudas? Hable con asesor"
                  color="orange"
                  outline
                  icon="sms"
                  class="action-btn"
                  @click="
                    sendWhatsAppMessage(
                      'Hola tengo algunas dudas sobre el proceso.'
                    )
                  "
                />
                <q-btn
                  v-if="
                    !client.id &&
                    typeIdValidation != 'cardHolder' &&
                    !['cashWeb', 'creditCard'].includes(
                      flowProcessStore.flowProcess
                    )
                  "
                  label="Autenticación mediante CURP"
                  color="purple"
                  outline
                  icon="badge"
                  class="action-btn"
                  @click="
                    $q.dialog({
                      title: 'Confirmación',
                      message: '¿Conoces o cuentas con tu CURP a la mano?',
                      cancel: { push: true, label: 'No' },
                      ok: { push: true, label: 'Sí' },
                      persistent: true,
                    })
                      .onOk(() => router.push({ name: 'curp-validation' }))
                      .onCancel(() => router.push('/curp-generator'))
                  "
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Dialog for Manual Validation -->
        <q-dialog v-model="showDialog" persistent>
          <q-card class="q-pa-md w-full max-w-lg">
            <q-card-section class="text-center">
              <div
                class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <q-icon name="warning" class="text-orange-600" size="32px" />
              </div>
              <div class="text-xl font-bold text-gray-800 mb-2">
                No logramos leer todos los datos de tu INE
              </div>
              <div class="text-sm text-gray-600 mb-2">
                Solo ingresa manualmente tu curp:
              </div>
              <q-input
                v-model="uppercaseCurpManual"
                label="Ingresa tu CURP"
                filled
                maxlength="18"
                class="transform hover:scale-[1.01] transition-transform duration-300"
                :rules="[
                  (val) => !!val || 'El CURP es obligatorio',
                  (val) =>
                    val.length == 18 || 'El CURP debe contener 18 caracteres',
                ]"
              />
              <q-btn
                :loading="loading"
                :disable="client.curp?.length !== 18"
                label="Validar CURP"
                color="primary"
                class="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-r from-primary-500 to-primary-600"
                @click="validateUserCurp()"
              />
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Image Quality Dialog -->
        <q-dialog v-model="showImageQualityDialog" persistent>
          <q-card class="q-pa-md w-full max-w-lg">
            <q-card-section class="text-center">
              <div class="text-xl font-bold text-gray-800 mb-2">
                No logramos leer las imágenes que nos subiste
              </div>
              <div class="text-sm text-gray-600">
                Intenta subir las imágenes de nuevo, recuerda:
              </div>
            </q-card-section>

            <q-card-section class="py-4">
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div
                    class="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                  >
                    <q-icon
                      name="highlight_off"
                      class="text-white"
                      size="20px"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">
                      Que no tengan reflejo
                    </div>
                    <div class="text-sm text-gray-600">
                      Evita tomar la foto cerca de ventanas o luces brillantes
                    </div>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div
                    class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <q-icon
                      name="wb_sunny"
                      class="text-green-600"
                      size="20px"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">
                      Evita las sombras
                    </div>
                    <div class="text-sm text-gray-600">
                      Busca un lugar bien iluminado y sin sombras sobre la
                      credencial
                    </div>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div
                    class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
                  >
                    <q-icon
                      name="camera_alt"
                      class="text-purple-600"
                      size="20px"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">
                      No muevas el teléfono cuando tomes la foto
                    </div>
                    <div class="text-sm text-gray-600">
                      Mantén el teléfono estable para obtener una imagen clara
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="center" class="q-pa-md">
              <q-btn
                label="Entendido"
                color="primary"
                class="transform hover:scale-105 transition-all duration-300 shadow-lg"
                @click="showImageQualityDialog = false"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeMount } from "vue";
import { sendWhatsAppMessage } from "@/utils/whatsapp";
import { useErrorHandling } from "@/composables/useErrorHandling";
import { errorConditions } from "@/utils/errorConditions";
import {
  showLoading,
  hideLoading,
  showNotificationSuccess,
  showNotificationError,
} from "@/utils/quasarDialogs";
import { useQuasar } from "quasar";
import ProcessStepper from "@/components/ProcessStepper.vue";

// Debug: Log component mounting
if (import.meta.client) {
  console.log('[id-validation] Component script setup executing');
  console.log('[id-validation] Client-side:', import.meta.client);
  console.log('[id-validation] Dev mode:', import.meta.dev);
}

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// Debug: Check Quasar instance
if (import.meta.client) {
  console.log('[id-validation] Quasar instance:', !!$q);
  console.log('[id-validation] Quasar config:', $q?.screen);
}

const solicitudStore = useSolicitudStore();
const flowProcessStore = useFlowProcessStore();
const clientStore = useClientStore();

const { client, updateClientData, registerClient, uploadFile, validateCredentialComplete, validateCurpInformation } = clientStore;

const typeIdValidation = route.query.typeIdValidation as string | undefined;

// Reactive state
const officialIdFront = ref<File | null>(null);
const officialIdReverse = ref<File | null>(null);
const previewFront = ref<string | null>(null);
const previewReverse = ref<string | null>(null);
const showDialog = ref(false);
const showImageQualityDialog = ref(false);
const loading = ref(false);
const firstTryValidation = ref(true);
const firstTryValidationCurp = ref(true);

// Computed properties
const uppercaseCurpManual = computed({
  get: () => client.curp?.toUpperCase() || "",
  set: (value: string) => (client.curp = value.toUpperCase()),
});

const { notifySentry } = useErrorHandling();

/**
 * Get user-friendly error message for INE validation failures
 * @param {string} userMessage - User-friendly message from backend
 * @param {string} technicalMessage - Technical message from backend
 * @param {string} claveMensaje - Error code from validation service
 * @returns {string} User-friendly error message
 */
const getIneValidationErrorMessage = (
  userMessage?: string,
  technicalMessage?: string,
  claveMensaje?: string
): string => {
  // Priority 1: Use user-friendly message from backend if available
  if (userMessage && userMessage.trim()) {
    return userMessage;
  }

  // Priority 2: Map error codes to user-friendly messages
  if (claveMensaje) {
    const errorCodeMessages: Record<string, string> = {
      "0": "La credencial no está registrada en el padrón electoral. Por favor, verifica que sea una credencial válida.",
      "1": "La credencial ha sido cancelada. Por favor, verifica que sea una credencial vigente.",
      "3": "La credencial es válida.", // This shouldn't happen if is_valid is false, but included for completeness
      "5": "La credencial no está vigente o ha expirado. Por favor, verifica la fecha de vigencia.",
      "6": "Error en la validación de la credencial. Por favor, intenta de nuevo o contacta con un asesor.",
      "7": "La credencial no se encuentra en el padrón electoral. Por favor, verifica que sea una credencial válida.",
      "8": "La credencial presenta inconsistencias. Por favor, verifica que la información sea correcta.",
      "9": "Error en el servicio de validación. Por favor, intenta de nuevo más tarde.",
    };

    if (errorCodeMessages[claveMensaje]) {
      return errorCodeMessages[claveMensaje];
    }
  }

  // Priority 3: Use technical message if available and user-friendly
  if (technicalMessage && technicalMessage.trim()) {
    // Check if technical message is already user-friendly
    const lowerMessage = technicalMessage.toLowerCase();
    if (
      !lowerMessage.includes("error") &&
      !lowerMessage.includes("exception") &&
      !lowerMessage.includes("failed")
    ) {
      return technicalMessage;
    }
  }

  // Priority 4: Default fallback message
  return "La identificación no pudo ser validada. Por favor, verifica que la imagen sea clara y la información sea correcta. Si el problema persiste, contacta con un asesor.";
};

// Debug: Log component lifecycle
onBeforeMount(() => {
  if (import.meta.client) {
    console.log('[id-validation] onBeforeMount - Component about to mount');
  }
});

onMounted(() => {
  if (import.meta.client) {
    console.log('[id-validation] onMounted - Component mounted');
    console.log('[id-validation] File refs initialized:', {
      officialIdFront: !!officialIdFront.value,
      officialIdReverse: !!officialIdReverse.value,
      previewFront: !!previewFront.value,
      previewReverse: !!previewReverse.value
    });
  }
});

// Watch for file changes via v-model
watch(officialIdFront, (newFile) => {
  if (newFile) {
    handleFileSelect('front', newFile);
  } else {
    previewFront.value = null;
  }
}, { immediate: false });

watch(officialIdReverse, (newFile) => {
  if (newFile) {
    handleFileSelect('reverse', newFile);
  } else {
    previewReverse.value = null;
  }
}, { immediate: false });

const setClientDataFromFrontOcrData = (front_info: any) => {
  if (!front_info?.data?.parse_ocr) return;

  const ocrData = front_info.data.parse_ocr;
  const streetType =
    ocrData.find((item: any) => item.type === "AddressStreetType")?.value || "";
  const streetName =
    ocrData.find((item: any) => item.type === "AddressStreet")?.value || "";
  const streetNumber =
    ocrData.find((item: any) => item.type === "AddressStreetNumber")?.value || "";
  const zipCode =
    ocrData.find((item: any) => item.type === "AddressPostalCode")?.value || "";

  const expirationDate =
    ocrData.find((item: any) => item.type === "DateOfExpiry")?.value || "";

  client.street_address = `${streetType} ${streetName} ${streetNumber}`.trim();
  client.zip_code = zipCode;
  client.id_expiration_date = expirationDate.split("/").reverse().join("-");
};

const setClientDataFromBackOcrData = (back_info: any) => {
  const mrzData = back_info.data.mrz;
  if (!mrzData) return;
  const idNumber = mrzData.doc_number + mrzData.first_optional;
  client.id_type = "Credencial de Elector";
  if (!client.id_number) {
    client.id_number = idNumber;
  }
};

const setClientDataFromCurpData = (curpData: any) => {
  const {
    nombres,
    primerApellido,
    segundoApellido,
    sexo,
    fechaNacimiento,
    curp,
    entidad,
    rfc,
  } = curpData;
  client.name = nombres.split(" ")[0];
  client.second_name = nombres.split(" ").slice(1).join(" ") || "";
  client.first_last_name = primerApellido;
  client.second_last_name = segundoApellido;
  client.sex = sexo.toUpperCase() == "HOMBRE" ? "M" : "F";
  client.birth_date = fechaNacimiento;
  client.curp = curp.toUpperCase();
  client.born_state =
    entidad.toUpperCase() == "CIUDAD DE MEXICO"
      ? "Ciudad de México"
      : entidad.charAt(0).toUpperCase() + entidad.slice(1).toLowerCase();

  if (rfc) {
    client.rfc = rfc;
  }
};

const handleClientRegistration = async () => {
  if (client.id) {
    showLoading({ message: "Actualizando información del usuario ..." });
    await updateClientData(client.id);
    hideLoading();
    showNotificationSuccess("Cliente actualizado exitosamente");
  } else {
    showLoading({ message: "Guardando información del usuario ..." });
    // For onCreditWeb, we'll use a simplified user assignment
    // In a real scenario, you'd have a userStore with getNextUserAssigned
    const userId = solicitudStore.solicitud.finva_user_id || 1;
    
    const id = await registerClient(
      userId,
      flowProcessStore.flowProcess,
      solicitudStore.solicitud.finva_user_id
    );
    hideLoading();
    showNotificationSuccess("Cliente registrado exitosamente");
  }
};

const uploadFiles = async (is_valid: boolean) => {
  showLoading({ message: "Subiendo su identificación ..." });
  await uploadFile(
    typeIdValidation == "cardHolder" ? "cardHolderIdFront" : "officialIdFront",
    officialIdFront.value!,
    typeIdValidation != "cardHolder",
    is_valid
  );
  await uploadFile(
    typeIdValidation == "cardHolder"
      ? "cardHolderIdReverse"
      : "officialIdReverse",
    officialIdReverse.value!,
    typeIdValidation != "cardHolder",
    is_valid
  );
  hideLoading();
  showNotificationSuccess("Archivos subido con éxito.");
};

const processAutomaticValidation = async () => {
  const formData = new FormData();
  formData.append("image_front", officialIdFront.value!);
  formData.append("image_back", officialIdReverse.value!);
  const {
    curp,
    front_info,
    validation_details,
    validation_results,
    back_info,
    rfc: rfcFromResponse,
    id_number,
    is_valid,
    ine_validation_message,
    ine_validation_clave_mensaje,
    ine_validation_user_message,
  } = await validateCredentialComplete(formData);
  return {
    curp,
    front_info,
    validation_details,
    validation_results,
    back_info,
    rfc: rfcFromResponse,
    id_number,
    is_valid,
    ine_validation_message,
    ine_validation_clave_mensaje,
    ine_validation_user_message,
  };
};

const processError = (error: any, stepFailed: string) => {
  notifySentry(error, {
    pageName: "id-validation",
    shouldSkipError: errorConditions["id-validation"],
    additionalContext: {
      operation: stepFailed,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      stepFailed,
      error_message: error.message,
      error_name: error.name,
    },
  });
};

const isCardHolder = typeIdValidation === "cardHolder";

const handleFileSelect = (type: 'front' | 'reverse', file: File | FileList | null | undefined | unknown) => {
  // Handle null or empty selection
  if (!file) {
    if (type === 'front') {
      previewFront.value = null;
    } else {
      previewReverse.value = null;
    }
    return;
  }

  // Handle FileList (multiple files - take first one)
  let selectedFile: File | null = null;
  if (file instanceof FileList) {
    selectedFile = file.length > 0 ? file[0] : null;
  } else if (file instanceof File) {
    selectedFile = file;
  } else if (Array.isArray(file) && file.length > 0) {
    // Quasar might return an array
    const firstItem = file[0] as unknown;
    if (firstItem instanceof File) {
      selectedFile = firstItem;
    }
  } else if (file && typeof file === 'object' && 'name' in file && 'size' in file) {
    // Might be a file-like object - verify it's actually a File
    try {
      const fileObj = file as unknown;
      if (fileObj instanceof File) {
        selectedFile = fileObj;
      }
    } catch {
      // Not a File object
    }
  }

  if (!selectedFile) {
    if (type === 'front') {
      previewFront.value = null;
    } else {
      previewReverse.value = null;
    }
    return;
  }

  // Validate file type
  if (!selectedFile.type || !selectedFile.type.startsWith('image/')) {
    showNotificationError('Por favor selecciona un archivo de imagen válido');
    if (type === 'front') {
      officialIdFront.value = null;
      previewFront.value = null;
    } else {
      officialIdReverse.value = null;
      previewReverse.value = null;
    }
    return;
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (selectedFile.size > maxSize) {
    showNotificationError('La imagen es demasiado grande. Por favor selecciona una imagen menor a 10MB.');
    if (type === 'front') {
      officialIdFront.value = null;
      previewFront.value = null;
    } else {
      officialIdReverse.value = null;
      previewReverse.value = null;
    }
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      if (type === 'front') {
        previewFront.value = e.target.result as string;
      } else {
        previewReverse.value = e.target.result as string;
      }
    }
  };
  reader.onerror = () => {
    showNotificationError('Error al leer la imagen. Por favor intenta de nuevo.');
    if (type === 'front') {
      officialIdFront.value = null;
      previewFront.value = null;
    } else {
      officialIdReverse.value = null;
      previewReverse.value = null;
    }
  };
  reader.readAsDataURL(selectedFile);
};

const removePreview = (type: 'front' | 'reverse') => {
  if (type === 'front') {
    officialIdFront.value = null;
    previewFront.value = null;
  } else {
    officialIdReverse.value = null;
    previewReverse.value = null;
  }
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};

const resetIneImages = () => {
  officialIdFront.value = null;
  officialIdReverse.value = null;
  previewFront.value = null;
  previewReverse.value = null;
};

const showQualityAndReset = () => {
  showImageQualityDialog.value = true;
  resetIneImages();
};

const ineValidation = async (typeValidation: string) => {
  loading.value = true;

  if (!officialIdFront.value || !officialIdReverse.value) {
    showNotificationError(
      "Por favor carga ambas imágenes (frente y reverso) de tu INE."
    );
    loading.value = false;
    return;
  }

  let validationData;

  try {
    showLoading({
      message: "Validando la información de la identificación ...",
    });

    try {
      validationData = await processAutomaticValidation();
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 422) {
        if (!isCardHolder) {
          if (!firstTryValidation.value) {
            showDialog.value = true;
          } else {
            firstTryValidation.value = false;
            showQualityAndReset();
          }
        } else {
          showQualityAndReset();
        }
        processError(err, "validateAutomatic");
        return;
      }
      processError(err, "validateAutomatic");
      if (!isCardHolder) {
        if (!firstTryValidation.value) {
          showDialog.value = true;
          return;
        }
        firstTryValidation.value = false;
        showQualityAndReset();
        return;
      } else {
        showQualityAndReset();
        return;
      }
    } finally {
      hideLoading();
    }

    if (!validationData) {
      processError(
        new Error(`validateCredentialComplete returned undefined`),
        "validateAutomatic"
      );
      if (!isCardHolder) {
        if (!firstTryValidation.value) {
          showDialog.value = true;
        } else {
          firstTryValidation.value = false;
          showQualityAndReset();
        }
      } else {
        showQualityAndReset();
      }
      return;
    }

    const {
      curp: curpData,
      front_info: frontInfo,
      validation_details: validationDetails,
      validation_results: validationResults,
      back_info: backInfo,
      rfc: rfcFromResponse,
      id_number: idNumberFromResponse,
      is_valid: overallIsValid,
      ine_validation_message,
      ine_validation_clave_mensaje,
      ine_validation_user_message,
    } = validationData;

    if (!overallIsValid) {
      const errorMessage =
        ine_validation_user_message ||
        ine_validation_message ||
        "La validación de identificación falló. Por favor, verifica que la información sea correcta.";

      showNotificationError(errorMessage);
      processError(
        new Error(
          `Overall validation failed: INE=${validationDetails.ine?.is_valid}, CURP=${validationDetails.curp?.is_valid}`
        ),
        `validate${typeValidation === "automatic" ? "Automatic" : "Manual"}`
      );
      return;
    }

    showLoading({ message: "Validando el curp ..." });
    if (!validationDetails.curp?.is_valid) {
      const errorMessage =
        typeValidation === "automatic"
          ? "El curp extraído de la identificación no es válido, ingrese los datos manuales."
          : "El curp proporcionado no es válido, valide la información proporcionada.";

      showNotificationError(errorMessage);

      if (typeValidation === "automatic") {
        client.curp = curpData;
        showDialog.value = true;
      }
      processError(
        new Error(`Invalid curp: ${curpData}`),
        `validate${typeValidation === "automatic" ? "Automatic" : "Manual"}`
      );
      return;
    }
    const curpDataExtracted = validationResults.curp?.data;

    showLoading({ message: "Confirmando su información ..." });
    if (rfcFromResponse) {
      curpDataExtracted.rfc = rfcFromResponse;
    }
    setClientDataFromCurpData(curpDataExtracted);

    if (idNumberFromResponse) {
      client.id_number = idNumberFromResponse;
    }

    if (typeValidation === "automatic") {
      setClientDataFromFrontOcrData(frontInfo);
      setClientDataFromBackOcrData(backInfo);

      if (idNumberFromResponse) {
        client.id_number = idNumberFromResponse;
      }
    }

    if (!isCardHolder) {
      hideLoading();
      showLoading({ message: "Registrando su información ..." });
      await handleClientRegistration();
      hideLoading();
    }

    // Handle INE validation result
    if (!validationDetails.ine?.is_valid) {
      clientStore.idValidated = false;

      // Get user-friendly error message
      const errorMessage = getIneValidationErrorMessage(
        validationData.ine_validation_user_message,
        validationData.ine_validation_message,
        validationData.ine_validation_clave_mensaje
      );

      showNotificationError(errorMessage);
      
      // Log for debugging
      if (import.meta.client && import.meta.dev) {
        console.warn('[id-validation] INE validation failed:', {
          clave_mensaje: validationData.ine_validation_clave_mensaje,
          user_message: validationData.ine_validation_user_message,
          technical_message: validationData.ine_validation_message,
          curp_valid: validationDetails.curp?.is_valid
        });
      }
      
      processError(
        new Error(
          `Invalid INE: clave_mensaje=${validationData.ine_validation_clave_mensaje}, message=${validationData.ine_validation_message}`
        ),
        `validate${typeValidation === "automatic" ? "Automatic" : "Manual"}`
      );
      return;
    } else {
      // INE is valid
      clientStore.idValidated = true;
    }

    showLoading({ message: "Subiendo su identificación ..." });
    try {
      await uploadFiles(validationDetails.ine?.is_valid);
    } catch (err: any) {
      showNotificationError(
        "Error al subir los archivos, por favor comunicarse con el asesor"
      );
      processError(err, "uploadFiles");
      return;
    } finally {
      hideLoading();
    }

    if (isCardHolder) {
      // Handle card holder flow - would need purchaseStore
      showNotificationError("Flujo de titular de tarjeta no implementado aún");
    } else {
      router.push("/confirm-data");
    }
  } catch (err: any) {
    processError(err, "ineValidationProcess");
  } finally {
    hideLoading();
    loading.value = false;
  }
};

const validateUserCurp = async () => {
  showLoading("Validando CURP...");
  let client_data;
  try {
    const body = {
      curp: client.curp,
    };
    client_data = await validateCurpInformation(body);
    const { status } = client_data;
    if (Object.keys(client_data).length === 0 || status !== "FOUND") {
      const messageError =
        "El curp no es válido, valide la información proporcionada.";
      showNotificationError(messageError);
      return null;
    }
  } catch (error: any) {
    if (!firstTryValidationCurp.value) {
      // Show advisor dialog - simplified for now
      showNotificationError(
        "Por favor contacta con un asesor para continuar"
      );
      return;
    }
    notifySentry(error, {
      pageName: "curp-validation",
      shouldSkipError: errorConditions["curp-validation"],
    });

    if (
      error.response?.status === 400 &&
      error.response?.data?.success === false
    ) {
      const errorMessage = error.response.data.message;
      showNotificationError(errorMessage);
    } else if (error.response?.status === 503) {
      showNotificationError(
        "El servicio de validación de CURP no está disponible en este momento. Por favor, intente más tarde."
      );
    } else if (error.response?.status === 422) {
      showNotificationError(
        "El CURP no es válido o no existe en el registro. Por favor, verifique que el CURP sea correcto."
      );
    } else if (error.response?.status === 500) {
      showNotificationError(
        "Error en el servicio de validación de CURP. Por favor, intente más tarde o verifique que el CURP sea correcto."
      );
    } else {
      showNotificationError(
        "La información proporcionada no coincide con el registro"
      );
    }
    firstTryValidationCurp.value = false;
    return null;
  } finally {
    hideLoading();
  }
  setClientDataFromCurpData(client_data);
  try {
    await handleClientRegistration();
  } catch (err: any) {
    showNotificationError(
      "Error al registrar el cliente, por favor comunicarse con el asesor"
    );
    processError(err, "handleClientRegistration");
    return;
  }
  clientStore.idValidated = false;
  showLoading({ message: "Subiendo su identificación ..." });
  try {
    await uploadFiles(false);
  } catch (err: any) {
    showNotificationError(
      "Error al subir los archivos, por favor comunicarse con el asesor"
    );
    processError(err, "uploadFiles");
    return;
  }
  router.push("/confirm-data");
};
</script>

<style scoped>
.id-validation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 1rem;
  padding-top: calc(1rem + 80px + 94px); /* Account for navbar + stepper */
  padding-bottom: 2rem;
}

@media (max-width: 640px) {
  .id-validation-page {
    padding-top: calc(0.75rem + 80px + 94px);
  }
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

/* Header Section */
.header-section {
  padding: 2rem 1.5rem 1rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-bottom: 0;
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

/* Info Section */
.info-section {
  padding: 1rem 1.5rem;
}

.info-card {
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.05) 0%, rgba(38, 224, 133, 0.05) 100%);
  border: 2px solid rgba(38, 224, 133, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #242424;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.info-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-top: 0.125rem;
}

.info-text {
  flex: 1;
  font-size: 0.875rem;
  color: rgba(36, 36, 36, 0.8);
  line-height: 1.5;
}

/* Upload Section */
.upload-section {
  padding: 2rem 1.5rem;
}

.upload-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .upload-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

.upload-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
}

.upload-card:hover {
  border-color: #26e085;
  box-shadow: 0 4px 12px rgba(38, 224, 133, 0.15);
  transform: translateY(-2px);
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  justify-content: center;
}

.upload-icon {
  color: #26e085;
}

.upload-title {
  font-size: 1rem;
  font-weight: 600;
  color: #242424;
}

.upload-preview {
  width: 100%;
  max-width: 280px;
  height: 180px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 2px dashed #d1d5db;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: 0.6;
}

.upload-preview-selected {
  width: 100%;
  max-width: 280px;
  height: 180px;
  margin-bottom: 1rem;
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 2px solid #26e085;
  background: white;
}

.preview-image-selected {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remove-preview-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  z-index: 10;
}

.remove-preview-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.file-input {
  width: 100%;
  max-width: 280px;
}

.file-selected-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(38, 224, 133, 0.1);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 280px;
}

.file-name {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* Actions Section */
.actions-section {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.actions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.primary-actions,
.secondary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.action-btn {
  min-width: 160px;
  height: 3rem;
  font-weight: 600;
  border-radius: 0.75rem;
  font-size: 0.875rem;
}

.primary-btn {
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(47, 255, 150, 0.3) !important;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #26e085 0%, #1fb870 100%) !important;
  box-shadow: 0 6px 16px rgba(47, 255, 150, 0.4) !important;
  transform: translateY(-2px);
}

.primary-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(47, 255, 150, 0.3) !important;
}

.primary-btn:disabled {
  background: #d1d5db !important;
  color: #9ca3af !important;
  cursor: not-allowed;
  box-shadow: none !important;
}

@media (max-width: 640px) {
  .id-validation-page {
    padding: 0.75rem;
    padding-top: calc(0.75rem + 80px + 94px);
  }

  .header-section {
    padding: 1.5rem 1rem 0.75rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .info-section {
    padding: 0.75rem 1rem;
  }

  .info-card {
    padding: 1rem;
  }

  .upload-section {
    padding: 1.5rem 1rem;
  }

  .upload-container {
    gap: 1.5rem;
  }

  .upload-card {
    padding: 1rem;
  }

  .upload-preview,
  .upload-preview-selected {
    height: 150px;
    max-width: 100%;
  }

  .actions-section {
    padding: 1rem;
  }

  .primary-actions,
  .secondary-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    min-width: unset;
  }
}

/* Dialog Styles */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

