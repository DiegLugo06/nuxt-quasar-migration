<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">Iniciar Sesión</h1>
      <p class="login-subtitle">Ingresa tus datos para acceder a tu cuenta</p>
    </div>

    <q-card class="login-card">
      <q-card-section>
        <q-form
          ref="formRef"
          @submit="handleLogin"
        >
          <div class="q-gutter-md">
            <!-- Email -->
            <q-input
              v-model="formData.email"
              label="Correo electrónico"
              type="email"
              outlined
              :rules="[
                val => !!val || 'Ingresa un correo electrónico válido',
                val => /.+@.+\..+/.test(val) || 'Ingresa un correo electrónico válido'
              ]"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Phone -->
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
              @input="formatPhone"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <q-btn
              type="submit"
              color="primary"
              size="lg"
              :loading="loading"
              :disable="!isFormValid"
              class="full-width submit-button"
            >
              <q-icon name="login" class="q-mr-sm" />
              Iniciar Sesión
            </q-btn>
          </div>

          <!-- Register Link -->
          <div class="register-link">
            <p class="register-text">
              ¿No tienes una cuenta?
              <NuxtLink to="/contact-form" class="register-link-text">
                Regístrate aquí
              </NuxtLink>
            </p>
          </div>
        </q-form>

        <!-- Error Message -->
        <q-banner
          v-if="errorMessage"
          class="bg-negative text-white q-mt-md"
          rounded
        >
          {{ errorMessage }}
          <template v-slot:action>
            <q-btn flat dense icon="close" @click="errorMessage = ''" />
          </template>
        </q-banner>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/clientStore'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

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
const router = useRouter()
const route = useRoute()
const formRef = ref(null)

// Form data
const formData = ref({
  email: '',
  phone: ''
})

// State
const loading = ref(false)
const errorMessage = ref('')

// Computed
const isFormValid = computed(() => {
  const cleanPhone = formData.value.phone?.replace(/\D/g, '') || ''
  return (
    formData.value.email &&
    /.+@.+\..+/.test(formData.value.email) &&
    cleanPhone.length >= 10
  )
})

// Methods
function formatPhone(value: string) {
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

async function handleLogin() {
  if (!formRef.value) return
  
  const isValid = await formRef.value.validate()
  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, completa todos los campos correctamente'
    })
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const cleanPhone = formData.value.phone.replace(/\D/g, '')
    clientStore.client.email = formData.value.email
    clientStore.client.phone = cleanPhone.length === 10 ? `+52${cleanPhone}` : cleanPhone

    const validation = await clientStore.validatePhoneAndEmail()
    
    if (validation.status === 'validated') {
      const clientData = await clientStore.getClient()
      
      if (clientData.client_id) {
        $q.notify({
          type: 'positive',
          message: '¡Bienvenido de nuevo!'
        })
        router.push('/my-documents')
      } else {
        throw new Error('No se pudo obtener la información del cliente')
      }
    } else {
      errorMessage.value = validation.type === 'email'
        ? 'El correo electrónico no coincide con nuestros registros'
        : validation.type === 'phone'
        ? 'El teléfono no coincide con nuestros registros'
        : 'Las credenciales no son válidas'
      $q.notify({
        type: 'negative',
        message: errorMessage.value
      })
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.response?.status === 404) {
      $q.notify({
        type: 'info',
        message: 'No encontramos tu cuenta. Te redirigiremos al registro.'
      })
      setTimeout(() => {
        router.push({
          path: '/contact-form',
          query: {
            email: formData.value.email,
            phone: formData.value.phone
          }
        })
      }, 1500)
    } else {
      errorMessage.value = error.response?.data?.error || 'Error al iniciar sesión. Por favor, intenta de nuevo.'
      $q.notify({
        type: 'negative',
        message: errorMessage.value
      })
    }
  } finally {
    loading.value = false
  }
}

// Pre-fill form if coming from contact-form
onMounted(() => {
  if (route.query.email) {
    formData.value.email = route.query.email as string
  }
  if (route.query.phone) {
    formData.value.phone = route.query.phone as string
  }
})
</script>

<style scoped>
/* Inter Font - Global */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem 1rem;
  padding-bottom: 4rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.login-card {
  max-width: 28rem;
  margin: 0 auto;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

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

.register-link {
  margin-top: 1.5rem;
  text-align: center;
}

.register-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.register-link-text {
  color: #26e085;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.register-link-text:hover {
  color: #2FFF96;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-container {
    padding: 1rem 0.75rem;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .login-subtitle {
    font-size: 0.9375rem;
  }
}
</style>
