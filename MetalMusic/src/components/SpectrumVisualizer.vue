<template>
  <!-- Spectrum visualizer -->
  <div class="relative">
    <div
      class="w-full absolute z-20 flex justify-center gap-5 transition-all duration-500 ease-out mt-10"
      :class="{ 'translate-y-60 mt-0': !isSoundPLaying }"
    >
      <h1 class="text-3xl font-bold text-white pt-3">
        {{ current_song.modified_name }}
      </h1>
      <button
        v-if="!isSoundPLaying"
        @click.prevent="handlePlay"
        type="button"
        class="h-14 w-14 text-3xl bg-white text-black rounded-full focus:outline-none"
      >
        <i v-show="!isLoading" class="fas fa-play"></i>
        <div v-show="isLoading" class="loader ml-1" style="--loader-bg: black">></div>
      </button>
      <button
        v-else
        @click.prevent="handlePause"
        type="button"
        class="h-14 w-14 text-3xl bg-white text-black rounded-full focus:outline-none"
      >
        <i class="fas fa-pause"></i>
      </button>
    </div>
    <div
      class="w-full h-[70vh]"
      ref="canvasContainer"
      :class="{ 'overflow-hidden': isSoundPLaying }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import p5 from 'p5'
import { usePlayerStore } from '@/stores/player'
import { storeToRefs } from 'pinia'

const playerStore = usePlayerStore()
const { current_song } = storeToRefs(playerStore)

const canvasContainer = ref(null)
const p5Instance = ref(null)
let fft = null
const soundLoaded = ref(false)
let sound
const isSoundPLaying = ref(false)
const isLoading = ref(false)

const Sketch = (p) => {
  p.setup = () => {
    const width = canvasContainer.value.clientWidth
    p.createCanvas(width, p.windowHeight * 0.7).parent(canvasContainer.value)
    p.background(0)

    // Create our FFT:
    fft = new p5.FFT()
  }

  p.draw = () => {
    p.background(0)

    if (soundLoaded.value && fft) {
      const spectrum = fft.analyze()
      const barWidth = p.width / spectrum.length
      for (let i = 0; i < spectrum.length; i++) {
        const amplitude = spectrum[i]
        // Map amplitude to a vertical height
        const barHeight = p.map(amplitude, 0, 255, 0, p.height)
        // Calculate an x-position for each bin
        const x = i * barWidth
        p.rect(x, p.height - barHeight, barWidth, barHeight)
      }
    }
  }
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}

onMounted(async () => {
  window.p5 = p5
  await import('p5/lib/addons/p5.sound')

  // Create a p5 sketch WITHOUT using preload for audio
  p5Instance.value = new p5(Sketch, canvasContainer.value)
})

async function handlePlay() {
  isLoading.value = true
  if (!p5Instance.value) {
    console.log('No p5 instance found so returning')
    return
  }

  if (!soundLoaded.value) {
    sound = p5Instance.value.loadSound(
      current_song.value.url,
      () => {
        soundLoaded.value = true
        // Connect it to FFT
        fft.setInput(sound)
        // Auto-play once loaded
        sound.play()
        isSoundPLaying.value = true
        isLoading.value = false
      },
      (err) => {
        console.error('Error loading sound:', err)
      }
    )
  } else {
    // If sound is already loaded, just play it
    sound.play()
    isSoundPLaying.value = true
    isLoading.value = false
  }
}
const handlePause = () => {
  sound.pause()
  isSoundPLaying.value = false
}
onUnmounted(() => {
  if (p5Instance.value) {
    p5Instance.value.remove()
  }
})
</script>

<style scoped>
canvas {
  display: block;
}
</style>
