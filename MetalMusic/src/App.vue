<template>
  <main class="bg-black uppercase pb-10">
    <app-header />

    <router-view v-slot="{ Component, route }">
      <transition name="slide-down" mode="out-in">
        <div :key="route.name">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>

    <app-player />

    <app-auth />
  </main>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import AppAuth from '@/components/AppAuth.vue'
import AppPlayer from '@/components/AppPlayer.vue'
import { mapWritableState } from 'pinia'
import useUserStore from '@/stores/user'
import { auth } from './includes/firebase'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppAuth,
    AppPlayer
  },
  computed: {
    ...mapWritableState(useUserStore, ['userLoggedIn'])
  },
  created() {
    if (auth.currentUser) {
      this.userLoggedIn = true
    }
  }
}
</script>

<style>
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(400px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: 0.3s ease-out;
}
</style>
