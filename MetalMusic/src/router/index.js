import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/about',
    component: () => import(/* webpackChunkName: "About" */ '@/views/AboutView.vue')
  },
  {
    path: '/manage',
    component: () => import(/* webpackChunkName: "Manage" */ '@/views/ManageView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
