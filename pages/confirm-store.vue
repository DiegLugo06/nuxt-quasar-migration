<template>
  <ClientOnly>
    <ProcessStepper v-if="showStepper" />
    <div class="confirm-store-container">
      <div class="main-card">
        <div class="step-content">
          <div class="info-card">
            <div class="info-header">
              <div class="brand-icon-box">
                <q-icon name="store" size="24px" />
              </div>
              <h3 class="info-title">Escoge tu sucursal</h3>
            </div>

            <!-- State Selector -->
            <div v-if="!loadingStores" class="state-selector-wrapper">
              <div class="form-group">
                <label class="form-label">
                  Estado de interés
                </label>
                <q-select
                  v-model="selectedStateObject"
                  :options="mexicanStates"
                  option-label="name"
                  option-value="code"
                  outlined
                  size="md"
                  class="state-select enhanced-input"
                  @update:model-value="onStateChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_city" size="20px" class="input-icon" />
                  </template>
                </q-select>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loadingStores" class="loading-container">
            <div class="loading-spinner-wrapper">
              <q-spinner-puff size="3.5rem" color="primary" />
              <div class="spinner-ripple"></div>
            </div>
            <p class="loading-text">Cargando sucursales...</p>
            <p class="loading-subtext">Esto puede tomar unos segundos</p>
          </div>

          <!-- No Stores Message -->
          <div v-else-if="places.length === 0" class="empty-state">
            <div class="empty-icon-wrapper">
              <q-icon name="store" size="64px" class="empty-icon" />
            </div>
            <h3 class="empty-title">No hay sucursales disponibles</h3>
            <p class="empty-text">
              No encontramos sucursales cercanas en {{ selectedStateObject?.name }}.
            </p>
            <p class="empty-hint">
              Por favor, intenta seleccionar otro estado para encontrar sucursales disponibles.
            </p>
          </div>

          <!-- Store List -->
          <div v-else class="stores-container">
            <div class="stores-grid">
              <q-card
                v-for="place in places"
                :key="place.id"
                class="store-card"
                :class="{ 'store-card-selected': storeSelected === place.name }"
                @click="selectStore(place)"
                flat
              >
                <div v-if="storeSelected === place.name" class="selected-badge">
                  <q-icon name="check" size="18px" />
                </div>
                <q-card-section class="store-card-content">
                  <div class="store-header">
                    <q-icon name="store" size="24px" class="store-icon" />
                    <h3 class="store-name">{{ place.name }}</h3>
                  </div>
                  <div class="store-info">
                    <div class="store-info-item">
                      <q-icon name="place" size="16px" class="info-icon" />
                      <p class="store-address">{{ place.address }}</p>
                    </div>
                    <div class="store-info-item">
                      <q-icon name="straighten" size="16px" class="info-icon" />
                      <p class="store-distance">{{ place.distance?.toFixed(1) || 'N/A' }} km</p>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div v-if="!loadingStores && places.length > 0" class="navigation-buttons">
            <q-btn outline class="nav-button back-btn" @click="goBack">
              <q-icon name="arrow_back" class="q-mr-sm" /> Regresar
            </q-btn>
            <q-btn unelevated class="nav-button continue-btn" @click="continueNextStep" :disable="!storeSelected">
              Continuar <q-icon name="arrow_forward" class="q-ml-sm" />
            </q-btn>
          </div>

          <!-- Back Button Only (when no stores) -->
          <div v-if="!loadingStores && places.length === 0" class="navigation-buttons">
            <q-btn outline class="nav-button back-btn" @click="goBack">
              <q-icon name="arrow_back" class="q-mr-sm" /> Regresar
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSolicitudStore } from '@/stores/solicitudStore'
import { useFlowProcessStore } from '@/stores/flowProcessStore'
import { useUserStore } from '@/stores/userStore'
import { useClientStore } from '@/stores/clientStore'
import { useMotorcycleStore } from '@/stores/motorcycleStore'
import { useQuasar } from 'quasar'
import ProcessStepper from '@/components/ProcessStepper.vue'
import { useNuxtApp } from '#app'

const router = useRouter()
const $q = useQuasar()
const solicitudStore = useSolicitudStore()
const flowProcessStore = useFlowProcessStore()
const userStore = useUserStore()
const clientStore = useClientStore()
const motorcycleStore = useMotorcycleStore()

