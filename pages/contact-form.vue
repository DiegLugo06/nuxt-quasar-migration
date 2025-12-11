<template>
  <div class="contact-form-container">
    <div class="form-header">
      <h1 class="form-title">Registro de cliente</h1>
    </div>

    <q-card class="form-card">
      <q-card-section>
        <q-form
          ref="formRef"
          @submit="handleSubmit"
        >
          <div class="q-gutter-md">
            <!-- Nombre -->
            <q-input
              v-model="formData.name"
              label="Nombre completo"
              outlined
              :rules="[val => !!val || 'El nombre es obligatorio']"
              clearable
            />

            <!-- Teléfono -->
            <q-input
              v-model="formData.phone"
              label="Teléfono"
              type="tel"
              outlined
              maxlength="14"
              :rules="[
                val => !!val || 'El teléfono es obligatorio',
                val => val.replace(/\D/g, '').length >= 10 || 'El teléfono debe tener al menos 10 dígitos'
              ]"
              @update:model-value="formatPhone"
              clearable
            />

            <!-- Correo -->
            <q-input
              v-model="formData.email"
              label="Correo electrónico"
              type="email"
              outlined
              :rules="[
                val => !!val || 'El correo es obligatorio',
                val => /.+@.+\..+/.test(val) || 'Ingresa un correo electrónico válido'
              ]"
              clearable
            />

            <!-- Dirección -->
            <q-input
              v-model="formData.street_address"
              label="Dirección"
              outlined
              :rules="[val => !!val || 'La dirección es obligatoria']"
              clearable
            />

            <!-- Código Postal -->
            <q-input
              v-model="formData.zip_code"
              label="Código Postal"
              outlined
              maxlength="5"
              :rules="[
                val => !!val || 'El código postal es obligatorio',
                val => val.length === 5 && /^\d+$/.test(val) || 'El código postal debe tener 5 dígitos'
              ]"
              @blur="handleZipCodeBlur"
              @update:model-value="handleZipCodeInput"
              clearable
            >
              <template v-slot:hint>
                <div v-if="loadingNeighborhoods" class="loading-feedback">
                  <q-spinner size="sm" color="primary" />
                  <span>Cargando colonias...</span>
                </div>
                <div v-else-if="zipCodeError" class="error-feedback">
                  {{ zipCodeError }}
                </div>
              </template>
            </q-input>

            <!-- Colonia -->
            <q-select
              v-model="formData.suburb_colonia"
              :options="neighborhoodOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Colonia"
              outlined
              :disable="!neighborhoodOptions.length || loadingNeighborhoods"
              :rules="[val => !!val || 'La colonia es obligatoria']"
              clearable
            >
              <template v-slot:hint>
                <div v-if="formData.zip_code && !neighborhoodOptions.length && !loadingNeighborhoods" class="hint-feedback">
                  Ingresa un código postal válido para ver las colonias disponibles
                </div>
              </template>
            </q-select>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <q-btn
              type="submit"
              color="primary"
              size="lg"
              class="full-width submit-button"
              :loading="submitting"
              :disable="!isFormValid"
            >
              Enviar
            </q-btn>
          </div>
        </q-form>

        <!-- Success Message -->
        <q-banner
          v-if="showSuccess"
          class="bg-positive text-white q-mt-md"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="check_circle" />
          </template>
          <div class="text-h6 q-mb-xs">¡Éxito!</div>
          Tus datos han sido enviados correctamente. Nos pondremos en contacto contigo pronto.
          <template v-slot:action>
            <q-btn flat dense icon="close" @click="showSuccess = false" />
          </template>
        </q-banner>

        <!-- Error Message -->
        <q-banner
          v-if="errorMessage"
          class="bg-negative text-white q-mt-md"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          <div class="text-h6 q-mb-xs">Error</div>
          {{ errorMessage }}
          <template v-slot:action>
            <q-btn flat dense icon="close" @click="errorMessage = ''" />
          </template>
        </q-banner>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'

// Add Inter font from Google Fonts
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    }
  ]
})

const $q = useQuasar()
const clientStore = useClientStore()
const route = useRoute()
const router = useRouter()
const formRef = ref(null)

// Form data
const formData = ref({
  name: '',
  phone: '',
  email: '',
  street_address: '',
  zip_code: '',
  suburb_colonia: null
})

// State
const loadingNeighborhoods = ref(false)
const submitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const zipCodeError = ref('')

// Computed
const neighborhoodOptions = computed(() => {
  return clientStore.neighborhoods.map((neighborhood) => ({
    label: neighborhood,
    value: neighborhood
  }))
})

const isFormValid = computed(() => {
  const cleanPhone = formData.value.phone?.replace(/\D/g, '') || ''
  return (
    formData.value.name &&
    cleanPhone.length >= 10 &&
    formData.value.email &&
    formData.value.street_address &&
    formData.value.zip_code?.length === 5 &&
    formData.value.suburb_colonia
  )
})

