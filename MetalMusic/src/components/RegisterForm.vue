<template>
  <!-- Registration Form -->
  <div
    class="text-white text-center font-bold p-4 rounded mb-4"
    v-if="regShowAlert"
    :class="regAlertVariant"
  >
    {{ regAlertMessage }}
  </div>
  <vee-form :validation-schema="schema" @submit="register" :initial-values="userData">
    <!-- Name -->
    <div class="mb-3">
      <label class="inline-block mb-2">Name</label>
      <vee-field
        name="name"
        type="text"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Enter Name"
      />
      <ErrorMessage class="text-red-600" name="name" />
    </div>
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
    <!-- Age -->
    <div class="mb-3">
      <label class="inline-block mb-2">Age</label>
      <vee-field
        name="age"
        type="number"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
      />
      <ErrorMessage class="text-red-600" name="age" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Password</label>

      <vee-field name="password" :bails="false" v-slot="{ field, errors }">
        <!--  bails let to check all the rules, not just first-->
        <input
          type="password"
          class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          placeholder="Password"
          v-bind="field"
        />
        <div class="text-red-600" v-for="error in errors" :key="error">{{ error }}</div>
      </vee-field>
    </div>
    <!-- Confirm Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Confirm Password</label>
      <vee-field
        name="confirm_password"
        type="password"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Confirm Password"
      />
      <ErrorMessage class="text-red-600" name="confirm_password" />
    </div>
    <!-- Country -->
    <div class="mb-3">
      <label class="inline-block mb-2">Country</label>
      <vee-field
        as="select"
        name="country"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
      >
        <option value="Denmark">Denmark</option>
        <option value="UK">UK</option>
        <option value="Ukraine">Ukraine</option>
        <option value="other">Other country</option>
      </vee-field>
      <ErrorMessage class="text-red-600" name="country" />
    </div>
    <!-- Artist or Listener -->
    <div class="mb-3">
      <label class="inline-block mb-2">Are you a Listener or an Artist?</label>
      <vee-field
        as="select"
        name="role"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
      >
        <option value="listener">Listener</option>
        <option value="artist">Artist</option>
      </vee-field>
      <ErrorMessage class="text-red-600" name="role" />
    </div>
    <!-- TOS -->
    <div class="mb-3 pl-6">
      <vee-field
        name="tos"
        type="checkbox"
        class="w-4 h-4 float-left -ml-6 mt-1 rounded"
        value="1"
      />
      <label class="inline-block">Accept terms of service</label>
      <ErrorMessage class="text-red-600" name="tos" />
    </div>
    <button
      type="submit"
      class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700"
      :disabled="regInSubmission"
    >
      Submit
    </button>
  </vee-form>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { ErrorMessage } from 'vee-validate'

const userData = ref({
  country: 'Denmark',
  role: 'listener'
})
const regInSubmission = ref(false)
const regShowAlert = ref(false)
const regAlertVariant = ref('bg-blue-500')
const regAlertMessage = ref('Please wait! Your account is being created.')

// Store
const userStore = useUserStore()
const { createUser } = userStore

// State
const schema = {
  name: 'required|min:3|max:100|alphaSpaces',
  email: 'required|min:3|max:100|email',
  age: 'required|minVal:18|maxVal:100',
  password: 'required|min:8|max:100|excluded:password',
  confirm_password: 'required|passwordsMismatch:@password',
  country: 'required|excluded:other',
  role: 'required',
  tos: 'tos'
}

async function register(values) {
  regShowAlert.value = true
  regInSubmission.value = true
  regAlertVariant.value = 'bg-blue-500'
  regAlertMessage.value = 'Please wait! Your account is being created.'

  try {
    await createUser(values)
  } catch (error) {
    regInSubmission.value = false
    regAlertVariant.value = 'bg-red-500'
    regAlertMessage.value = 'An unexpected error occurred. Please try again later.'
    return
  }

  regAlertVariant.value = 'bg-green-500'
  regAlertMessage.value = 'Success! Your account has been created.'
  window.location.reload()
}
</script>