// Computed property to check if stepper should be shown
const showStepper = computed(() => {
  const shouldShow = flowProcessStore.flowProcess === 'onCreditWeb'
  console.log('[confirm-store] FlowProcess:', flowProcessStore.flowProcess)
  console.log('[confirm-store] Should show stepper:', shouldShow)
  console.log('[confirm-store] Routes:', flowProcessStore.routes)
  return shouldShow
})

// Initialize piniaStores object (matching original pattern)
const piniaStores = {
  user: useUserStore(),
  solicitud: useSolicitudStore(),
  flow: useFlowProcessStore(),
  client: useClientStore(),
  motorcycle: useMotorcycleStore(),
}

// State
const loadingStores = ref(true)
const storeSelected = ref<string | null>(null)
const storeIdSelected = ref<number | null>(null)
const places = ref<any[]>([])
const selectedStateObject = ref<any>(null)

// Mexican states with approximate center coordinates
const mexicanStates = [
  { name: "Ciudad de México", code: "CDMX", lat: 19.432608, lng: -99.133209 },
  { name: "Aguascalientes", code: "AGS", lat: 21.8853, lng: -102.2916 },
  { name: "Baja California", code: "BC", lat: 30.8406, lng: -115.2838 },
  { name: "Baja California Sur", code: "BCS", lat: 26.0444, lng: -111.6661 },
  { name: "Campeche", code: "CAM", lat: 19.8301, lng: -90.5349 },
  { name: "Chiapas", code: "CHIS", lat: 16.7569, lng: -93.1292 },
  { name: "Chihuahua", code: "CHIH", lat: 28.6353, lng: -106.0889 },
  { name: "Coahuila", code: "COAH", lat: 27.0587, lng: -101.7068 },
  { name: "Colima", code: "COL", lat: 19.2452, lng: -103.7241 },
  { name: "Durango", code: "DGO", lat: 24.5593, lng: -104.6591 },
  { name: "Estado de México", code: "MEX", lat: 19.2969, lng: -99.6559 },
  { name: "Guanajuato", code: "GTO", lat: 21.019, lng: -101.2574 },
  { name: "Guerrero", code: "GRO", lat: 17.4392, lng: -99.5451 },
  { name: "Hidalgo", code: "HGO", lat: 20.091, lng: -98.7624 },
  { name: "Jalisco", code: "JAL", lat: 20.6595, lng: -103.3494 },
  { name: "Michoacán", code: "MICH", lat: 19.5665, lng: -101.7068 },
  { name: "Morelos", code: "MOR", lat: 18.6813, lng: -99.1013 },
  { name: "Nayarit", code: "NAY", lat: 21.7514, lng: -104.8455 },
  { name: "Nuevo León", code: "NL", lat: 25.5922, lng: -99.9962 },
  { name: "Oaxaca", code: "OAX", lat: 17.0732, lng: -96.7266 },
  { name: "Puebla", code: "PUE", lat: 19.0414, lng: -98.2063 },
  { name: "Querétaro", code: "QRO", lat: 20.5888, lng: -100.3899 },
  { name: "Quintana Roo", code: "QROO", lat: 19.1817, lng: -88.4791 },
  { name: "San Luis Potosí", code: "SLP", lat: 22.1565, lng: -100.9855 },
  { name: "Sinaloa", code: "SIN", lat: 25.0002, lng: -107.557 },
  { name: "Sonora", code: "SON", lat: 29.2972, lng: -110.3309 },
  { name: "Tabasco", code: "TAB", lat: 17.8409, lng: -92.6189 },
  { name: "Tamaulipas", code: "TAM", lat: 24.2669, lng: -98.8363 },
  { name: "Tlaxcala", code: "TLAX", lat: 19.3139, lng: -98.2404 },
  { name: "Veracruz", code: "VER", lat: 19.1738, lng: -96.1342 },
  { name: "Yucatán", code: "YUC", lat: 20.7099, lng: -89.0943 },
  { name: "Zacatecas", code: "ZAC", lat: 22.7709, lng: -102.5832 },
]