// Methods
function formatPhone(value) {
  const digits = value.replace(/\D/g, '')
  
  if (digits.length <= 2) {
    formData.value.phone = digits
  } else if (digits.length <= 6) {
    formData.value.phone = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  } else if (digits.length <= 10) {
    formData.value.phone = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)} ${digits.slice(6)}`
  } else {
    formData.value.phone = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)} ${digits.slice(6, 10)}`
  }
}

async function handleZipCodeInput(value) {
  formData.value.zip_code = value.replace(/\D/g, '').slice(0, 5)
  
  if (formData.value.suburb_colonia) {
    formData.value.suburb_colonia = null
  }
  
  zipCodeError.value = ''
}

async function handleZipCodeBlur() {
  const zipCode = formData.value.zip_code
  
  if (!zipCode || zipCode.length !== 5) {
    return
  }

  loadingNeighborhoods.value = true
  zipCodeError.value = ''
  
  try {
    clientStore.client.zip_code = zipCode
    await clientStore.getNeighborhoods(zipCode)
    
    if (clientStore.neighborhoods.length === 0) {
      zipCodeError.value = 'Código postal no encontrado. Por favor, verifica el código.'
    }
  } catch (error) {
    console.error('Error fetching neighborhoods:', error)
    zipCodeError.value = error.response?.data?.error || 'Error al cargar las colonias. Por favor, intenta de nuevo.'
    clientStore.neighborhoods = []
  } finally {
    loadingNeighborhoods.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  
  const isValid = await formRef.value.validate()
  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, completa todos los campos correctamente'
    })
    return
  }

  submitting.value = true
  errorMessage.value = ''
  showSuccess.value = false

  try {
    clientStore.client.name = formData.value.name
    clientStore.client.phone = formData.value.phone.replace(/\D/g, '')
    clientStore.client.email = formData.value.email
    clientStore.client.street_address = formData.value.street_address
    clientStore.client.zip_code = formData.value.zip_code
    clientStore.client.suburb_colonia = formData.value.suburb_colonia

    const user_id = clientStore.client?.id || null

    const nuxtApp = useNuxtApp()
    const axios = nuxtApp.$axios

    const cleanPhone = formData.value.phone.replace(/\D/g, '')
    
    const clientData = {
      name: formData.value.name,
      phone: cleanPhone.length === 10 ? `+52${cleanPhone}` : cleanPhone,
      email: formData.value.email,
      street_address: formData.value.street_address,
      zip_code: formData.value.zip_code,
      suburb_colonia: formData.value.suburb_colonia,
      flow_process: 'onCreditWeb',
      finva_user_id: 91,
      user_id: user_id || 90
    }
    
    if (user_id && user_id !== 90) {
      clientData.user_id = user_id
    }

    const response = await axios.post('/client/cliente', clientData)

    if (response.data) {
      showSuccess.value = true
      $q.notify({
        type: 'positive',
        message: '¡Tus datos han sido enviados correctamente!'
      })
      
      setTimeout(() => {
        router.push({
          path: '/login',
          query: {
            email: formData.value.email,
            phone: formData.value.phone
          }
        })
      }, 2000)
    }
  } catch (error) {
    console.error('Error creating client:', error)
    
    if (error.response?.data?.detail?.includes('already exists') || 
        error.response?.data?.error?.includes('already exists')) {
      errorMessage.value = 'Ya existe un cliente con este teléfono o correo electrónico.'
    } else {
      errorMessage.value = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Error al enviar los datos. Por favor, intenta de nuevo.'
    }
    
    $q.notify({
      type: 'negative',
      message: errorMessage.value
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formData.value = {
    name: '',
    phone: '',
    email: '',
    street_address: '',
    zip_code: '',
    suburb_colonia: null
  }
  clientStore.neighborhoods = []
  zipCodeError.value = ''
  formRef.value?.resetValidation()
}

// Pre-fill form if coming from login
onMounted(() => {
  if (route.query.email) {
    formData.value.email = route.query.email
  }
  if (route.query.phone) {
    formData.value.phone = route.query.phone
    if (formData.value.phone && !formData.value.phone.includes('(')) {
      formatPhone(formData.value.phone)
    }
  }
})
</script>

<style scoped>
/* Inter Font - Global */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.contact-form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem 1rem;
  padding-bottom: 4rem;
}

/* Form Header */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Form Card */
.form-card {
  max-width: 32rem;
  margin: 0 auto;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.loading-feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.error-feedback {
  color: #ef4444;
  font-size: 0.875rem;
}

.hint-feedback {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Form Actions */
.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.submit-button {
  height: 3rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
}

/* Responsive */
@media (max-width: 640px) {
  .contact-form-container {
    padding: 1rem 0.75rem;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .form-subtitle {
    font-size: 0.9375rem;
  }
}
</style>
