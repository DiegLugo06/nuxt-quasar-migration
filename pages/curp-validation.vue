<template>
  <ClientOnly>
    <ProcessStepper v-if="showStepper" />
    <div class="curp-validation-container">
      <div class="main-card">
        <div class="step-content">
          <div class="info-card">
            <div class="info-header">
              <div class="brand-icon-box">
                <q-icon name="verified_user" size="24px" />
              </div>
              <h3 class="info-title">Validar CURP</h3>
            </div>

            <q-card class="validation-card" flat>
              <q-card-section>
                <q-form @submit.prevent="submitForm" class="validation-form">
                  <!-- CURP Input -->
                  <q-input
                    v-model="client.curp"
                    label="CURP"
                    outlined
                    size="md"
                    class="form-input"
                    :rules="[
                      (val) => !!val || 'El CURP es obligatorio',
                      (val) => (val && val.length === 18) || 'El CURP debe tener 18 caracteres',
                    ]"
                    @update:model-value="(val) => {
                      if (val && typeof val === 'string') {
                        client.curp = val.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      }
                    }"
                  >
                    <template v-slot:prepend>
                      <q-icon name="badge" />
                    </template>
                    <template v-slot:hint>
                      Ingresa tu CURP de 18 caracteres
                    </template>
                  </q-input>

                  <!-- Buttons -->
                  <div class="form-buttons">
                    <q-btn
                      outline
                      color="grey-7"
                      class="action-btn back-btn"
                      @click="goBack"
                      unelevated
                    >
                      <q-icon name="arrow_back" class="q-mr-sm" /> Regresar
                    </q-btn>
                    <q-btn
                      unelevated
                      type="submit"
                      color="primary"
                      class="action-btn primary-btn"
                      :loading="loading"
                      :disable="!isValid"
                    >
                      Validar CURP
                      <q-icon name="check_circle" class="q-ml-sm" />
                    </q-btn>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
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
import ProcessStepper from '@/components/ProcessStepper.vue'
import { useErrorHandling } from '~/composables/useErrorHandling'

const router = useRouter()
const $q = useQuasar()
const clientStore = useClientStore()
const solicitudStore = useSolicitudStore()
const flowProcessStore = useFlowProcessStore()
const { notifySentry } = useErrorHandling()

// Computed property to check if stepper should be shown
const showStepper = computed(() => {
  return flowProcessStore.flowProcess === 'onCreditWeb'
})

const { client, validateCurpInformation, registerClient, getClient } = clientStore

const loading = ref(false)

const isValid = computed(() => {
  return client.curp && client.curp.length === 18
})

const updateClientInfo = (client_data: any) => {
  const {
    nombres,
    primerApellido,
    segundoApellido,
    sexo,
    fechaNacimiento,
    curp,
    entidad,
    rfc,
  } = client_data
  client.name = nombres.split(' ')[0]
  client.second_name = nombres.split(' ').slice(1).join(' ') || ''
  client.first_last_name = primerApellido
  client.second_last_name = segundoApellido
  client.sex = sexo.toUpperCase() == 'HOMBRE' ? 'M' : 'F'
  client.birth_date = fechaNacimiento
  client.curp = curp.toUpperCase()
  client.born_state =
    entidad.toUpperCase() == 'CIUDAD DE MEXICO'
      ? 'Ciudad de México'
      : entidad.charAt(0).toUpperCase() + entidad.slice(1).toLowerCase()
  client.id_type = 'CURP'
  client.id_number = curp.toUpperCase()
  if (rfc) {
    client.rfc = rfc
  }
}

const validateUserCurp = async () => {
  $q.loading.show({
    message: 'Validando CURP...',
  })

  try {
    const body = {
      curp: client.curp.toUpperCase(),
    }

    const client_data = await validateCurpInformation(body)

    if (Object.keys(client_data).length === 0) {
      const messageError =
        'El curp no es válido, valide la información proporcionada.'
      $q.notify({
        type: 'negative',
        message: messageError,
        position: 'top',
      })
      return null
    }

    const { curp, status } = client_data

    if (status === 'FOUND') {
      await updateClientInfo(client_data)
      return { curp, status, client_data }
    }

    return { curp, status }
  } catch (error: any) {
    notifySentry(error, {
      pageName: 'curp-validation',
      shouldSkipError: false,
    })

    // Handle new CURP validation error responses
    if (
      error.response?.status === 400 &&
      error.response?.data?.success === false
    ) {
      // New error response format with mapped messages
      const errorMessage = error.response.data.message
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      })
    } else if (error.response?.status === 503) {
      $q.notify({
        type: 'negative',
        message:
          'El servicio de validación de CURP no está disponible en este momento. Por favor, intente más tarde.',
        position: 'top',
      })
    } else if (error.response?.status === 422) {
      $q.notify({
        type: 'negative',
        message:
          'El CURP no es válido o no existe en el registro. Por favor, verifique que el CURP sea correcto.',
        position: 'top',
      })
    } else if (error.response?.status === 500) {
      $q.notify({
        type: 'negative',
        message:
          'Error en el servicio de validación de CURP. Por favor, intente más tarde o verifique que el CURP sea correcto.',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'La información proporcionada no coincide con el registro',
        position: 'top',
      })
    }
    return null
  } finally {
    $q.loading.hide()
  }
}