// Calculate distance between two coordinates
function getDistanceKm(loc1: any, loc2: any): number {
  const R = 6371 // Earth radius in km
  const lat1 = loc1.lat
  const lng1 = loc1.lng
  const lat2 = typeof loc2.lat === "function" ? loc2.lat() : loc2.lat
  const lng2 = typeof loc2.lng === "function" ? loc2.lng() : loc2.lng

  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Fetch stores from backend
async function fetchStores(brand?: string) {
  loadingStores.value = true
  try {
    const nuxtApp = useNuxtApp()
    const axios = (nuxtApp as any).$axios
    const params: any = {}
    if (brand) {
      params.brand = brand
    }
    
    // Use the endpoint from the reference implementation
    const response = await axios.get('/advisor/get_stores', { params })
    return response.data.stores_data || []
  } catch (error: any) {
    console.error('Error fetching stores:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las sucursales. Por favor intenta de nuevo.',
      position: 'top'
    })
    return []
  } finally {
    loadingStores.value = false
  }
}

// Filter stores by state and calculate distances
async function filterStoresByState(state: any) {
  if (!state) return
  
  const allStores = await fetchStores(solicitudStore.solicitud.brand_motorcycle)
  const stateLocation = { lat: state.lat, lng: state.lng }
  const RADIUS_KM = 250

  const storeDistances = allStores
    .filter((store: any) => store.coordinates?.lat && store.coordinates?.lng)
    .map((store: any) => {
      const distance = getDistanceKm(stateLocation, {
        lat: store.coordinates.lat,
        lng: store.coordinates.lng
      })
      return {
        id: store.id,
        name: store.nombre,
        address: store.ubicacion,
        lat: store.coordinates.lat,
        lng: store.coordinates.lng,
        distance
      }
    })
    .filter((store: any) => store.distance <= RADIUS_KM)
    .sort((a: any, b: any) => a.distance - b.distance)
    .slice(0, 8)

  places.value = storeDistances
}

// Handle state change
async function onStateChange(newState: any) {
  if (!newState) return
  storeSelected.value = null
  storeIdSelected.value = null
  await filterStoresByState(newState)
}

// Select store
function selectStore(place: any) {
  storeSelected.value = place.name
  storeIdSelected.value = place.id
}

// Continue to next step
const continueNextStep = async () => {
  if (!storeIdSelected.value) return

  // Focus on onCreditWeb process
  if (piniaStores.flow.flowProcess == "onCreditWeb" || piniaStores.flow.flowProcess == "sferaProcess") {
    piniaStores.solicitud.solicitud.preferred_store_id = storeIdSelected.value;
    piniaStores.solicitud.solicitud.finva_user_id =
      piniaStores.user.finvaAgent.id;
    piniaStores.solicitud.solicitud.registration_mode =
      piniaStores.user.registration_mode;

    if (piniaStores.user.registration_mode == "finvaAgent") {
      try {
        const nextUser = await piniaStores.user.getNextUserAssigned(
          storeIdSelected.value,
          piniaStores.client.client.email,
          piniaStores.client.client.phone
        );
        piniaStores.user.user.id = nextUser;
      } catch (error) {
        console.error('Error getting next user assigned:', error);
        piniaStores.user.user.id = 6;
      }
    } else if (!piniaStores.user.user.id || piniaStores.user.user.id == 6) {
      try {
        const nextUser = await piniaStores.user.getNextUserAssigned(
          storeIdSelected.value,
          piniaStores.client.client.email,
          piniaStores.client.client.phone
        );
        piniaStores.user.user.id = nextUser;
      } catch (error) {
        console.error('Error getting next user assigned:', error);
        piniaStores.user.user.id = 6;
      }
    }

    piniaStores.solicitud.solicitud.user_id = piniaStores.user.user.id;
    router.push('/client-validation');
  } else {
    // Fallback for other flow types
    solicitudStore.setPreferredStore(storeIdSelected.value);
    router.push('/client-validation');
  }
};

// Go back
function goBack() {
  router.push('/quote-generator')
}

// Initialize
onMounted(async () => {
  // Set default state (CDMX)
  selectedStateObject.value = mexicanStates[0]
  await filterStoresByState(selectedStateObject.value)
})
</script>

<style scoped>
/* Inter Font - Global */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

