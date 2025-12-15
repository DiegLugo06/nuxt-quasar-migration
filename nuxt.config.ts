// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  
  css: [
    '@quasar/extras/material-icons/material-icons.css',
    'quasar/src/css/index.sass'
  ],
  vite: {
    optimizeDeps: {
      include: ['quasar']
    },
    ssr: {
      // Don't externalize quasar - bundle it for SSR
      noExternal: ['quasar']
    },
    css: {
      preprocessorOptions: {
        sass: {
          // Suppress deprecation warnings from Quasar's SASS files
          silenceDeprecations: ['import']
        }
      }
    }
  },
  
  nitro: {
    // Ensure quasar is properly handled during SSR
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    // Inline quasar to handle CommonJS properly
    externals: {
      inline: ['quasar']
    }
  },
  
  // Configure Vue to handle hydration mismatches gracefully
  vue: {
    compilerOptions: {
      // Suppress hydration warnings for Quasar components
      // They will be properly hydrated on the client
      isCustomElement: () => false
    },
    // Configure Vue to be more lenient with hydration
    propsDestructure: true
  },
  
  // Experimental: Reduce hydration warnings
  experimental: {
    payloadExtraction: false
  },
  
  runtimeConfig: {
    // Public variables (Exposed to the client)
    public: {
      FLASK_BACKEND_URL: process.env.NUXT_PUBLIC_FLASK_BACKEND_URL || process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
      FLASK_BACKEND_KEY: process.env.NUXT_PUBLIC_FLASK_BACKEND_KEY || process.env.NUXT_PUBLIC_API_KEY || '',
      SUPABASE_PROJECT_ID: process.env.NUXT_PUBLIC_SUPABASE_PROJECT_ID || ''
    }
  },

  plugins: [
    '~/plugins/axios.js',
    '~/plugins/quasar.server.ts', // SSR stubs
    '~/plugins/quasar.client.ts',  // Client-side registration
    '~/plugins/material-icons.client.ts', // Ensure Material Icons font loads
    '~/plugins/suppress-hydration-warnings.client.ts' // Suppress expected hydration warnings
  ],
  
  app: {
    head: {
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
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
        }
      ],
      style: [
        {
          children: `
            /* Ensure Material Icons font is applied to all q-icon elements */
            .q-icon,
            .q-icon i,
            .q-icon .material-icons,
            i.material-icons,
            .material-icons {
              font-family: 'Material Icons' !important;
              font-weight: normal !important;
              font-style: normal !important;
              font-size: 24px !important;
              line-height: 1 !important;
              letter-spacing: normal !important;
              text-transform: none !important;
              display: inline-block !important;
              white-space: nowrap !important;
              word-wrap: normal !important;
              direction: ltr !important;
              -webkit-font-feature-settings: 'liga' !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
            }
          `
        }
      ]
    }
  }
})

