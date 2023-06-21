<template>
  <!-- Introduction -->
  <section
    class="container w-full mx-auto h-[180vh] flex flex-wrap justify-between items-end py-36 md:h-screen md:pt-0 md:mb-36"
  >
    <div class="w-2/6 relative self-center text-white text-left p-8 border-2 border-white heading">
      <div class="relative z-10">
        <p>Welcome to MetalHead community!</p>
        <p>Here U can share/listen to new music & share your thoughts about it.</p>
      </div>
    </div>
    <router-link
      to="#songs"
      class="w-14"
      :class="{ bounce: isJumping }"
      @click="isJumping = !isJumping"
    >
      <svg
        class="mx-auto"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.9983 19.3036C23.9983 19.2366 23.9648 19.1613 23.9146 19.111L23.4961 18.6925C23.4459 18.6423 23.3705 18.6088 23.3036 18.6088C23.2366 18.6088 23.1613 18.6423 23.111 18.6925L19.8214 21.9821L16.5318 18.6925C16.4816 18.6423 16.4063 18.6088 16.3393 18.6088C16.264 18.6088 16.197 18.6423 16.1468 18.6925L15.7282 19.111C15.678 19.1613 15.6445 19.2366 15.6445 19.3036C15.6445 19.3705 15.678 19.4459 15.7282 19.4961L19.6289 23.3968C19.6791 23.447 19.7545 23.4805 19.8214 23.4805C19.8884 23.4805 19.9637 23.447 20.014 23.3968L23.9146 19.4961C23.9648 19.4459 23.9983 19.3705 23.9983 19.3036Z"
          fill="white"
        />
        <circle opacity="1" cx="20" cy="20" r="19.5" stroke="white" />
      </svg>
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
        <div v-show="pendingRequest && !allSongsFetched" class="m-6 loader"></div>
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
      maxPerPage: 5,
      pendingRequest: false,
      isJumping: true,
      allSongsFetched: false
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
        if (snapshots.size === 0) {
          this.pendingRequest = true
          this.allSongsFetched = true
          return
        }
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
a:hover svg,
a:hover svg circle {
  stroke: #f59e0b;
}
/*text border: */
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
  /*name-duration-function(ease,eas-in,linear)-delay-count-direction */
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
/* three dots loader: */
.loader {
  width: 50px;
  aspect-ratio: 8/5;
  --_g: no-repeat radial-gradient(#000 68%, #0000 71%);
  -webkit-mask: var(--_g), var(--_g), var(--_g);
  -webkit-mask-size: 25% 40%;
  background: white;
  animation: load 2s infinite;
}

@keyframes load {
  0% {
    -webkit-mask-position: 0% 0%, 50% 0%, 100% 0%;
  }
  16.67% {
    -webkit-mask-position: 0% 100%, 50% 0%, 100% 0%;
  }
  33.33% {
    -webkit-mask-position: 0% 100%, 50% 100%, 100% 0%;
  }
  50% {
    -webkit-mask-position: 0% 100%, 50% 100%, 100% 100%;
  }
  66.67% {
    -webkit-mask-position: 0% 0%, 50% 100%, 100% 100%;
  }
  83.33% {
    -webkit-mask-position: 0% 0%, 50% 0%, 100% 100%;
  }
  100% {
    -webkit-mask-position: 0% 0%, 50% 0%, 100% 0%;
  }
}
</style>
