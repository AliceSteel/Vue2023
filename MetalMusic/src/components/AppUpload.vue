<template>
  <div class="bg-transparent rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 py-5 font-bold border-b border-gray-200 flex justify-between items-center">
      <span class="card-title text-white">Upload</span>
      <i class="fas fa-upload text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <!-- Upload Dropbox -->
      <div class="relative w-full h-0 pb-[100%]">
        <video
          loop
          muted
          preload
          autoplay
          class="absolute w-full h-auto top-0 left-0 z-10 rounded-full"
        >
          <source src="/assets/video/DropHere.mp4" type="video/mp4" />
          <source src="/assets/video/DropHere.webm" type="video/webm" />
        </video>

        <div
          class="w-full h-full absolute z-20 px-10 py-20 rounded-full transition duration-500"
          :class="{
            'bg-lime-500/10 border-dotted shadow-cyan-500/50': isDragover
          }"
          @drag.prevent.stop=""
          @dragstart.prevent.stop=""
          @dragend.prevent.stop="isDragover = false"
          @dragover.prevent.stop="isDragover = true"
          @dragenter.prevent.stop="isDragover = true"
          @dragleave.prevent.stop="isDragover = false"
          @drop.prevent.stop="upload($event)"
        ></div>
      </div>
      <div class="my-6 flex justify-items-start items-center gap-2">
        <span class="inline-block text-white">OR</span>
        <input
          type="file"
          multiple
          @change="upload($event)"
          class="inline-block appearance-none self-center bg-grey border-solid rounded-lg file:text-violet-700 focus:bg-green-400 hover:file:border-green-400 hover:file:cursor-pointer"
        />
      </div>

      <hr class="my-6" />

      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-bold text-sm" :class="upload.text_class">
          <i :class="upload.icon"></i>
          {{ upload.name }}
          <span>{{ upload.error_message }}</span>
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
          <!-- Inner Progress Bar -->
          <div
            class="transition-all progress-bar"
            :class="upload.variant"
            :style="{ width: upload.current_progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storage, auth, songsCollection } from '@/includes/firebase'

export default {
  name: 'AppUpload',
  props: {
    addSong: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      isDragover: false,
      uploads: []
    }
  },
  methods: {
    upload($event) {
      this.isDragover = false
      //spreading an object to an array as we need to loop over it(for dragAndDrop or input files upload ):
      const files = $event.dataTransfer ? [...$event.dataTransfer.files] : [...$event.target.files]

      files.forEach((file) => {
        if (file.type !== 'audio/mpeg' || !navigator.onLine) {
          this.uploads.push({
            task: {},
            current_progress: 100,
            name: file.name,
            variant: 'bg-red-400',
            icon: 'fas fa-times',
            text_class: 'text-red-400',
            error_message:
              'Upload failed. Check your internet connection and/or file format is mp3.'
          })
          return
        }
        const storageRef = storage.ref() //metal-music-forum.appspot.com
        const songsRef = storageRef.child(`songs/${file.name}`) //metal-music-forum.appspot.com/songs/example.mp3
        const task = songsRef.put(file) //to initialize upload process

        const uploadIndex =
          this.uploads.push({
            task,
            current_progress: 0,
            name: file.name,
            variant: 'bg-blue-400',
            icon: 'fas fa-spinner fa-spin',
            text_class: '',
            error_message: ''
          }) - 1

        //Firebase: to listen on events(objects) that firebase returns:
        task.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            this.uploads[uploadIndex].current_progress = progress
          },
          //when upload is not successfull:
          (error) => {
            this.uploads[uploadIndex].variant = 'bg-red-400'
            this.uploads[uploadIndex].icon = 'fas fa-times'
            this.uploads[uploadIndex].text_class = 'text-red-400'
            this.uploads[uploadIndex].error_message =
              error.code === 'storage/unauthorized'
                ? 'Upload failed. File should not exceed 10Mb'
                : ''
            console.log(error)
          },
          //when upload is a success:
          async () => {
            const song = {
              uid: auth.currentUser.uid,
              display_name: auth.currentUser.displayName,
              original_name: task.snapshot.ref.name,
              modified_name: task.snapshot.ref.name,
              genre: '',
              comment_count: 0
            }
            song.url = await task.snapshot.ref.getDownloadURL()

            const songRef = await songsCollection.add(song)
            const songSnapshot = await songRef.get()

            this.addSong(songSnapshot)

            this.uploads[uploadIndex].variant = 'bg-green-400'
            this.uploads[uploadIndex].icon = 'fas fa-check'
            this.uploads[uploadIndex].text_class = 'text-green-400'
          }
        )
      })
    },
    cancelUploads() {
      this.uploads.forEach((upload) => {
        upload.task.cancel()
      })
    }
  },
  beforeUnmount() {
    this.uploads.forEach((upload) => {
      upload.task.cancel()
    })
  }
}
</script>
