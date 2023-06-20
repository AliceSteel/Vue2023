<template>
  <!-- Main Content -->
  <section class="container mx-auto py-36">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="upload" :addSong="addSong" />
      </div>
      <div class="col-span-2">
        <div class="bg-transparent rounded relative flex flex-col">
          <div class="px-3 py-6 font-bold border-b border-gray-200">
            <span class="card-title text-white">My Songs</span>
            <!--  <i class="fa fa-compact-disc text-green-400 text-2xl"></i>-->
          </div>
          <div>
            <!-- Composition Items -->
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

<script>
import AppUpload from '@/components/AppUpload.vue'
import SongItem from '@/components/SongItem.vue'
import { songsCollection, auth } from '@/includes/firebase'

export default {
  name: 'ManageView',
  components: {
    AppUpload,
    SongItem
  },
  data() {
    return {
      songs: [],
      unsavedFlag: false
    }
  },

  async created() {
    //to query firebase storage:
    const snapshot = await songsCollection.where('uid', '==', auth.currentUser.uid).get()
    snapshot.forEach(this.addSong)
  },
  methods: {
    updateSong(indx, values) {
      this.songs[indx].modified_name = values.modified_name
      this.songs[indx].genre = values.genre
    },
    removeSong(indx) {
      this.songs.splice(indx, 1)
    },
    addSong(document) {
      const song = {
        ...document.data(),
        docID: document.id
      }
      this.songs.push(song)
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value
    }
  },
  beforeRouteLeave(to, from, next) {
    if (!this.unsavedFlag) {
      next()
    } else {
      const leave = confirm('You have unsaved changes. Are you sure you want to leave?')
      next(leave)
    }
  }
}
</script>
