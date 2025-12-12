<template>
  <div>
    <!-- ================= HERO SECTION ================= -->
    <div class="w-full overflow-hidden max-w-full">
      <ClientOnly>
        <template #default>
          <q-carousel
            v-model="slide"
            animated
            arrows
            infinite
            autoplay
            :autoplay-interval="5000"
            class="hero-carousel h-[100vh] sm:h-[420px] md:h-[520px] lg:h-[650px] relative w-full"
          >
            <q-carousel-slide
              v-for="(slideItem, i) in (slides || [])"
              :key="i"
              :name="i"
              class="relative h-full w-full grid"
              style="grid-template-areas: 'hero';"
            >
              <!-- Background Image -->
              <img
                :src="slideItem.image"
                :alt="slideItem.title"
                class="w-full h-full carousel-bg-image col-start-1 row-start-1"
                style="grid-area: hero;"
                loading="lazy"
              />

              <!-- Dark Overlay -->
              <div
                class="bg-black/50 col-start-1 row-start-1"
                style="grid-area: hero;"
              ></div>

              <!-- OVERLAY CONTENT USING GRID -->
              <div
                class="col-start-1 row-start-1 flex justify-start items-center 
                    pl-2 sm:pl-4 md:pl-6 lg:pl-8 pr-2 sm:pr-4 relative z-10"
                style="grid-area: hero; align-self: center; justify-self: start;"
              >
                <div
                  class="bg-black/60 sm:bg-black/40 backdrop-blur-md
                        p-3 sm:p-4 md:p-6 lg:p-8
                        rounded-lg sm:rounded-xl md:rounded-2xl
                        w-[92%] sm:w-auto max-w-md md:max-w-xl
                        fade-slide-content mobile-compact-content"
                >
                  <h1
                    class="text-white font-inter
                    text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl
                    font-bold leading-tight mb-2 sm:mb-3 md:mb-4"
                  >
                    {{ slideItem.title }}
                  </h1>

                  <div class="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <!-- Primary CTA -->
                    <NuxtLink to="/quote-generator">
                      <q-btn
                        rounded
                        size="lg"
                        color="primary"
                        class="primary-btn w-full sm:w-auto"
                      >
                        Cotizar Ahora
                      </q-btn>
                    </NuxtLink>

                    <!-- Secondary CTA -->
                    <q-btn
                      rounded
                      size="lg"
                      outline
                      color="primary"
                      class="secondary-btn w-full sm:w-auto"
                    >
                      Ver Motocicletas
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </template>

        <!-- Fallback -->
        <template #fallback>
          <div class="hero-carousel h-[100vh] relative w-full flex items-center justify-center bg-gray-200">
            <div class="text-center p-6 rounded-xl bg-black/40 text-white">
              <h1 class="text-2xl md:text-3xl font-bold">
                {{ slides[0]?.title || 'Cargando...' }}
              </h1>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- ================= MOTORCYCLE CARDS SECTION ================= -->
    <section class="p-3 sm:p-4 md:p-6 lg:p-10 max-w-full overflow-hidden">
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 text-gray-800 px-2 sm:px-0 font-inter">
        Modelos Populares
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        <MotorcycleCard
          v-for="motorcycle in (motorcycles || [])"
          :key="motorcycle.id"
          :motorcycle="motorcycle"
        />
      </div>
    </section>

    <!-- ================= BANK LOGOS SECTION ================= -->
    <section class="py-8 sm:py-12 md:py-16 bg-gray-50 border-t border-gray-200">
      <div class="px-3 sm:px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
        <h2 class="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 text-gray-800 text-center font-inter">
          Bancos Aliados
        </h2>
        <p class="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8 font-inter max-w-2xl mx-auto">
          Solicita tu crédito con nuestros bancos aliados
        </p>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 items-center justify-items-center">
          <div
            v-for="bank in (banks || [])"
            :key="bank.id"
            class="bank-logo-container flex items-center justify-center p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full h-24 sm:h-28 md:h-32"
          >
            <img
              :src="bank.image"
              :alt="bank.name"
              class="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              loading="lazy"
              @error="handleImageError"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
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

const slide = ref(0)

// Initialize reactive data
const slides = ref([])
const motorcycles = ref([])
const banks = ref([])
const loading = ref(true)
const error = ref(null)

// Get runtime config for API base URL
const config = useRuntimeConfig()
const apiBase = config.public.FLASK_BACKEND_URL || 'http://localhost:5000'

// Fetch CMS content with dynamic data from database
const { data: cmsData, error: cmsError } = await useFetch(`${apiBase}/cms/marketplace/content`, {
  params: {
    brand_name: 'Yamaha',
    motorcycle_limit: 6
  }
})

if (cmsError.value) {
  error.value = cmsError.value
  console.error('Error fetching CMS content:', cmsError.value)
  // Fallback to empty arrays
  slides.value = []
  motorcycles.value = []
  banks.value = []
} else if (cmsData.value) {
  // Populate data from CMS
  slides.value = cmsData.value.content.slides || []
  motorcycles.value = cmsData.value.content.motorcycles || []
  banks.value = cmsData.value.content.banks || []
}

loading.value = false

// Handle image loading errors
const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
/* Inter Font - Global */
:deep(*) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 100%;
  box-sizing: border-box;
}

/* Fade + slide animation */
.fade-slide-content {
  animation: fadeSlideIn 0.5s ease-out both;
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Inter Font */
.font-inter {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Hide arrows on mobile */
@media (max-width: 640px) {
  .hero-carousel :deep(.q-carousel__arrow) {
    display: none;
  }
}

/* Mobile full-height hero */
.hero-carousel {
  height: 100vh !important;
}

/* Carousel background image styling */
.carousel-bg-image {
  object-fit: cover;
  object-position: center center;
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease-out;
}

/* Mobile image zoom and crop */
@media (max-width: 640px) {
  .hero-carousel {
    max-width: 100vw;
    overflow: hidden;
    height: 100vh !important;
  }
  
  .carousel-bg-image {
    object-fit: cover;
    width: 100%;
    height: 100%;
    transform: scale(1.25);
    transform-origin: top center;
  }
  
  .mobile-compact-content {
    padding: 0.75rem !important;
    background-color: rgba(0, 0, 0, 0.7) !important;
    backdrop-filter: blur(4px);
  }
  
  .mobile-compact-content h1 {
    font-size: 1rem !important;
    line-height: 1.2 !important;
    margin-bottom: 0.5rem !important;
  }
  
  img {
    max-width: 100%;
    height: auto;
    object-fit: cover;
  }
}

/* Desktop image styling */
@media (min-width: 641px) {
  .carousel-bg-image {
    transform: scale(1);
    object-position: center center;
  }
}

/* Ensure no horizontal scroll */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Bank Logos Section */
.bank-logo-container {
  transition: all 0.3s ease;
}

.bank-logo-container:hover {
  transform: translateY(-4px);
  border: 1px solid rgba(47, 255, 150, 0.3);
}

.bank-logo-container img {
  transition: all 0.3s ease;
}

@media (hover: hover) and (pointer: fine) {
  .bank-logo-container:hover img {
    transform: scale(1.1);
  }
}
</style>

