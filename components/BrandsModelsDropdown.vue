<template>
  <ClientOnly>
    <div 
      class="brands-dropdown absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl z-50 min-w-[280px] max-h-[600px] overflow-hidden"
      @click.stop
    >
      <div class="flex h-full">
        <!-- Brands List -->
        <div 
          v-if="!selectedBrand"
          class="w-full max-h-[600px] overflow-y-auto"
        >
          <div class="p-2">
            <h3 class="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200 mb-2">
              Selecciona una marca
            </h3>
            <template v-if="safeBrands && safeBrands.length > 0">
              <q-btn
                v-for="brand in safeBrands"
                :key="brand.id"
                flat
                dense
                no-caps
                @click="selectBrand(brand)"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-between group"
              >
                <span class="font-medium text-gray-900 group-hover:text-finva-primary">{{ brand.name }}</span>
                <q-icon name="chevron_right" size="16px" class="text-gray-400 group-hover:text-finva-primary" />
              </q-btn>
            </template>
          </div>
        </div>

        <!-- Models List -->
        <div 
          v-else-if="selectedBrand"
          class="w-full max-h-[600px] overflow-y-auto"
        >
          <div class="p-2">
            <q-btn
              flat
              dense
              no-caps
              @click="goBack"
              class="w-full text-left px-3 py-2 mb-2 text-sm text-gray-600 hover:text-finva-primary flex items-center gap-2 transition-colors"
            >
              <q-icon name="arrow_back" size="16px" />
              <span>Volver a marcas</span>
            </q-btn>
            <h3 class="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200 mb-2">
              {{ selectedBrand?.name || 'Marca' }} - Modelos
            </h3>
            <template v-if="safeModels && safeModels.length > 0">
              <NuxtLink
                v-for="model in safeModels"
                :key="model.id"
                :to="model.link"
                @click="handleModelClick"
                class="block w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
              >
                <span class="font-medium text-gray-900 group-hover:text-finva-primary">{{ model.name }}</span>
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </div>
    <template #fallback>
      <div></div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close'])

const selectedBrand = ref(null)

// SSR-safe: Define brands array (empty during SSR, full array on client)
const brands = import.meta.server ? [] : [
  {
    id: 1,
    name: 'Yamaha',
    models: [
      { id: 1, name: 'MT-07', link: '/motos/yamaha/mt-07' },
      { id: 2, name: 'MT-09', link: '/motos/yamaha/mt-09' },
      { id: 3, name: 'R1', link: '/motos/yamaha/r1' },
      { id: 4, name: 'R6', link: '/motos/yamaha/r6' },
      { id: 5, name: 'FZ-25', link: '/motos/yamaha/fz-25' },
      { id: 6, name: 'XTZ 250', link: '/motos/yamaha/xtz-250' }
    ]
  },
  {
    id: 2,
    name: 'Honda',
    models: [
      { id: 1, name: 'CBR 650R', link: '/motos/honda/cbr-650r' },
      { id: 2, name: 'CBR 1000RR', link: '/motos/honda/cbr-1000rr' },
      { id: 3, name: 'CB 650F', link: '/motos/honda/cb-650f' },
      { id: 4, name: 'CRF 250L', link: '/motos/honda/crf-250l' },
      { id: 5, name: 'Africa Twin', link: '/motos/honda/africa-twin' },
      { id: 6, name: 'Gold Wing', link: '/motos/honda/gold-wing' }
    ]
  },
  {
    id: 3,
    name: 'Kawasaki',
    models: [
      { id: 1, name: 'Ninja 650', link: '/motos/kawasaki/ninja-650' },
      { id: 2, name: 'Ninja ZX-10R', link: '/motos/kawasaki/ninja-zx-10r' },
      { id: 3, name: 'Z900', link: '/motos/kawasaki/z900' },
      { id: 4, name: 'Versys 650', link: '/motos/kawasaki/versys-650' },
      { id: 5, name: 'KLR 650', link: '/motos/kawasaki/klr-650' }
    ]
  },
  {
    id: 4,
    name: 'Ducati',
    models: [
      { id: 1, name: 'Monster 821', link: '/motos/ducati/monster-821' },
      { id: 2, name: 'Panigale V4', link: '/motos/ducati/panigale-v4' },
      { id: 3, name: 'Multistrada', link: '/motos/ducati/multistrada' },
      { id: 4, name: 'Scrambler', link: '/motos/ducati/scrambler' }
    ]
  },
  {
    id: 5,
    name: 'Suzuki',
    models: [
      { id: 1, name: 'GSX-S750', link: '/motos/suzuki/gsx-s750' },
      { id: 2, name: 'GSX-R1000', link: '/motos/suzuki/gsx-r1000' },
      { id: 3, name: 'V-Strom 650', link: '/motos/suzuki/v-strom-650' },
      { id: 4, name: 'DR-Z400', link: '/motos/suzuki/dr-z400' }
    ]
  },
  {
    id: 6,
    name: 'Triumph',
    models: [
      { id: 1, name: 'Street Triple 765', link: '/motos/triumph/street-triple-765' },
      { id: 2, name: 'Tiger 900', link: '/motos/triumph/tiger-900' },
      { id: 3, name: 'Bonneville', link: '/motos/triumph/bonneville' },
      { id: 4, name: 'Rocket 3', link: '/motos/triumph/rocket-3' }
    ]
  }
]

// SSR-safe computed properties
const safeBrands = computed(() => {
  if (!brands || !Array.isArray(brands)) {
    return []
  }
  return brands
})

const safeModels = computed(() => {
  if (!selectedBrand.value || !selectedBrand.value.models) {
    return []
  }
  if (!Array.isArray(selectedBrand.value.models)) {
    return []
  }
  return selectedBrand.value.models
})

const selectBrand = (brand) => {
  if (import.meta.client) {
    selectedBrand.value = brand
  }
}

const goBack = () => {
  if (import.meta.client) {
    selectedBrand.value = null
  }
}

const handleModelClick = () => {
  emit('close')
}
</script>

<style scoped>
.brands-dropdown {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.brands-dropdown::-webkit-scrollbar {
  width: 6px;
}

.brands-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.brands-dropdown::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.brands-dropdown::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
