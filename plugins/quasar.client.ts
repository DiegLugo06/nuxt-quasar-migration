import { Quasar } from 'quasar'
import quasarLang from 'quasar/lang/es'
import quasarIconSet from 'quasar/icon-set/material-icons'
import { Notify, Dialog, Loading } from 'quasar'

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
  QSelect,
  QSpinner,
  QDialog,
  QForm,
  QUploader,
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
  QSpace
} from 'quasar'

export default defineNuxtPlugin({
  name: 'quasar-client',
  enforce: 'pre', // Run before other plugins to ensure Quasar is available early
  setup(nuxtApp) {
    // Register Quasar globally
    nuxtApp.vueApp.use(Quasar, {
      lang: quasarLang,
      iconSet: quasarIconSet, // Configure Material Icons as the icon set
      plugins: {
        Notify,
        Dialog,
        Loading
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
    
    // Debug: Log icon set configuration (only in development)
    if (import.meta.dev && import.meta.client) {
      console.log('Quasar icon set configured:', quasarIconSet)
      console.log('Sample icon mapping (search):', quasarIconSet?.search)
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
    'QSpace': QSpace
  }

    // Register all components
    Object.entries(componentMap).forEach(([name, component]) => {
      nuxtApp.vueApp.component(name, component)
    })
  }
})

