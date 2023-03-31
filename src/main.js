/* Main entrance */
import { createApp } from 'vue'
import { register } from './api/hotkey'

// Import plugins
import pinia from './store'
import router from './router'

// Import global stylesheet
import 'normalize.css'
import './style.css'

// Import application component
import App from './App.vue'

// Create application
createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')

// Register hotkeys
register()
