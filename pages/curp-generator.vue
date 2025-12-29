<template>
  <ClientOnly>
    <ProcessStepper v-if="showStepper" />
    <div class="curp-generator-container">
      <div class="main-card">
        <div class="step-content">
          <div class="info-card">
            <div class="info-header">
              <div class="brand-icon-box">
                <q-icon name="badge" size="24px" />
              </div>
              <h3 class="info-title">Generar CURP</h3>
            </div>

            <q-card class="validation-card" flat>
              <q-card-section>
                <q-form @submit.prevent="submitForm" class="validation-form">
                  <!-- Primer nombre -->
                  <q-input
                    v-model="client.name"
                    label="Primer nombre"
                    outlined
                    size="md"
                    class="form-input"
                    :rules="[(val) => !!val || 'El primer nombre es obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>

                  <!-- Segundo nombre (opcional) -->
                  <q-input
                    v-model="client.second_name"
                    label="Segundo nombre (opcional)"
                    outlined
                    size="md"
                    class="form-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_outline" />
                    </template>
                  </q-input>

                  <!-- Primer apellido -->
                  <q-input
                    v-model="client.first_last_name"
                    label="Primer apellido (Paterno)"
                    outlined
                    size="md"
                    class="form-input"
                    :rules="[(val) => !!val || 'El primer apellido es obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>

                  <!-- Segundo apellido -->
                  <q-input
                    v-model="client.second_last_name"
                    label="Segundo apellido (Materno)"
                    outlined
                    size="md"
                    class="form-input"
                    :rules="[(val) => !!val || 'El segundo apellido es obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_outline" />
                    </template>
                  </q-input>

                  <!-- Sexo -->
                  <q-select
                    v-model="client.sex"
                    :options="sexOptions"
                    label="Sexo"
                    outlined
                    size="md"
                    emit-value
                    map-options
                    class="form-input"
                    :rules="[(val) => !!val || 'El sexo es obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="wc" />
                    </template>
                  </q-select>

                  <!-- Estado de nacimiento -->
                  <q-select
                    v-model="client.born_state"
                    :options="statesOfMexico"
                    label="Estado de nacimiento"
                    outlined
                    size="md"
                    class="form-input"
                    :rules="[(val) => !!val || 'El estado de nacimiento es obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="home" />
                    </template>
                  </q-select>

                  <!-- Fecha de nacimiento -->
                  <q-input
                    v-model="client.birth_date"
                    label="Fecha de nacimiento"
                    outlined
                    size="md"
                    mask="YYYY/MM/DD"
                    class="form-input"
                    :rules="[(val) => !!val || 'La fecha de nacimiento es obligatoria']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="client.birth_date" mask="YYYY/MM/DD">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Cerrar" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>

                  <!-- Buttons -->
                  <div class="form-buttons">
                    <q-btn
                      outline
                      class="form-button back-button"
                      @click="goBack"
                    >
                      <q-icon name="arrow_back" class="q-mr-sm" /> Regresar
                    </q-btn>
                    <q-btn
                      unelevated
                      type="submit"
                      class="form-button submit-button"
                      :loading="loading"
                      :disable="!isValid"
                    >
                      Generar CURP
                      <q-icon name="cloud_upload" class="q-ml-sm" />
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
import { statesOfMexico, statesCodes } from '@/helpers/data'
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

const { client, generateCurp, registerClient, getClient } = clientStore

const loading = ref(false)

const sexOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
]

const isValid = computed(() => {
  return (
    client.name &&
    client.first_last_name &&
    client.second_last_name &&
    client.sex &&
    client.born_state &&
    client.birth_date
  )
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

const generateUserCurp = async () => {
  $q.loading.show({
    message: 'Generando CURP con información del usuario...',
  })

  try {
    const stateCode = statesCodes[client.born_state]
    const sexCode = client.sex === 'M' ? 'H' : 'M'
    const body = {
      nombres: `${client.name}${client.second_name ? ' ' + client.second_name : ''}`,
      primerApellido: client.first_last_name,
      segundoApellido: client.second_last_name,
      sexo: sexCode,
      claveEntidad: stateCode,
      fechaNacimiento: client.birth_date,
    }

    const client_data = await generateCurp(body)

    if (Object.keys(client_data).length === 0) {
      const messageError =
        'El curp generado no es válido, valide la información proporcionada.'
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
      pageName: 'curp-generator',
      shouldSkipError: false,
    })
    $q.notify({
      type: 'negative',
      message: 'Error al generar CURP. Intente nuevamente.',
      position: 'top',
    })
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
      message: 'Por favor, completa todos los campos obligatorios.',
      position: 'top',
    })
    return
  }

  try {
    const validation = await generateUserCurp()
    if (!validation) {
      return
    }

    const { status } = validation

    if (status === 'NOT_FOUND') {
      const errorMessage =
        'Error al generar curp. La información no coincide con ningún registro.'
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      })
      return
    } else if (status === 'NOT_VALID') {
      const errorMessage =
        'El curp generado no es válido, favor de validar la información'
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
      pageName: 'curp-generator',
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
.curp-generator-container {
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
  gap: 1.25rem;
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

.back-button {
  border: 2px solid #242424 !important;
  color: #242424 !important;
  background: white !important;
}

.back-button:hover {
  background: #f8fafc !important;
  border-color: #242424 !important;
}

.submit-button {
  background: #2FFF96 !important;
  color: #242424 !important;
  box-shadow: 0 8px 15px rgba(47, 255, 150, 0.2) !important;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 0 10px 20px rgba(47, 255, 150, 0.3) !important;
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .curp-generator-container {
    padding: 2.5rem;
    padding-top: calc(2.5rem + 120px);
    max-width: 50rem;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .curp-generator-container {
    max-width: 68rem;
    padding-top: calc(2.5rem + 120px);
  }

  .main-card {
    border-radius: 2.5rem;
  }
}
</style>
