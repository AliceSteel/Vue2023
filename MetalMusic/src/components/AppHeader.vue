<template>
  <header
    id="header"
    class="w-full p-0 fixed top-0 left-0 z-50 backdrop-invert bg-black/60 drop-shadow-[0_0_5px_rgb(153,153,153)]"
    :class="{ 'bg-black/30': this.$route.name === 'song' }"
  >
    <nav class="container mx-auto flex justify-between items-center py-1 px-4">
      <!-- App Name -->
      <router-link :to="{ name: 'home' }" class="w-2/6"
        ><img class="w-full" src="/assets/img/logo-white.png" alt="Metalhead"
      /></router-link>

      <div class="flex justify-between content-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1 text-2xl">
          <!-- Navigation Links -->
          <li>
            <router-link
              v-if="this.$route.name === 'home'"
              to="#songs"
              class="px-4 text-white md:px-8"
              title="Songs list"
              ><span class="hidden md:inline-block">Songs</span>
              <i class="fa fa-music text-green-400 text-2xl md:hidden"></i>
            </router-link>
            <router-link
              v-else
              :to="{ name: 'home', hash: '#songs' }"
              class="px-4 text-white md:px-8"
              title="Songs list"
              ><span class="hidden md:inline-block">Songs</span>
              <i class="fa fa-music text-green-400 text-2xl md:hidden"></i>
            </router-link>
          </li>
          <li v-if="!userStore.userLoggedIn">
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

<script>
import { mapStores } from 'pinia'
import useModalStore from '@/stores/modal'
import useUserStore from '@/stores/user'

export default {
  name: 'AppHeader',
  computed: {
    ...mapStores(useModalStore, useUserStore)
  },
  methods: {
    toggleAuthModal() {
      this.modalStore.isOpen = !this.modalStore.isOpen
    },
    signOut() {
      this.userStore.signOut()
      if (this.$route.meta.requiresAuth) {
        this.$router.push({ name: 'home' })
      }
    }
  }
}
</script>

<style scoped>
#header {
  transition: all 0.2s ease;
}
</style>
