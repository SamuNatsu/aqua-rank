/* Main entrance */
import { createApp } from 'vue'

// Import plugins
import pinia from './store'

// Import global stylesheet
import 'normalize.css'
import './style.css'

// Import application view
import App from './App.vue'

// Create application
createApp(App)
  .use(pinia)
  .mount('#app')
