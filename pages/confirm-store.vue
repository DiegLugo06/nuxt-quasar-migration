<template>
  <ClientOnly>
    <div class="confirm-store-container">
      <div class="store-selection-header">
        <h1 class="page-title">Escoge tu sucursal</h1>
        <p class="page-subtitle">Selecciona la sucursal más cercana para continuar con tu proceso</p>
      </div>

      <!-- State Selector -->
      <div v-if="!loadingStores" class="state-selector">
        <label class="state-label">Estado de interés:</label>
        <q-select
          v-model="selectedStateObject"
          :options="mexicanStates"
          option-label="name"
          option-value="code"
          outlined
          dense
          class="state-select"
          @update:model-value="onStateChange"
        >
          <template v-slot:prepend>
            <q-icon name="location_city" />
          </template>
        </q-select>
      </div>

      <!-- Loading State -->
      <div v-if="loadingStores" class="loading-container">
        <q-spinner size="3rem" color="primary" />
        <p class="loading-text">Cargando sucursales...</p>
      </div>

      <!-- No Stores Message -->
      <div v-else-if="places.length === 0" class="no-stores-message">
        <q-card flat bordered class="no-stores-card">
          <q-card-section class="text-center">
            <q-icon name="store" size="3rem" color="orange" class="mb-3" />
            <h3 class="no-stores-title">No hay sucursales disponibles</h3>
            <p class="no-stores-text">
              No encontramos sucursales cercanas en {{ selectedStateObject?.name }}.
            </p>
            <p class="no-stores-hint">
              Por favor, intenta seleccionar otro estado para encontrar sucursales disponibles.
            </p>
          </q-card-section>
        </q-card>
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
          >
            <div v-if="storeSelected === place.name" class="selected-badge">
              <q-icon name="done" size="1rem" />
            </div>
            <q-card-section>
              <h3 class="store-name">{{ place.name }}</h3>
              <p class="store-address">{{ place.address }}</p>
              <p class="store-distance">Distancia: {{ place.distance?.toFixed(1) || 'N/A' }} km</p>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div v-if="!loadingStores && places.length > 0" class="navigation-buttons">
        <q-btn
          label="Regresar"
          color="primary"
          outline
          icon="arrow_back"
          @click="goBack"
          class="nav-button"
        />
        <q-btn
          label="Continuar"
          color="primary"
          icon="arrow_forward"
          @click="continueNextStep"
          :disable="!storeSelected"
          class="nav-button"
        />
      </div>

      <!-- Back Button Only (when no stores) -->
      <div v-if="!loadingStores && places.length === 0" class="back-button-only">
        <q-btn
          label="Regresar"
          color="primary"
          outline
          icon="arrow_back"
          @click="goBack"
          class="nav-button"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSolicitudStore } from '@/stores/solicitudStore'
import { useFlowProcessStore } from '@/stores/flowProcessStore'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const solicitudStore = useSolicitudStore()
const flowStore = useFlowProcessStore()

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
    const axios = nuxtApp.$axios
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
function continueNextStep() {
  if (!storeIdSelected.value) return
  
  solicitudStore.setPreferredStore(storeIdSelected.value)
  router.push('/client-validation')
}

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
.confirm-store-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.store-selection-header {
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

.state-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.state-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.state-select {
  min-width: 250px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 1rem;
}

.no-stores-message {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.no-stores-card {
  max-width: 500px;
  background: #fff3cd;
  border: 2px solid #ffc107;
}

.no-stores-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #856404;
  margin: 0 0 1rem 0;
}

.no-stores-text {
  color: #856404;
  margin-bottom: 0.5rem;
}

.no-stores-hint {
  color: #856404;
  font-size: 0.875rem;
}

.stores-container {
  margin-bottom: 2rem;
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.store-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.store-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.store-card-selected {
  border: 3px solid #2FFF96;
  background: rgba(47, 255, 150, 0.05);
}

.selected-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #2FFF96;
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.store-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.store-address {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.store-distance {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2FFF96;
  margin: 0;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.back-button-only {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.nav-button {
  min-width: 150px;
  height: 3rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .confirm-store-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stores-grid {
    grid-template-columns: 1fr;
  }

  .state-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .state-select {
    width: 100%;
  }
}
</style>

