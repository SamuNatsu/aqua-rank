/* Main entrance */
import { createApp } from 'vue'
import { register } from './api/hotkey'

// Import plugins
import pinia from './store'

// Import global stylesheet
import 'normalize.css'
import './style.css'

// Import application component
import App from './App.vue'

// Create application
createApp(App)
  .use(pinia)
  .mount('#app')

// Register hotkeys
register()
