<template>
  <div
    class="motorcycle-card bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
    :class="{ 'expanded': isExpanded }"
    @click="navigateToDetail"
  >
    <!-- Motorcycle Image -->
    <div class="relative h-48 sm:h-56 md:h-64 overflow-hidden">
      <img
        :src="motorcycle.image"
        :alt="motorcycle.name"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    <!-- Card Content -->
    <div class="p-4 sm:p-5 md:p-6">
      <!-- Name (Always Visible) -->
      <div class="mb-3 sm:mb-4">
        <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-inter">
          {{ motorcycle.name }}
        </h3>
      </div>

      <!-- Expanded Details (Only when expanded) -->
      <div v-if="isExpanded" class="details-content">
        <!-- Price -->
        <div class="mb-3 sm:mb-4">
          <p class="text-xl sm:text-2xl md:text-3xl font-bold text-finva-primary font-inter">
            {{ motorcycle.price }}
          </p>
        </div>

        <!-- Colors -->
        <div class="mb-4 sm:mb-5">
          <p class="text-xs sm:text-sm text-gray-600 mb-2 font-inter font-medium">Colores disponibles:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(color, index) in motorcycle.colors"
              :key="index"
              class="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-full font-inter"
            >
              {{ color }}
            </span>
          </div>
        </div>

        <!-- Technical Information -->
        <div class="border-t border-gray-200 pt-3 sm:pt-4">
          <p class="text-xs sm:text-sm text-gray-600 mb-3 font-inter font-medium">Especificaciones técnicas:</p>
          <div class="grid grid-cols-2 gap-2 sm:gap-3">
            <div class="flex flex-col">
              <span class="text-xs text-gray-500 font-inter">Motor</span>
              <span class="text-sm sm:text-base font-semibold text-gray-900 font-inter">{{ motorcycle.technical.engine }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-500 font-inter">Potencia</span>
              <span class="text-sm sm:text-base font-semibold text-gray-900 font-inter">{{ motorcycle.technical.power }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-500 font-inter">Torque</span>
              <span class="text-sm sm:text-base font-semibold text-gray-900 font-inter">{{ motorcycle.technical.torque }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-500 font-inter">Peso</span>
              <span class="text-sm sm:text-base font-semibold text-gray-900 font-inter">{{ motorcycle.technical.weight }}</span>
            </div>
            <div class="flex flex-col col-span-2">
              <span class="text-xs text-gray-500 font-inter">Capacidad de combustible</span>
              <span class="text-sm sm:text-base font-semibold text-gray-900 font-inter">{{ motorcycle.technical.fuelCapacity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- View Details Button -->
      <div class="mt-4 sm:mt-5" :class="{ 'pt-3 sm:pt-4 border-t border-gray-200': isExpanded }">
        <ClientOnly>
          <q-btn
            rounded
            color="primary"
            size="md"
            class="full-width primary-btn"
            @click.stop="isExpanded ? toggleDetails() : navigateToDetail()"
          >
            {{ isExpanded ? 'Ocultar Detalles' : 'Ver Detalles Completos' }}
          </q-btn>
          <template #fallback>
            <button
              class="w-full px-4 py-2 bg-finva-primary text-white rounded-full font-medium hover:bg-finva-primary-dark transition-colors"
              @click.stop="isExpanded ? toggleDetails() : navigateToDetail()"
            >
              {{ isExpanded ? 'Ocultar Detalles' : 'Ver Detalles Completos' }}
            </button>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  motorcycle: {
    type: Object,
    required: true
  }
})

const isExpanded = ref(false)

const toggleDetails = () => {
  isExpanded.value = !isExpanded.value
}

const navigateToDetail = () => {
  // Navigate to the motorcycle detail page
  // Use ID if available, otherwise use a slug or name-based identifier
  const motorcycleId = props.motorcycle.id || props.motorcycle.name?.toLowerCase().replace(/\s+/g, '-')
  
  if (motorcycleId) {
    navigateTo(`/motorcycle/${motorcycleId}`)
  }
}
</script>

<style scoped>
.motorcycle-card {
  animation: fadeInUp 0.5s ease-out both;
}

.motorcycle-card:nth-child(1) { animation-delay: 0.1s; }
.motorcycle-card:nth-child(2) { animation-delay: 0.2s; }
.motorcycle-card:nth-child(3) { animation-delay: 0.3s; }
.motorcycle-card:nth-child(4) { animation-delay: 0.4s; }
.motorcycle-card:nth-child(5) { animation-delay: 0.5s; }
.motorcycle-card:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-content {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}

@media (hover: hover) and (pointer: fine) {
  .motorcycle-card:hover {
    transform: translateY(-8px);
  }
  
  .motorcycle-card.expanded:hover {
    transform: translateY(-4px);
  }
}
</style>
