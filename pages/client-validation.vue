<template>
  <ClientOnly>
    <ProcessStepper v-if="showStepper" />
    <div class="client-validation-container">
      <div class="main-card">
        <div class="step-content">
          <div class="info-card">
            <div class="info-header">
              <div class="brand-icon-box">
                <q-icon name="verified_user" size="24px" />
              </div>
              <h3 class="info-title">Validación de Cliente</h3>
            </div>

            <q-card class="validation-card" flat>
              <q-card-section>
                <q-form @submit.prevent="handleFormSubmit" class="validation-form">
            <!-- Phone Input -->
            <q-input
              v-if="!invalidTypeData"
              v-model="phoneComputed"
              label="Celular"
              :rules="[
                (val) => !!val || 'El celular es obligatorio',
                (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
              ]"
              outlined
              mask="(##) #### ####"
              type="tel"
              class="form-input"
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <!-- Email Input -->
            <q-input
              v-if="!invalidTypeData"
              v-model="client.email"
              label="Correo electrónico"
              :rules="[
                (val) => !!val || 'El correo es obligatorio',
                (val) => /.+@.+\..+/.test(val) || 'Correo inválido',
              ]"
              type="email"
              outlined
              class="form-input"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Email Clue (if email mismatch) -->
            <div v-if="invalidTypeData === 'email' && clientRegistered" class="clue-section">
              <div class="clue-text">
                El correo registrado con este número es:
              </div>
              <span class="clue-value">
                <q-icon name="email" color="primary" /> {{ clueRef }}
              </span>
              <q-input
                v-model="email"
                label="Confirma tu correo electrónico"
                :rules="[
                  (val) => !!val || 'El correo es obligatorio',
                  (val) => /.+@.+\..+/.test(val) || 'Correo inválido',
                ]"
                type="email"
                outlined
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>

            <!-- Phone Clue (if phone mismatch) -->
            <div v-if="invalidTypeData === 'phone' && clientRegistered" class="clue-section">
              <div class="clue-text">
                El celular registrado con este correo es:
              </div>
              <span class="clue-value">
                <q-icon name="phone" color="primary" /> {{ clueRef }}
              </span>
              <q-input
                v-model="phone"
                label="Confirma tu número celular"
                :rules="[
                  (val) => !!val || 'El celular es obligatorio',
                  (val) => val.length === 14 || 'Debe ser un número de 10 dígitos',
                ]"
                outlined
                mask="(##) #### ####"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>
            </div>

            <!-- Buttons -->
            <div v-if="!clientRegistered" class="form-buttons">
              <q-btn
                label="Regresar"
                color="primary"
                outline
                icon="arrow_back"
                @click="goBack"
                class="form-button"
              />
              <q-btn
                label="Validar"
                type="submit"
                color="primary"
                icon="check_circle"
                :loading="loading"
                @click="validatePhoneClient"
                class="form-button"
              />
            </div>
            <div v-else class="form-buttons">
              <q-btn
                color="primary"
                outline
                label="Regresar"
                icon="arrow_back"
                @click="resetValidation"
                class="form-button"
              />
              <q-btn
                label="Validar"
                type="submit"
                color="primary"
                icon="check_circle"
                :loading="loading"
                class="form-button"
              />
            </div>
                </q-form>

                <!-- Privacy Notice -->
                <div class="privacy-notice">
                  Al dar click en validar, estás aceptando nuestro
                  <a
                    href="https://ferbel.retool.com/embedded/public/b22a6d31-f47f-4a7c-a01e-7e8bfad9ce82"
                    target="_blank"
                    class="privacy-link"
                  >
                    aviso de privacidad
                  </a>.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration Options Dialog -->
    <q-dialog v-model="showRegistrationDialog" persistent>
        <q-card class="registration-dialog-card">
          <q-card-section class="text-center">
            <div class="dialog-title">¿Cómo deseas registrarte?</div>
            <div class="dialog-subtitle">Selecciona una opción para continuar</div>
          </q-card-section>

          <q-card-section>
            <div class="registration-options">
              <div
                class="option-item"
                :class="{ selected: selectedOption === 'ine' }"
                @click="selectedOption = 'ine'"
              >
                <div class="option-content">
                  <div class="option-title">
                    <q-icon name="credit_card" class="option-icon" />
                    Tengo mi INE a la mano
                  </div>
                  <div class="option-subtitle">
                    Te pediremos fotos de ella, pero es el proceso más rápido
                  </div>
                  <div class="option-tag">INE</div>
                </div>
              </div>

              <div
                class="option-item"
                :class="{ selected: selectedOption === 'curp' }"
                @click="selectedOption = 'curp'"
              >
                <div class="option-content">
                  <div class="option-title">
                    <q-icon name="badge" class="option-icon" />
                    Identificarme con CURP
                  </div>
                  <div class="option-subtitle">
                    Te pediremos que ingreses manualmente el CURP
                  </div>
                  <div class="option-tag">CURP</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancelar"
              color="grey"
              @click="showRegistrationDialog = false"
            />
            <q-btn
              :disable="!selectedOption"
              label="Continuar"
              color="primary"
              @click="handleRegistrationOption"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useClientStore } from '@/stores/clientStore'
