<template>
  <div
    class="mt-10 h-96 w-full text-white border-red-500 border-solid border-2"
    ref="canvasContainer"
  >
    <button @click.prevent="handleUserAction">Start/Load Audio (Howler context)</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Howler, Howl } from 'howler'
import p5 from 'p5'
import usePlayerStore from '@/stores/player'
import { storeToRefs } from 'pinia'
import testSong from '@/assets/stomper_reggae_bit.mp3'

const playerStore = usePlayerStore()
const { current_song, sound } = storeToRefs(playerStore)
const { loadSong, playSong } = playerStore

// references
const canvasContainer = ref(null)
const p5Instance = ref(null)
let fft = null
const soundLoaded = ref(false)
let sound2
let sourceNode

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
    if (soundLoaded.value && fft) {
      console.log('Drawing spectrum because we have FFT')
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
  loadSong()
  window.p5 = p5
  await import('p5/lib/addons/p5.sound')

  // Create a p5 sketch WITHOUT using preload for audio
  p5Instance.value = new p5(Sketch, canvasContainer.value)
})

async function handleUserAction() {
  console.log('User clicked button')
  if (!p5Instance.value) {
    console.log('No p5 instance found so returning')
    return
  }

  if (!soundLoaded.value) {
    // Use p5’s loadSound inside the user gesture, passing local MP3
    sound2 = p5Instance.value.loadSound(
      current_song.value.url,
      () => {
        console.log('Sound finished loading')
        soundLoaded.value = true
        // Connect it to FFT
        fft.setInput(sound2)
        // Auto-play once loaded
        sound2.play()
      },
      (err) => {
        console.error('Error loading sound:', err)
      }
    )
  }

  /*  const audioCtx = p5Instance.value.getAudioContext()
  // Resume the context first
  await audioCtx.resume()
  console.log('AudioContext resumed')

  // If sound is NOT yet loaded, load it now
  if (!soundLoaded.value) {
    await loadSong()
    await playSong()
    soundLoaded.value = true
  }
  // Ensure Howler context is initialized
  if (!Howler.ctx) {
    Howler.ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  p5.soundOut.audiocontext = Howler.ctx

  // Create a source node from the Howler sound
  if (!sourceNode) {
    sourceNode = Howler.ctx.createMediaElementSource(sound.value._sounds[0]._node)
    sourceNode.connect(Howler.ctx.destination)
  }
  // Connect the source node to the p5 FFT
  try {
    fft.setInput(sourceNode)
    console.log('Connected Howler node to p5.FFT')
  } catch (error) {
    console.error('Error connecting to FFT:', error)
  }
  // Play or pause the sound
  if (!sound.value.playing()) {
    sound.value.play()
  } else {
    sound.value.pause()
  } */
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
