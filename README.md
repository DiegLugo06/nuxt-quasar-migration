# Nuxt 3 + Quasar Components Migration

Migration of `nuxt-naive-project` to use **Nuxt 3** with **Quasar components** (replacing Naive UI).

## Architecture

- **Framework**: Nuxt 3 (SSR, file-based routing, layouts)
- **UI Components**: Quasar (component library)
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   NUXT_PUBLIC_FLASK_BACKEND_URL=http://localhost:5000
   NUXT_PUBLIC_FLASK_BACKEND_KEY=your-api-key-here
   ```

## Development

Start the development server:

```bash
npm run dev
```

## Build

Build for production:

```bash
npm run build
```

## Key Features

- ✅ Nuxt 3 framework (SSR, file-based routing)
- ✅ Quasar component library
- ✅ Pinia state management
- ✅ Axios for API calls
- ✅ Tailwind CSS for styling
- ✅ Responsive design

## Component Migration

All Naive UI components have been replaced with Quasar components:

| Naive UI | Quasar |
|----------|--------|
| `n-input` | `q-input` |
| `n-button` | `q-btn` |
| `n-card` | `q-card` |
| `n-form` | `q-form` |
| `n-select` | `q-select` |
| `n-message` | `$q.notify()` |
| `n-dialog` | `$q.dialog()` |
| `n-loading` | `$q.loading` |

## Project Structure

```
nuxt-quasar-migration/
├── components/     # Vue components (using Quasar)
├── layouts/         # Nuxt layouts
├── pages/           # Nuxt pages (file-based routing)
├── plugins/         # Nuxt plugins (axios, quasar)
├── public/          # Static assets
├── stores/          # Pinia stores
├── app.vue          # Root component
└── nuxt.config.ts   # Nuxt configuration
```

## Technologies

- **Nuxt 3** - Vue.js framework
- **Quasar** - Component library
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

## License

Same as the original project.