import { useSolicitudStore } from '@/stores/solicitudStore'
import { useFlowProcessStore } from '@/stores/flowProcessStore'
import ProcessStepper from '@/components/ProcessStepper.vue'

const router = useRouter()
const $q = useQuasar()
const clientStore = useClientStore()
const solicitudStore = useSolicitudStore()
const flowStore = useFlowProcessStore()

// Computed property to check if stepper should be shown
const showStepper = computed(() => {
  return flowStore.flowProcess === 'onCreditWeb'
})

// State
const loading = ref(false)
const clientRegistered = ref(false)
const email = ref('')
const phone = ref('')
const clueRef = ref('')
const invalidTypeData = ref('')
const showRegistrationDialog = ref(false)
const selectedOption = ref('')

const { client, validatePhoneAndEmail, getClient } = clientStore

// Computed
const phoneComputed = computed({
  get() {
    return client.phone
      .replace('+52', '')
      .replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2 $3')
  },
  set(value) {
    client.phone = `+52${value.replace(/\D/g, '')}`
  },
})

const isFormValid = computed(() => {
  const isEmailValid = /.+@.+\..+/.test(client.email)
  const isPhoneValid = client.phone.length === 13

  if (invalidTypeData.value === 'email') {
    return email.value && isPhoneValid
  }
  if (invalidTypeData.value === 'phone') {
    return phone.value && isEmailValid
  }
  return isEmailValid && isPhoneValid
})

// Methods
function showNotification(type: string, message: string) {
  $q.notify({ type, message, position: 'top' })
}

async function validatePhoneClient() {
  if (!isFormValid.value) {
    showNotification('negative', 'Por favor, completa todos los campos obligatorios.')
    return
  }

  loading.value = true
  try {
    const { status, type, clue } = await validatePhoneAndEmail()
    if (status === 'validated') {
      const validation = await getClient()
      await handleValidationResponse(validation)
    } else {
      clientRegistered.value = true
      clueRef.value = clue
      invalidTypeData.value = type
      showNotification(
        'negative',
        type === 'email'
          ? 'El email ingresado no coincide con el registro del cliente'
          : type === 'phone'
          ? 'El celular ingresado no coincide con el registro del cliente'
          : 'Ocurrió un error inesperado, intentar de nuevo'
      )
    }
  } catch (err: any) {
    if (err.response?.status === 404) {
      showRegistrationDialog.value = true
    } else {
      showNotification('negative', `Ocurrió un error inesperado: ${err.message || err}`)
    }
  } finally {
    loading.value = false
  }
}

async function validateStepClient() {
  loading.value = true
  try {
    if (invalidTypeData.value === 'email') {
      client.email = email.value
    } else if (invalidTypeData.value === 'phone') {
      client.phone = `+52${phone.value.replace(/\D/g, '')}`
    }
    const validation = await getClient()
    await handleValidationResponse(validation)
  } catch (err: any) {
    showNotification('negative', 'La información proporcionada no coincide con el registro')
  } finally {
    loading.value = false
  }
}

async function handleValidationResponse(validation: any) {
  const { client_id, report, id, has_purchases } = validation
  if (client_id) {
    // Navigate to next step (would be confirm-data or id-validation based on validation)
    if (id) {
      router.push('/confirm-data')
    } else {
      router.push('/id-validation')
    }
  }
}

function handleFormSubmit() {
  if (!isFormValid.value) {
    showNotification('negative', 'Por favor, completa todos los campos obligatorios.')
    return
  }
  if (!clientRegistered.value) {
    validatePhoneClient()
  } else {
    validateStepClient()
  }
}

function handleRegistrationOption() {
  if (selectedOption.value === 'ine') {
    router.push('/id-validation')
  } else if (selectedOption.value === 'curp') {
    router.push('/curp-validation')
  }
  showRegistrationDialog.value = false
}

