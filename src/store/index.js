/* Pinia */
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Create pinia instance
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Export
export default pinia
