import { Quasar } from 'quasar'
import quasarLang from 'quasar/lang/es'
import quasarIconSet from 'quasar/icon-set/material-icons'
import { Notify, Dialog, Loading, Screen } from 'quasar'
import { nextTick } from 'vue'

// Import Quasar CSS to ensure styles are loaded
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

// Import all components we use
import {
  QBtn,
  QIcon,
  QInput,
  QCard,
  QCardSection,
  QCardActions,
  QSelect,
  QSpinner,
  QDialog,
  QForm,
  QUploader,
  QFile,
  QLinearProgress,
  QBadge,
  QBanner,
  QCarousel,
  QCarouselSlide,
  QCarouselControl,
  QToggle,
  QTooltip,
  QPopupProxy,
  QSeparator,
  QSpace,
  QRadio,
  QCheckbox
} from 'quasar'

// defineNuxtPlugin is auto-imported by Nuxt 3
// @ts-ignore - Auto-imported by Nuxt, available at runtime
export default defineNuxtPlugin({
  name: 'quasar-client',
  enforce: 'pre', // Run before other plugins to ensure Quasar is available early
  async setup(nuxtApp) {
    console.log('[Quasar Plugin] Plugin setup started');
    console.log('[Quasar Plugin] Vue app:', nuxtApp.vueApp);
    
    // Register Quasar globally - this must be synchronous
    console.log('[Quasar Plugin] Registering Quasar...');
    const quasarInstance = nuxtApp.vueApp.use(Quasar, {
      lang: quasarLang,
      iconSet: quasarIconSet, // Configure Material Icons as the icon set
      plugins: {
        Notify,
        Dialog,
        Loading,
        Screen
      },
      config: {
        brand: {
          primary: '#26e085', // Finva green
          secondary: '#9ca3af',
          accent: '#00B4FF',
          dark: '#1d1d1d',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037'
        }
      }
    })

    // Quasar automatically provides '_q_' through Vue's provide/inject system
    // when you call nuxtApp.vueApp.use(Quasar, ...)
    // No need to manually provide it again - that causes the warning
    console.log('[Quasar Plugin] Quasar registered, instance:', quasarInstance);
    console.log('[Quasar Plugin] Checking for _q_ in globalProperties...');
    
    // Check if Quasar instance is available
    nextTick(() => {
      const qInstance = nuxtApp.vueApp.config.globalProperties.$q;
      console.log('[Quasar Plugin] $q in globalProperties:', !!qInstance);
      if (qInstance) {
        console.log('[Quasar Plugin] Quasar instance available:', qInstance);
        console.log('[Quasar Plugin] $q.screen exists:', !!qInstance.screen);
        console.log('[Quasar Plugin] $q.screen type:', typeof qInstance.screen);
        if (qInstance.screen) {
          console.log('[Quasar Plugin] $q.screen.xs exists:', qInstance.screen.xs !== undefined);
          console.log('[Quasar Plugin] $q.screen.xs value:', qInstance.screen.xs);
          console.log('[Quasar Plugin] $q.screen properties:', Object.keys(qInstance.screen));
        } else {
          console.error('[Quasar Plugin] ERROR: $q.screen is undefined! Screen plugin may not be registered properly.');
        }
      } else {
        console.warn('[Quasar Plugin] Quasar instance not found in globalProperties');
      }
    });
    
    // Debug: Log icon set configuration (only in development)
    if (import.meta.dev && import.meta.client) {
      console.log('Quasar icon set configured:', quasarIconSet)
      // @ts-ignore - Icon set properties are available at runtime
      console.log('Sample icon mapping (search):', quasarIconSet?.search)
      // @ts-ignore - Icon set properties are available at runtime
      console.log('Sample icon mapping (two_wheeler):', quasarIconSet?.two_wheeler)
    }

    // Also register components directly for immediate availability
  const componentMap = {
    'q-btn': QBtn,
    'QBtn': QBtn,
    'q-icon': QIcon,
    'QIcon': QIcon,
    'q-input': QInput,
    'QInput': QInput,
    'q-card': QCard,
    'QCard': QCard,
    'q-card-section': QCardSection,
    'QCardSection': QCardSection,
    'q-card-actions': QCardActions,
    'QCardActions': QCardActions,
    'q-select': QSelect,
    'QSelect': QSelect,
    'q-spinner': QSpinner,
    'QSpinner': QSpinner,
    'q-dialog': QDialog,
    'QDialog': QDialog,
    'q-form': QForm,
    'QForm': QForm,
    'q-uploader': QUploader,
    'QUploader': QUploader,
    'q-file': QFile,
    'QFile': QFile,
    'q-linear-progress': QLinearProgress,
    'QLinearProgress': QLinearProgress,
    'q-badge': QBadge,
    'QBadge': QBadge,
    'q-banner': QBanner,
    'QBanner': QBanner,
    'q-carousel': QCarousel,
    'QCarousel': QCarousel,
    'q-carousel-slide': QCarouselSlide,
    'QCarouselSlide': QCarouselSlide,
    'q-carousel-control': QCarouselControl,
    'QCarouselControl': QCarouselControl,
    'q-toggle': QToggle,
    'QToggle': QToggle,
    'q-tooltip': QTooltip,
    'QTooltip': QTooltip,
    'q-popup-proxy': QPopupProxy,
    'QPopupProxy': QPopupProxy,
    'q-separator': QSeparator,
    'QSeparator': QSeparator,
    'q-space': QSpace,
    'QSpace': QSpace,
    'q-radio': QRadio,
    'QRadio': QRadio,
    'q-checkbox': QCheckbox,
    'QCheckbox': QCheckbox
  }

    // Register all components
    Object.entries(componentMap).forEach(([name, component]) => {
      nuxtApp.vueApp.component(name, component)
    })

    // Debug: Log registered components (only in development)
    if (import.meta.dev && import.meta.client) {
      console.log('[Quasar Plugin] Registered components:', Object.keys(componentMap))
      console.log('[Quasar Plugin] QFile available:', !!QFile)
      console.log('[Quasar Plugin] QCardActions available:', !!QCardActions)
    }
  }
})

