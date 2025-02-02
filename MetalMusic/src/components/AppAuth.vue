<template>
  <!-- Auth Modal -->
  <div
    class="top-0 left-0 bg-black bg-opacity-75 transition-all backdrop-blur-sm w-full min-h-screen flex items-center justify-center"
    id="modal"
    :class="hiddenClass"
  >
    <div class="fixed inset-0 transition-opacity">
      <div class="absolute inset-0 bg-gray-800 opacity-75"></div>
    </div>

    <!-- This element is to trick the browser into centering the modal contents. -->
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

    <div
      class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
    >
      <!-- Add margin if you want to see some of the overlay behind the modal-->
      <div class="py-4 text-left px-6">
        <!--Title-->
        <div class="flex justify-between items-center pb-4">
          <p class="text-2xl font-bold">Your Account</p>
          <!-- Modal Close Button -->
          <div class="modal-close cursor-pointer z-50" @click="closeModal">
            <i class="fas fa-times"></i>
          </div>
        </div>

        <!-- Tabs -->
        <ul class="flex flex-wrap mb-4">
          <li class="flex-auto text-center">
            <a
              class="block rounded py-3 px-4 transition"
              href="#"
              @click.prevent="tab = 'login'"
              :class="{
                'hover:text-white text-white bg-blue-600': tab === 'login',
                'hover:text-blue-600': tab === 'register'
              }"
              >Login</a
            >
          </li>
          <li class="flex-auto text-center">
            <a
              class="block rounded py-3 px-4 transition"
              href="#"
              @click.prevent="tab = 'register'"
              :class="{
                'hover:text-white text-white bg-blue-600': tab === 'register',
                'hover:text-blue-600': tab === 'login'
              }"
              >Register</a
            >
          </li>
        </ul>

        <login-form v-if="tab === 'login'" />
        <register-form v-else />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import useModalStore from '@/stores/modal'
import RegisterForm from './RegisterForm.vue'
import LoginForm from './LoginForm.vue'
import { ref, computed } from 'vue'

const tab = ref('login')
const modalStore = useModalStore()
const { isOpen } = storeToRefs(modalStore)

const hiddenClass = computed(() => {
  return isOpen.value ? 'fixed z-30' : 'hidden'
})

const closeModal = () => {
  isOpen.value = false
}
</script>
