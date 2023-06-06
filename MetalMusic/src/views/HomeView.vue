<template>
  <!-- Introduction -->
  <section class="container mx-auto flex flex-wrap justify-between items-center max-h-screen">
    <div class="w-2/5 text-white text-left">
      <p>Welcome to MetalHead forum!</p>
      <p>Here U can share/listen to new music & share your thoughts about it.</p>
    </div>
    <div class="w-3/5">
      <div class="w-full relative h-0 pb-[67%]">
        <video
          loop
          muted
          preload
          autoplay
          class="absolute h-auto w-full -top-10 right-0 z-5 max-h-screen"
        >
          <source src="/assets/video/panLeftRight.mp4" type="video/mp4" />
          <source src="/assets/video/panLeftRight.webm" type="video/webm" />
        </video>
      </div>
    </div>
  </section>

  <!-- Main Content -->
  <section class="container mx-auto">
    <div class="bg-transparent rounded border border-gray-200 relative flex flex-col">
      <div
        class="px-6 pt-6 pb-5 font-bold border-b border-gray-200"
        v-icon-secondary="{ icon: 'headphones-alt', right: true }"
      >
        <!-- (global directive option:) v-icon.right.yellow="'headphones-alt'" -->
        <span class="card-title">Songs</span>
        <!-- Icon from directive-->
      </div>
      <!-- Playlist -->
      <ol id="playlist">
        <home-song-item v-for="song in songs" :key="song.docID" :song="song" />
      </ol>
      <!-- .. end Playlist -->
    </div>
  </section>
</template>

<script>
import { songsCollection } from '@/includes/firebase'
import HomeSongItem from '@/components/HomeSongItem.vue'
//for local Icon directive option:
import IconSecondary from '@/directives/icon-secondary'

export default {
  name: 'HomeView',
  components: { HomeSongItem },
  directives: {
    'icon-secondary': IconSecondary
  },
  data() {
    return {
      songs: [],
      maxPerPage: 25,
      pendingRequest: false
    }
  },
  async created() {
    this.getSongs()
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      const { scrollTop, offsetHeight } = document.documentElement
      const { innerHeight } = window

      const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight
      if (bottomOfWindow) {
        this.getSongs()
      }
    },
    async getSongs() {
      if (this.pendingRequest) {
        return
      }
      this.pendingRequest = true
      let snapshots
      if (this.songs.length) {
        const lastDoc = await songsCollection.doc(this.songs[this.songs.length - 1].docID).get()
        snapshots = await songsCollection
          .orderBy('modified_name')
          .startAfter(lastDoc)
          .limit(this.maxPerPage)
          .get()
      } else {
        snapshots = await songsCollection.orderBy('modified_name').limit(this.maxPerPage).get()
      }

      snapshots.forEach((document) => {
        this.songs.push({
          docID: document.id,
          ...document.data()
        })
      })
      this.pendingRequest = false
    }
  }
}
</script>

<style scoped>
/* .video_wrap {
  width: 100%;
  margin: 0 auto;
  position: relative;
  height: 0;
  padding-bottom: 150%;
}*/
/* 16:9 = 56.25%*/

/*video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 5;
}*/
</style>