const handleClientRegistration = async () => {
  if (client.id) {
    $q.loading.show({
      message: 'Actualizando información del usuario...',
    })
    await clientStore.updateClientData(client.id)
    $q.loading.hide()
    $q.notify({
      type: 'positive',
      message: 'Cliente actualizado exitosamente',
      position: 'top',
    })
  } else {
    $q.loading.show({
      message: 'Guardando información del usuario...',
    })
    // For onCreditWeb, use simplified user assignment
    const userId = solicitudStore.solicitud.finva_user_id || 1

    const id = await registerClient(
      userId,
      flowProcessStore.flowProcess,
      solicitudStore.solicitud.finva_user_id
    )
    $q.loading.hide()
    $q.notify({
      type: 'positive',
      message: 'Cliente registrado exitosamente',
      position: 'top',
    })
  }
}

const submitForm = async () => {
  if (!isValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, ingresa un CURP válido de 18 caracteres.',
      position: 'top',
    })
    return
  }

  try {
    const validation = await validateUserCurp()
    if (!validation) {
      return
    }

    const { status } = validation

    if (status === 'NOT_FOUND') {
      const errorMessage =
        'Error al validar curp. La información no coincide con ningún registro.'
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      })
      return
    } else if (status === 'NOT_VALID') {
      const errorMessage =
        'El curp no es válido, favor de verificar que el CURP es correcto'
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      })
      return
    }

    await handleClientRegistration()

    const clientData = await getClient()

    if (clientData.client_id) {
      $q.notify({
        type: 'positive',
        message: 'Información registrada correctamente.',
        position: 'top',
      })
      router.push('/confirm-data')
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al procesar la información del cliente',
        position: 'top',
      })
    }
  } catch (error: any) {
    notifySentry(error, {
      pageName: 'curp-validation',
      shouldSkipError: false,
    })

    const mappedError = error.response?.data?.error
    if (typeof mappedError === 'string') {
      if (mappedError.includes('A client with this email already exists.')) {
        $q.notify({
          type: 'negative',
          message: 'Error al registrar cliente. Email ya registrado.',
          position: 'top',
        })
      } else if (
        mappedError.includes('A client with this phone already exists.')
      ) {
        $q.notify({
          type: 'negative',
          message: 'Error al registrar cliente. Celular ya registrado.',
          position: 'top',
        })
      }
    } else {
      $q.notify({
        type: 'negative',
        message: `Error inesperado: ${error.message || error}`,
        position: 'top',
      })
    }
  } finally {
    $q.loading.hide()
  }
}

function goBack() {
  router.push('/client-validation')
}
</script>

<style scoped>
.curp-validation-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 1rem;
  padding-top: calc(1rem + 80px + 94px); /* Account for navbar + stepper */
  padding-bottom: 2rem;
  display: flex;
  justify-content: center;
}

/* Main Card */
.main-card {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* Step Content */
.step-content {
  padding: 0;
}

/* Info Card */
.info-card {
  padding: 2rem 1.5rem 1rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  text-align: center;
  justify-content: center;
}

.brand-icon-box {
  color: #242424;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #242424;
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .info-title {
    font-size: 2rem;
  }
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

:deep(.form-input .q-field__messages) {
  color: #242424;
  opacity: 0.7;
  font-size: 0.75rem;
}

.form-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  min-width: 160px;
  height: 3rem;
  font-weight: 600;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.back-btn {
  border: 2px solid #e2e8f0 !important;
  background: white !important;
  color: #242424 !important;
}

.back-btn:hover:not(:disabled) {
  border-color: #cbd5e1 !important;
  background: #f8fafc !important;
  transform: translateY(-2px);
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

@media (min-width: 768px) {
  .curp-validation-container {
    padding: 2rem;
    padding-top: calc(2rem + 80px + 94px);
  }

  .info-card {
    padding: 2.5rem 2rem 1.5rem;
  }
}

@media (max-width: 640px) {
  .curp-validation-container {
    padding: 0.75rem;
    padding-top: calc(0.75rem + 80px + 94px);
  }

  .info-card {
    padding: 1.5rem 1rem 1rem;
  }

  .form-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>

