<template>
  <header
    id="header"
    class="w-full h-24 fixed top-0 left-0 z-30 backdrop-blur-sm drop-shadow-[0_0_5px_rgb(153,153,153)]"
    :class="{ 'bg-black/30': route.name === 'song' }"
  >
    <nav class="container mx-auto flex justify-end items-center h-full">
      <!-- App Name -->
      <router-link
        :to="{ name: 'home' }"
        class="mr-auto max-w-[50%] sm:max-w-[30%] py-2 text-3xl text-white"
        title="home"
        >TuneThread
      </router-link>

      <div class="flex justify-between content-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1 text-2xl">
          <!-- Navigation Links -->
          <li>
            <router-link
              :to="{ name: 'home', hash: '#songs' }"
              class="px-4 text-white md:px-8"
              title="Songs list"
              ><span class="hidden md:inline-block">Songs</span>
              <i class="fa fa-music text-green-400 text-2xl md:hidden"></i>
            </router-link>
          </li>
          <li v-if="!userLoggedIn">
            <a
              class="px-4 text-white md:px-8"
              href="#"
              @click.prevent="toggleAuthModal"
              title="Login"
              ><span class="hidden md:inline-block">Login</span>
              <i class="fa fa-eye text-green-400 text-2xl md:hidden"></i>
            </a>
          </li>
          <template v-else>
            <li>
              <router-link
                :to="{ name: 'manage' }"
                class="px-4 text-white md:px-8"
                title="Songs Upload"
              >
                <span class="hidden md:inline-block">Upload</span>
                <i class="fa fa-cloud-upload-alt text-green-400 text-2xl md:hidden"></i>
              </router-link>
            </li>
            <li>
              <a class="px-4 text-white md:px-8" href="#" @click.prevent="signOut" title="Sign Out">
                <span class="hidden md:inline-block">Logout</span>
                <i class="fa fa-eye-slash text-green-400 text-2xl md:hidden"></i>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import useModalStore from '@/stores/modal'
import useUserStore from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()
const userStore = useUserStore()

const { isOpen } = storeToRefs(modalStore)
const { userLoggedIn } = storeToRefs(userStore)

const toggleAuthModal = () => {
  isOpen.value = !isOpen.value
}

const signOut = () => {
  userStore.signOut()
  if (route.meta.requiresAuth) {
    router.push({ name: 'home' })
  }
}
</script>

<style scoped>
#header {
  transition: all 0.2s ease;
}
</style>
