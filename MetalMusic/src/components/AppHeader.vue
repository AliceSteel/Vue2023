<template>
  <header id="header" class="bg-transparent w-full p-0">
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
            <router-link :to="{ name: 'songs' }" class="px-8 text-white">Songs</router-link>
          </li>
          <li v-if="!userStore.userLoggedIn">
            <a class="px-8 text-white" href="#" @click.prevent="toggleAuthModal"
              >Login / Register</a
            >
          </li>
          <template v-else>
            <li>
              <router-link :to="{ name: 'manage' }" class="px-8 text-white">Upload</router-link>
            </li>
            <li>
              <a class="px-8 text-white" href="#" @click.prevent="signOut">Logout</a>
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
