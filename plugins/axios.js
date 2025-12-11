import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Debug: Always log to see if plugin is running
  console.log('🔧 [Axios Plugin] Plugin loaded!')
  console.log('🔧 [Axios Plugin] FLASK_BACKEND_URL:', config.public.FLASK_BACKEND_URL)
  console.log('🔧 [Axios Plugin] FLASK_BACKEND_KEY exists:', !!config.public.FLASK_BACKEND_KEY)
  console.log('🔧 [Axios Plugin] FLASK_BACKEND_KEY value:', config.public.FLASK_BACKEND_KEY ? config.public.FLASK_BACKEND_KEY.substring(0, 10) + '...' : 'MISSING')
  console.log('🔧 [Axios Plugin] Is client:', import.meta.client)
  console.log('🔧 [Axios Plugin] Is dev:', import.meta.dev)

  // Create axios instance - matching original project exactly
  const api = axios.create({
    baseURL: config.public.FLASK_BACKEND_URL,
    headers: {
      'Content-Type': 'application/json',
      'Public-key': config.public.FLASK_BACKEND_KEY, // Match original: lowercase 'k'
    },
  })

  // Log the actual headers being set
  console.log('🔧 [Axios Plugin] Axios instance created with headers:', {
    'Content-Type': 'application/json',
    'Public-key': config.public.FLASK_BACKEND_KEY ? '***SET***' : 'MISSING'
  })

  // Inject the axios instance into the Nuxt context
  nuxtApp.provide('axios', api)
})

