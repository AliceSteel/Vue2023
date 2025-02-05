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

    <app-auth />
  </main>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppAuth from '@/components/AppAuth.vue'
import { useUserStore } from '@/stores/user'
import { auth } from './includes/firebase'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const userStore = useUserStore()
const { userLoggedIn } = storeToRefs(userStore)

onMounted(() => {
  if (auth.currentUser) {
    userLoggedIn.value = true
  }
})
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
