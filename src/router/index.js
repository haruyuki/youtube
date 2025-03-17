import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { getBaseUrl } from '../utils/path'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/vods',
    name: 'VODs',
    component: () => import('../views/VODs.vue')
  }
]

const router = createRouter({
  history: createWebHistory(getBaseUrl()),
  routes
})

export default router