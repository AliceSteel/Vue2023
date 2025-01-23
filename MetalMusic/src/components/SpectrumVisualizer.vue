<template>
  <div
    class="mt-10 h-96 w-full text-white border-red-500 border-solid border-2"
    ref="canvasContainer"
  >
    <p>I am visualiser</p>

    <!-- Button for user gesture -->
    <button @click="handleUserAction">Start/Load Audio</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import p5 from 'p5'
// import usePlayerStore from '@/stores/player'
// import { storeToRefs } from 'pinia'
import testSong from '@/assets/stomper_reggae_bit.mp3'

// --- Optional store references (not used in this demo) ---
// const playerStore = usePlayerStore()
// const { current_song } = storeToRefs(playerStore)

// references
const canvasContainer = ref(null)
const p5Instance = ref(null)

// We'll store p5.FFT, the SoundFile, etc. in these variables
let fft = null
let sound = null

// Flag to let us know if sound is already loaded
let soundLoaded = false

// Dynamically load p5.sound
async function loadP5Sound() {
  // p5.sound requires p5 to be on the global
  window.p5 = p5
  await import('p5/lib/addons/p5.sound')
}

// A simple p5 sketch that doesn't do audio in preload()
const Sketch = (p) => {
  p.setup = () => {
    console.log('p5 setup called')
    p.createCanvas(p.windowWidth, p.windowHeight).parent(canvasContainer.value)
    p.background(0)

    // Create our FFT instance now, even if no sound is loaded yet
    fft = new p5.FFT()
  }

  p.draw = () => {
    p.background(0)

    // If we have a sound loaded, let’s visualize it
    if (soundLoaded && fft) {
      const spectrum = fft.analyze()
      for (let i = 0; i < spectrum.length; i++) {
        const g = p.map(spectrum[i], 0, 255, 255, 0)
        p.fill(spectrum[i], g, 0)
        const y = p.map(i, 0, spectrum.length, 0, p.height)
        const w = p.map(spectrum[i], 0, 255, 0, p.width)
        p.rect(0, y, w, p.height / spectrum.length)
      }
    } else {
      // Simple message before sound is loaded
      p.fill(255)
      p.textSize(32)
      p.text('Click button to load & start audio', 50, 50)
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}

onMounted(async () => {
  await loadP5Sound()
  console.log('onMounted -> p5 sound loaded (library)')

  // Create a p5 sketch WITHOUT using preload for audio
  p5Instance.value = new p5(Sketch, canvasContainer.value)
})

onUnmounted(() => {
  if (p5Instance.value) {
    p5Instance.value.remove()
  }
})

function handleUserAction() {
  console.log('User clicked button')
  if (!p5Instance.value) return

  const audioCtx = p5Instance.value.getAudioContext()
  // Resume the context first
  audioCtx.resume().then(() => {
    console.log('AudioContext resumed')

    // If sound is NOT yet loaded, load it now
    if (!soundLoaded) {
      // Use p5’s loadSound inside the user gesture, passing local MP3
      sound = p5Instance.value.loadSound(
        testSong,
        () => {
          console.log('Sound finished loading')
          soundLoaded = true
          // Connect it to FFT
          fft.setInput(sound)
          // Auto-play once loaded
          sound.play()
        },
        (err) => {
          console.error('Error loading sound:', err)
        }
      )
    } else {
      // If it’s already loaded, we can simply play/pause
      if (!sound.isPlaying()) {
        sound.play()
      } else {
        sound.pause()
      }
    }
  })
}
</script>

<style scoped>
canvas {
  display: block;
}
</style>
