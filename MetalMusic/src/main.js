import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VeeValidatePlugin from './includes/validation'
import { auth } from './includes/firebase'
import Icon from './directives/icon'
import { registerSW } from 'virtual:pwa-register'
import GLobalComponents from '@/includes/_globals'

import './assets/base.css'
import './assets/main.css'

registerSW({ immidiate: true })

let app

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App)

    app.use(createPinia())
    app.use(router)
    app.use(VeeValidatePlugin)
    app.use(GLobalComponents)

    app.directive('icon', Icon)

    app.mount('#app')
  }
})