function resetValidation() {
  clientRegistered.value = false
  invalidTypeData.value = ''
  email.value = ''
  phone.value = ''
  clueRef.value = ''
}

function goBack() {
  router.push('/confirm-store')
}

// Auto-validate if phone and email are already filled
const shouldAutoValidate = computed(() => {
  const isEmailValid = /.+@.+\..+/.test(client.email)
  const isPhoneValid = client.phone.length === 13
  return isEmailValid && isPhoneValid && !clientRegistered.value && !loading.value
})

// Watch for auto-validation
watch(shouldAutoValidate, (newVal) => {
  if (newVal) {
    // Small delay to ensure form is ready
    setTimeout(() => {
      if (shouldAutoValidate.value) {
        validatePhoneClient()
      }
    }, 500)
  }
})

// Also check on mount
onMounted(() => {
  if (shouldAutoValidate.value) {
    setTimeout(() => {
      if (shouldAutoValidate.value) {
        validatePhoneClient()
      }
    }, 500)
  }
})
</script>

<style scoped>
.client-validation-container {
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
  padding: 0;
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

.validation-card {
  width: 100%;
  box-shadow: none;
  background: transparent;
}

.validation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input {
  width: 100%;
}

:deep(.form-input .q-field__control) {
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: #fcfcfc;
  transition: all 0.2s ease;
}

:deep(.form-input .q-field--focused .q-field__control) {
  background: #ffffff;
  border-color: #242424;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.form-input .q-field__native),
:deep(.form-input .q-field__input) {
  font-weight: 600;
  color: #242424;
}

:deep(.form-input .q-field__label) {
  color: #242424;
  font-weight: 500;
  opacity: 0.7;
}

.clue-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.clue-text {
  font-size: 0.875rem;
  color: #242424;
  opacity: 0.8;
}

.clue-value {
  font-weight: 700;
  color: #242424;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0 1.5rem;
}

.form-button {
  flex: 1;
  height: 52px;
  border-radius: 14px;
  font-weight: 800;
  text-transform: none;
  transition: all 0.3s ease;
}

:deep(.form-button.q-btn--outline) {
  border: 2px solid #242424 !important;
  color: #242424 !important;
  background: white !important;
}

:deep(.form-button.q-btn--outline:hover) {
  background: #f8fafc !important;
  border-color: #242424 !important;
}

:deep(.form-button:not(.q-btn--outline)) {
  background: #2FFF96 !important;
  color: #242424 !important;
  box-shadow: 0 8px 15px rgba(47, 255, 150, 0.2) !important;
}

:deep(.form-button:not(.q-btn--outline):hover) {
  box-shadow: 0 10px 20px rgba(47, 255, 150, 0.3) !important;
  transform: translateY(-2px);
}

.privacy-notice {
  text-align: center;
  color: #242424;
  font-size: 0.875rem;
  margin-top: 2rem;
  padding: 0 1.5rem;
  opacity: 0.7;
}

.privacy-link {
  color: #242424;
  text-decoration: underline;
  font-weight: 600;
}

.registration-dialog-card {
  border-radius: 16px;
  max-width: 600px;
  width: 90vw;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #242424;
  margin-bottom: 0.5rem;
}

.dialog-subtitle {
  font-size: 0.875rem;
  color: #242424;
  opacity: 0.7;
}

.registration-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #2FFF96;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 255, 150, 0.15);
}

.option-item.selected {
  border-color: #2FFF96;
  background: rgba(47, 255, 150, 0.05);
  box-shadow: 0 4px 12px rgba(47, 255, 150, 0.2);
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: #242424;
}

.option-icon {
  color: #2FFF96;
  font-size: 1.25rem;
}

.option-subtitle {
  font-size: 0.875rem;
  color: #242424;
  opacity: 0.7;
  margin-left: 1.75rem;
}

.option-tag {
  display: inline-block;
  background: rgba(47, 255, 150, 0.1);
  color: #2FFF96;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  align-self: flex-start;
  margin-left: 1.75rem;
}

.option-item.selected .option-tag {
  background: #2FFF96;
  color: white;
}

@media (min-width: 768px) {
  .client-validation-container {
    padding: 2.5rem;
    padding-top: calc(2.5rem + 120px);
    max-width: 50rem;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .client-validation-container {
    max-width: 68rem;
    padding-top: calc(2.5rem + 120px);
  }

  .main-card {
    border-radius: 2.5rem;
  }
}
</style>

