<template>
  <div
    class="text-white text-center font-bold p-4 mb-4"
    v-if="loginShowAlert"
    :class="loginAlertVariant"
  >
    {{ loginAlertMessage }}
  </div>
  <!-- Login Form -->
  <vee-form :validation-schema="loginSchema" @submit="login">
    <!-- Email -->
    <div class="mb-3">
      <label class="inline-block mb-2">Email</label>
      <vee-field
        name="email"
        type="email"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Enter Email"
      />
      <ErrorMessage class="text-red-600" name="email" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Password</label>
      <vee-field
        name="password"
        type="password"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Password"
      />
      <ErrorMessage class="text-red-600" name="password" />
    </div>
    <button
      type="submit"
      :disable="loginInSubmission"
      class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700"
    >
      Submit
    </button>
  </vee-form>
</template>

<script setup>
import { ref } from 'vue'
import useUserStore from '@/stores/user'
import { ErrorMessage } from 'vee-validate'

const loginSchema = {
  email: 'required|email',
  password: 'required|min:8|max:100'
}
const loginInSubmission = ref(false)
const loginShowAlert = ref(false)
const loginAlertVariant = ref('bg-blue-500')
const loginAlertMessage = ref('Please wait! We are logging you in.')

const userStore = useUserStore()

// Methods
async function login(values) {
  loginShowAlert.value = true
  loginInSubmission.value = true
  loginAlertVariant.value = 'bg-blue-500'
  loginAlertMessage.value = 'Please wait! We are logging you in.'
  try {
    await userStore.authenticate(values)
  } catch (error) {
    loginInSubmission.value = false
    loginAlertVariant.value = 'bg-red-500'
    loginAlertMessage.value = 'Invalid login details.'
    return
  }

  loginAlertVariant.value = 'bg-green-500'
  loginAlertMessage.value = 'Success!'
  window.location.reload()
}
</script>
