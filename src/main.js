/* Main entrance */
import { createApp } from 'vue'

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
