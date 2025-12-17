<template>
  <ClientOnly>
    <div class="client-validation-container">
      <div class="validation-header">
        <h1 class="page-title">Validación de Cliente</h1>
        <p class="page-subtitle">Ingresa tus datos para continuar con el proceso</p>
      </div>

      <q-card class="validation-card">
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
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useClientStore } from '@/stores/clientStore'
import { useSolicitudStore } from '@/stores/solicitudStore'
import { useFlowProcessStore } from '@/stores/flowProcessStore'

const router = useRouter()
const $q = useQuasar()
const clientStore = useClientStore()
const solicitudStore = useSolicitudStore()
const flowStore = useFlowProcessStore()

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
</script>

<style scoped>
.client-validation-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.validation-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.validation-card {
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.validation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input {
  width: 100%;
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
  color: #374151;
}

.clue-value {
  font-weight: 700;
  color: #2FFF96;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.form-button {
  min-width: 120px;
  height: 3rem;
  font-weight: 600;
}

.privacy-notice {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 2rem;
}

.privacy-link {
  color: #2FFF96;
  text-decoration: underline;
}

.registration-dialog-card {
  border-radius: 16px;
  max-width: 600px;
  width: 90vw;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.dialog-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
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
  color: #1f2937;
}

.option-icon {
  color: #2FFF96;
  font-size: 1.25rem;
}

.option-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
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

@media (max-width: 640px) {
  .client-validation-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-buttons {
    flex-direction: column;
  }

  .form-button {
    width: 100%;
  }
}
</style>

