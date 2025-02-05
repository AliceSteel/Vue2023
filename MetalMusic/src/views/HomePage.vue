<template>
  <section
    class="container w-full mx-auto h-[180vh] flex flex-wrap justify-between items-center py-36 md:h-screen md:pt-0 md:mb-36"
  >
    <div class="w-2/6 relative text-white text-left p-8 border-2 border-white heading">
      <div class="relative z-10">
        <div v-if="!userStore.userLoggedIn">
          <p>Welcome to TuneThread forum!</p>
          <p>Here you can upload your music after login.</p>
        </div>

        <div v-else>
          <p>Now you're logged in!</p>
          <p>
            You can upload your music
            <router-link
              to="/manage-music"
              title="Music Upload"
              class="underline-offset-1 underline"
              >here</router-link
            >
            <br />
            or browse and review music below..
          </p>
        </div>
      </div>
    </div>
    <router-link
      :to="bouncingAnchor"
      class="w-14 h-14 border-white border-2 rounded-full flex justify-center items-center gap-1 cursor-pointer border-solid"
      :class="{ bounce: isJumping }"
      @click="isJumping = !isJumping"
    >
      <div
        class="h-2 w-2 border-r-2 border-t-2 border-white"
        :class="userStore.userLoggedIn ? 'rotate-[135deg]' : '-rotate-45'"
      />
    </router-link>
    <div class="h-0 pb-[160%] w-full md:w-2/5 md:pb-[48%]">
      <div class="relative w-full float-right animation_wrap">
        <img
          class="absolute z-5 top-0 right-0"
          src="/assets/img/guitarZombie.png"
          alt="Zombie playing guitar"
        />
      </div>
    </div>
  </section>

  <section id="songs" class="container mx-auto pb-8">
    <div class="bg-transparent rounded border border-gray-200 relative flex flex-col">
      <div class="px-6 pt-6 pb-5 font-bold border-b border-white-200">
        <span class="card-title text-teal-400">Songs</span>
      </div>
      <!-- Playlist -->
      <ol id="playlist">
        <home-song-item v-for="song in songs" :key="song.docID" :song="song" />
        <div v-show="pendingRequest && !allSongsFetched" class="m-6 loader"></div>
      </ol>
    </div>
  </section>
</template>

<script setup>
import { songsCollection } from '@/includes/firebase'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HomeSongItem from '@/components/HomeSongItem.vue'
import { useUserStore } from '@/stores/user'

const songs = ref([])
const maxPerPage = ref(5)
const pendingRequest = ref(false)
const isJumping = ref(true)
const allSongsFetched = ref(false)
const userStore = useUserStore()
const bouncingAnchor = ref({})

function handleScroll() {
  const { scrollTop, offsetHeight } = document.documentElement
  const { innerHeight } = window

  const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight
  if (bottomOfWindow) {
    getSongs()
  }
}
async function getSongs() {
  if (pendingRequest.value) {
    return
  }
  pendingRequest.value = true

  let snapshots
  if (songs.value.length) {
    // Fetch the last doc as a starting point
    const lastDoc = await songsCollection.doc(songs.value[songs.value.length - 1].docID).get()
    snapshots = await songsCollection
      .orderBy('modified_name')
      .startAfter(lastDoc)
      .limit(maxPerPage.value)
      .get()

    if (snapshots.size === 0) {
      pendingRequest.value = true
      allSongsFetched.value = true
      return
    }
  } else {
    // Initial load
    snapshots = await songsCollection.orderBy('modified_name').limit(maxPerPage.value).get()
  }

  snapshots.forEach((document) => {
    songs.value.push({
      docID: document.id,
      ...document.data()
    })
  })

  pendingRequest.value = false
}

onMounted(() => {
  getSongs()
  window.addEventListener('scroll', handleScroll)
  userStore.userLoggedIn
    ? (bouncingAnchor.value = { name: 'home', hash: '#songs' })
    : (bouncingAnchor.value = { name: 'home', hash: '#header' })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
a:hover svg,
a:hover svg circle {
  stroke: #f59e0b;
}
.heading::before,
.heading::after {
  content: '';
  display: block;
  position: absolute;
  background: #000;
}

.heading::before {
  top: -0.5rem;
  bottom: -0.5rem;
  left: 1rem;
  right: 1rem;
}

.heading::after {
  left: -0.3em;
  right: -0.3em;
  top: 1em;
  bottom: 1em;
}

.bounce {
  animation: jump 0.7s ease 2s infinite alternate;
}

.bounce:hover,
a.bounce:visited {
  animation: none;
}

.animation_wrap {
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

@keyframes jump {
  0% {
    -webkit-transform: scale(1.1, 0.9);
    transform: scale(1.1, 0.9);
  }
  50% {
    -webkit-transform: scale(0.9, 1.1) translateY(-0.5rem);
  }
  70% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
