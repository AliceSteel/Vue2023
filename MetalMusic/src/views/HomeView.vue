<template>
  <!-- Introduction -->
  <section
    class="container mx-auto h-0 pb-[67%] flex flex-wrap justify-between items-end max-h-screen"
  >
    <div class="w-2/5 text-white text-left">
      <p>Welcome to MetalHead forum!</p>
      <p>Here U can share/listen to new music & share your thoughts about it.</p>
    </div>
    <div class="w-3/5">
      <div class="relative w-2/3 h-0 pb-[67%] float-right animation_wrap">
        <img
          class="absolute z-5 top-0 right-0"
          src="/assets/img/guitarZombie.png"
          alt="Zombie playing guitar"
        />
      </div>
    </div>
  </section>

  <section class="container mx-auto pb-8">
    <div class="bg-transparent rounded border border-gray-200 relative flex flex-col">
      <div
        class="px-6 pt-6 pb-5 font-bold border-b border-white-200"
        v-icon-secondary="{ icon: 'headphones-alt', right: true }"
      >
        <!-- (global directive option:) v-icon.right.yellow="'headphones-alt'" -->
        <span class="card-title text-teal-400">Songs</span>
        <!-- Icon from directive-->
      </div>
      <!-- Playlist -->
      <ol id="playlist">
        <home-song-item v-for="song in songs" :key="song.docID" :song="song" />
      </ol>
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
.animation_wrap {
  /* width: 450px;
  height: 800px;*/
  transform: rotateY(0deg) rotateX(0deg) scale(0.5);
  transform-style: preserve-3d;
  animation: 10s flipme linear infinite;
  transition: transform 300ms ease;
  transform-origin: 50% 50%;
}

.animation_wrap:hover {
  transform: rotateY(30deg) rotateX(5deg);
}

@keyframes flipme {
  0% {
    transform: rotateY(-30deg) rotateX(0deg);
  }
  50% {
    transform: rotateY(0deg) rotateX(10deg);
  }
  100% {
    transform: rotateY(-30deg) rotateX(0deg);
  }
}
</style>
