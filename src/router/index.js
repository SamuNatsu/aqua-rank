/* Router */
import { createRouter, createWebHistory } from 'vue-router'

// Routes
const routes = [
  {
    path: '/',
    name: 'rank',
    component: ()=>import('../views/Rank.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: ()=>import('../views/Settings.vue')
  }
]

// Router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Export
export default router