.confirm-store-container {
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
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* State Selector */
.state-selector-wrapper {
  margin-bottom: 1.5rem;
}

.form-group {
  width: 100%;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #242424;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.state-select {
  width: 100%;
}

:deep(.enhanced-input .q-field__control) {
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: #fcfcfc;
  transition: all 0.2s ease;
}

:deep(.enhanced-input .q-field--focused .q-field__control) {
  background: #ffffff;
  border-color: #242424;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.enhanced-input .q-field__native),
:deep(.enhanced-input .q-field__input) {
  font-weight: 600;
  color: #242424;
}

.input-icon {
  color: #242424;
  opacity: 0.6;
  transition: all 0.3s ease;
}

:deep(.enhanced-input .q-field--focused .input-icon) {
  color: #242424;
  opacity: 1;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1.5rem;
}

.loading-spinner-wrapper {
  position: relative;
  display: inline-block;
}

.spinner-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 3px solid rgba(47, 255, 150, 0.2);
  animation: ripple 1.5s ease-out infinite;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.loading-text {
  color: #475569;
  font-size: 1rem;
  font-weight: 600;
}

.loading-subtext {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: -0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1.5rem;
  text-align: center;
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.1) 0%, rgba(38, 224, 133, 0.1) 100%);
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.empty-icon {
  color: #cbd5e1;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.empty-text {
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
  margin: 0;
}

.empty-hint {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

/* Stores Container */
.stores-container {
  margin-bottom: 2rem;
}

.stores-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .stores-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .stores-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

/* Store Card */
.store-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1.5px solid rgba(36, 36, 36, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  background: white;
}

.store-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  background: linear-gradient(90deg, #2FFF96 0%, #26e085 100%);
  transition: height 0.3s ease;
  z-index: 0;
}

.store-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  border-color: rgba(47, 255, 150, 0.4);
}

.store-card:hover::before {
  height: 3px;
}

.store-card-selected {
  border-color: #2FFF96;
  background: linear-gradient(135deg, rgba(47, 255, 150, 0.06) 0%, rgba(38, 224, 133, 0.1) 100%);
  box-shadow: 
    0 12px 28px rgba(38, 224, 133, 0.2),
    0 0 0 3px rgba(38, 224, 133, 0.08);
}

.store-card-selected::before {
  height: 3px;
}

.selected-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #2FFF96 0%, #26e085 100%);
  color: white;
  border-radius: 50%;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 
    0 4px 16px rgba(38, 224, 133, 0.4),
    0 0 0 3px rgba(255, 255, 255, 0.8);
  animation: badgePop 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid white;
}

@keyframes badgePop {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.15) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.store-card-content {
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.store-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1.25rem;
}

.store-icon {
  color: #2FFF96;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(47, 255, 150, 0.2));
  transition: all 0.3s ease;
}

.store-card:hover .store-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(47, 255, 150, 0.3));
}

.store-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #242424;
  margin: 0;
  flex: 1;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.store-info {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.store-info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.5rem;
  background: rgba(36, 36, 36, 0.02);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.store-card:hover .store-info-item {
  background: rgba(47, 255, 150, 0.04);
}

.info-icon {
  color: rgba(36, 36, 36, 0.6);
  margin-top: 0.125rem;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.store-card:hover .info-icon {
  color: #2FFF96;
}

.store-address {
  font-size: 0.875rem;
  color: #242424;
  margin: 0;
  line-height: 1.6;
  flex: 1;
  font-weight: 500;
  opacity: 0.8;
}

.store-distance {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2FFF96;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0 1.5rem;
}

.nav-button {
  flex: 1;
  height: 52px;
  border-radius: 14px;
  font-weight: 800;
  text-transform: none;
  transition: all 0.3s ease;
}

.continue-btn {
  background: #2FFF96 !important;
  color: #242424 !important;
  box-shadow: 0 8px 15px rgba(47, 255, 150, 0.2) !important;
}

.continue-btn:hover:not(:disabled) {
  box-shadow: 0 10px 20px rgba(47, 255, 150, 0.3) !important;
  transform: translateY(-2px);
}

.back-btn {
  border: 2px solid #242424 !important;
  color: #242424 !important;
  background: white !important;
}

.back-btn:hover {
  background: #f8fafc !important;
  border-color: #242424 !important;
}

/* Responsive */
@media (min-width: 768px) {
  .confirm-store-container {
    padding: 2.5rem;
    padding-top: calc(2.5rem + 120px);
    max-width: 50rem;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .confirm-store-container {
    max-width: 68rem;
    padding-top: calc(2.5rem + 120px);
  }

  .main-card {
    border-radius: 2.5rem;
  }
}
</style>

