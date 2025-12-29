// Server-side plugin to provide stub components for SSR
// These stubs render comment nodes to avoid hydration mismatches
// The client will render the real Quasar components
import { defineComponent } from 'vue'

// defineNuxtPlugin is auto-imported by Nuxt 3
// @ts-ignore - Auto-imported by Nuxt, available at runtime
export default defineNuxtPlugin((nuxtApp) => {
  // Provide a stub Quasar instance for SSR at the app level
  // This prevents "injection _q_ not found" errors during SSR
  nuxtApp.vueApp.provide('_q_', {
    lang: {},
    config: {},
    version: 'stub'
  })
  // Create a stub that renders nothing
  // Vue handles this gracefully during hydration
  const createStub = (name: string) => defineComponent({
    name: `${name}Stub`,
    props: {} as any,
    inheritAttrs: false,
    setup() {
      // Return nothing - client will replace with real component
      return () => null as any
    }
  })

  // Create input stub - accepts all props but doesn't render anything
  // This prevents prop validation errors during SSR
  const QInputStub = defineComponent({
    name: 'QInputStub',
    inheritAttrs: false, // Don't apply attributes to root element
    props: {} as any, // Accept all props without validation
    emits: ['update:modelValue'],
    setup() {
      // Render nothing - client will replace with real component
      // This prevents hydration mismatches and prop errors
      return () => null as any
    }
  })

  // Create select stub
  const QSelectStub = defineComponent({
    name: 'QSelectStub',
    inheritAttrs: false, // Don't apply attributes to root element
    props: {} as any, // Accept all props without validation
    emits: ['update:modelValue'],
    setup() {
      return () => null as any
    }
  })

  // Register input and select stubs
  nuxtApp.vueApp.component('q-input', QInputStub)
  nuxtApp.vueApp.component('QInput', QInputStub)
  nuxtApp.vueApp.component('q-select', QSelectStub)
  nuxtApp.vueApp.component('QSelect', QSelectStub)

  // Create radio stub
  const QRadioStub = defineComponent({
    name: 'QRadioStub',
    inheritAttrs: false,
    props: {} as any,
    emits: ['update:modelValue'],
    setup() {
      return () => null as any
    }
  })

  // Register radio stub
  nuxtApp.vueApp.component('q-radio', QRadioStub)
  nuxtApp.vueApp.component('QRadio', QRadioStub)

  // Create checkbox stub
  const QCheckboxStub = defineComponent({
    name: 'QCheckboxStub',
    inheritAttrs: false,
    props: {} as any,
    emits: ['update:modelValue'],
    setup() {
      return () => null as any
    }
  })

  // Register checkbox stub
  nuxtApp.vueApp.component('q-checkbox', QCheckboxStub)
  nuxtApp.vueApp.component('QCheckbox', QCheckboxStub)

  // Register all other components as generic stubs
  const otherComponents = [
    'QBtn', 'q-btn',
    'QIcon', 'q-icon',
    'QCard', 'q-card',
    'QCardSection', 'q-card-section',
    'QCardActions', 'q-card-actions',
    'QSpinner', 'q-spinner',
    'QDialog', 'q-dialog',
    'QForm', 'q-form',
    'QUploader', 'q-uploader',
    'QFile', 'q-file',
    'QLinearProgress', 'q-linear-progress',
    'QBadge', 'q-badge',
    'QBanner', 'q-banner',
    'QCarousel', 'q-carousel',
    'QCarouselSlide', 'q-carousel-slide',
    'QCarouselControl', 'q-carousel-control',
    'QToggle', 'q-toggle',
    'QTooltip', 'q-tooltip',
    'QPopupProxy', 'q-popup-proxy',
    'QSeparator', 'q-separator',
    'QSpace', 'q-space'
  ]

  otherComponents.forEach(name => {
    nuxtApp.vueApp.component(name, createStub(name))
  })
})


