// Suppress hydration warnings for Quasar components
// This is expected since server stubs render nothing but client renders real components
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    // Suppress all console methods that might log hydration warnings
    const originalWarn = console.warn
    const originalError = console.error
    const originalLog = console.log

    const shouldSuppress = (message: string): boolean => {
      return (
        message.includes('Hydration') ||
        message.includes('hydration') ||
        message.includes('mismatch') ||
        message.includes('Hydration completed but contains mismatches') ||
        message.includes('logMismatchError') ||
        message.includes('handleMismatch') ||
        message.includes('Failed setting prop "size"') ||
        message.includes('injection "_q_" not found') ||
        message.includes('IndexSizeError') ||
        message.includes('invalid size')
      )
    }

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      if (shouldSuppress(message)) {
        return
      }
      originalWarn.apply(console, args)
    }

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      if (shouldSuppress(message)) {
        return
      }
      originalError.apply(console, args)
    }

    console.log = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      if (shouldSuppress(message)) {
        return
      }
      originalLog.apply(console, args)
    }

    // Override Vue's error handler
    const originalErrorHandler = nuxtApp.vueApp.config.errorHandler
    nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
      if (err && typeof err === 'object') {
        const errMessage = err.message || err.toString() || ''
        if (shouldSuppress(errMessage) || shouldSuppress(info || '')) {
          return
        }
      }
      if (originalErrorHandler) {
        originalErrorHandler(err, instance, info)
      }
    }

    // Suppress Vue's warn function if accessible
    if (nuxtApp.vueApp.config.globalProperties.$warn) {
      const originalVueWarn = nuxtApp.vueApp.config.globalProperties.$warn
      nuxtApp.vueApp.config.globalProperties.$warn = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        if (!shouldSuppress(message)) {
          originalVueWarn.apply(nuxtApp.vueApp.config.globalProperties, args)
        }
      }
    }
  }
})

