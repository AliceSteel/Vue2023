import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import useUserStore from '@/stores/user'

const routes = [
  {
    name: 'home',
    path: '/',
    component: HomeView
  },
  {
    name: 'about',
    path: '/about',
    component: () => import(/* webpackChunkName: "About" */ '@/views/AboutView.vue')
  },
  {
    name: 'manage',
    //alias: '/manage',
    path: '/manage-music',
    component: () => import(/* webpackChunkName: "Manage" */ '@/views/ManageView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'song',
    path: '/song/:id',
    component: () => import(/* webpackChunkName: "Song" */ '@/views/SongView.vue')
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
  scrollBehavior() {
    return {
      top: 0,
      behavior: 'smooth'
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
