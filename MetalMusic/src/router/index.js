import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    name: 'home',
    path: '/',
    component: HomePage
  },
  {
    name: 'manage',
    //alias: '/manage',
    path: '/manage-music',
    component: () => import(/* webpackChunkName: "Manage" */ '@/views/ManagePage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'song',
    path: '/song/:id',
    component: () => import(/* webpackChunkName: "Song" */ '@/views/SongPage.vue')
  },
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'text-yellow-500',
  // eslint-disable-next-line no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        // el: document.getElementById('main'):
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return {
        top: 0,
        behavior: 'smooth'
      }
    }
  }
})
//for guarding our pages from un-authorized access:
router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  const store = useUserStore()
  if (store.userLoggedIn) {
    next()
  } else {
    next({ name: 'home' })
  }
})

export default router
