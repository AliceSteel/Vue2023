<template>
  <!-- Song/item for ManagePage -->
  <div class="border-b-2 border-white p-3 mb-4 rounded">
    <div v-show="!showForm" class="py-3 flex justify-between items-center">
      <h4 class="inline-block text-2xl text-white">{{ song.modified_name }}</h4>
      <button
        class="ml-auto py-1 px-2 text-sm rounded text-white bg-green-600"
        @click.prevent="showForm = !showForm"
      >
        <i class="fa fa-pencil-alt"></i>
      </button>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600"
        @click.prevent="deleteSong"
      >
        <i class="fa fa-times"></i>
      </button>
    </div>
    <div v-show="showForm">
      <div class="text-white text-center font-bold p-4 mb-4" v-if="showAlert" :class="alertVariant">
        {{ alertMessage }}
      </div>
      <vee-form :validation-schema="schema" :initial-values="song" @submit="edit">
        <div class="mb-3">
          <label class="inline-block mb-2">Song Title</label>
          <vee-field
            name="modified_name"
            type="text"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Song Title"
            @input="updateUnsavedFlag(true)"
          />
          <ErrorMessage class="text-red-600" name="modified_name" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field
            name="genre"
            type="text"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Genre"
            @input="updateUnsavedFlag(true)"
          />
          <ErrorMessage class="text-red-600" name="genre" />
        </div>
        <button
          type="submit"
          class="py-1.5 px-3 rounded text-white bg-green-600"
          :disabled="inSubmission"
        >
          Submit
        </button>
        <button
          type="button"
          class="py-1.5 px-3 rounded text-white bg-gray-600"
          :disabled="inSubmission"
          @click.prevent="showForm = false"
        >
          Go Back
        </button>
      </vee-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { songsCollection, storage } from '@/includes/firebase'
import { ErrorMessage } from 'vee-validate'

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  updateSong: {
    type: Function,
    required: true
  },
  indx: {
    type: Number,
    required: true
  },
  removeSong: {
    type: Function,
    required: true
  },
  updateUnsavedFlag: {
    type: Function
  }
})
const showForm = ref(false)
const schema = {
  modified_name: 'required',
  genre: 'alphaSpaces'
}
const inSubmission = ref(false)
const showAlert = ref(false)
const alertVariant = ref('bg-blue-500')
const alertMessage = ref('Please wait! Update is in a progress...')

async function edit(values) {
  inSubmission.value = true
  showAlert.value = true
  alertVariant.value = 'bg-blue-500'
  alertMessage.value = 'Please wait! Update is in a progress...'

  try {
    await songsCollection.doc(props.song.docID).update(values)
  } catch (error) {
    inSubmission.value = false
    alertVariant.value = 'bg-red-500'
    alertMessage.value = 'Something went wrong! Try again later'
    return
  }
  props.updateSong(props.indx, values)
  props.updateUnsavedFlag(false)
  inSubmission.value = false
  alertVariant.value = 'bg-green-500'
  alertMessage.value = 'Success! Your updates were saved.'
}
async function deleteSong() {
  const storageRef = storage.ref()
  const songRef = storageRef.child(`songs/${props.song.original_name}`)

  await songRef.delete()

  await songsCollection.doc(props.song.docID).delete()

  props.removeSong(props.indx)
}
</script>
