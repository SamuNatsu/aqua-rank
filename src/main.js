/* Main entrance */
import { createApp } from 'vue'

// Import global stylesheet
import 'normalize.css'
import './style.css'

// Import application view
import App from './App.vue'

// Create application
createApp(App)
  .mount('#app')
