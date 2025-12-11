// Client-side plugin to ensure Material Icons font loads correctly
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureMaterialIcons)
    } else {
      ensureMaterialIcons()
    }
    
    // Also run after a short delay to ensure fonts are loaded
    setTimeout(ensureMaterialIcons, 100)
  }
})

function ensureMaterialIcons() {
  // Ensure all q-icon elements and Material Icons have the correct font
  // This style will be applied with high specificity to override any conflicting styles
  const styleId = 'material-icons-fix'
  if (document.getElementById(styleId)) {
    return // Already added
  }
  
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* Force Material Icons font on all q-icon elements */
    .q-icon,
    .q-icon i,
    .q-icon .material-icons,
    i.material-icons,
    .material-icons,
    [class*="q-icon"] i,
    [class*="q-icon"] .material-icons {
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
      speak: none !important;
    }
    
    /* Ensure q-icon content uses Material Icons font */
    .q-icon:not(:empty) {
      font-family: 'Material Icons' !important;
    }
  `
  document.head.appendChild(style)
  
  // Force font loading by creating a test element
  const testEl = document.createElement('span')
  testEl.className = 'material-icons'
  testEl.style.position = 'absolute'
  testEl.style.visibility = 'hidden'
  testEl.style.fontSize = '24px'
  testEl.style.fontFamily = 'Material Icons'
  testEl.textContent = 'home'
  document.body.appendChild(testEl)
  
  // Remove after font loads
  setTimeout(() => {
    if (testEl.parentNode) {
      testEl.parentNode.removeChild(testEl)
    }
  }, 500)
}

