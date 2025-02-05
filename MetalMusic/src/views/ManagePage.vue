<template>
  <section class="container mx-auto py-36">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="upload" :addSong="addSong" />
      </div>
      <div class="col-span-2">
        <div class="bg-transparent rounded relative flex flex-col">
          <div class="px-3 py-5 font-semibold border-b border-gray-200 flex items-center gap-2">
            <span class="card-title text-white">My Songs</span>
            <i class="fa fa-compact-disc text-green-400 text-2xl"></i>
          </div>
          <div>
            <song-item
              v-for="(song, i) in songs"
              :key="song.docID"
              :song="song"
              :updateSong="updateSong"
              :indx="i"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppUpload from '@/components/AppUpload.vue'
import SongItem from '@/components/SongItem.vue'
import { songsCollection, auth } from '@/includes/firebase'

const songs = ref([])
const unsavedFlag = ref(false)

function addSong(document) {
  const song = {
    ...document.data(),
    docID: document.id
  }
  songs.value.push(song)
}

function updateSong(indx, values) {
  songs.value[indx].modified_name = values.modified_name
  songs.value[indx].genre = values.genre
}

function removeSong(indx) {
  songs.value.splice(indx, 1)
}

function updateUnsavedFlag(value) {
  unsavedFlag.value = value
}

const router = useRouter()

router.beforeEach((to, from, next) => {
  if (!unsavedFlag.value) {
    next()
  } else {
    const leave = confirm('You have unsaved changes. Are you sure you want to leave?')
    next(leave)
  }
})
onMounted(async () => {
  const snapshot = await songsCollection.where('uid', '==', auth.currentUser.uid).get()
  snapshot.forEach(addSong)
})
onMounted(async () => {
  const snapshot = await songsCollection.where('uid', '==', auth.currentUser.uid).get()
  snapshot.forEach(addSong)
})
</script>
