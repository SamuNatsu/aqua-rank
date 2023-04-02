/* Router */
import { createRouter, createWebHistory } from 'vue-router'

// Routes
const routes = [
  {
    path: '/',
    component: ()=>import('../views/Index.vue')
  },
  {
    path: '/rank',
    component: ()=>import('../views/Rank.vue')
  },
  {
    path: '/settings',
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
