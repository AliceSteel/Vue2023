import { defineStore } from 'pinia'
import { Howl, Howler } from 'howler'
import helper from '@/includes/helper'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    current_song: {},
    sound: {},
    seek: '00:00',
    duration: '00:00',
    playerProgress: '0%'
  }),
  actions: {
    async loadSong() {
      try {
        if (this.sound instanceof Howl) {
          this.sound.unload()
        }

        this.sound = new Howl({
          src: [this.current_song.url],
          html5: true,
          crossOrigin: 'anonymous'
        })

        await new Promise((resolve, reject) => {
          this.sound.once('load', () => {
            resolve()
          })
          this.sound.once('loaderror', (id, error) => {
            reject(error)
          })
        })
      } catch (error) {
        console.error('Error loading or playing the song:', error)
      }
    },
    async playSong() {
      try {
        if (!(this.sound instanceof Howl)) {
          console.error('No sound loaded')
          return
        }

        // Resume the Howler AudioContext before playing the song
        if (Howler.ctx.state === 'suspended') {
          await Howler.ctx.resume()
        }

        this.sound.play()
        this.sound.on('play', () => {
          requestAnimationFrame(this.progress)
        })
      } catch (error) {
        console.error('Error playing the song:', error)
      }
    },

    async toggleAudio() {
      //checking if 'playing'object is available on Howl object:
      if (!this.sound.playing) {
        return
      }
      this.sound.playing() ? this.sound.pause() : this.sound.play()
    },
    progress() {
      this.seek = helper.formatTime(this.sound.seek())
      this.duration = helper.formatTime(this.sound.duration())
      this.playerProgress = `${(this.sound.seek() / this.sound.duration()) * 100}%`

      if (this.sound.playing()) {
        requestAnimationFrame(this.progress)
      }
    },
    updateSeek(event) {
      if (!this.sound.playing) {
        return
      }
      //to calculate the position we need audio to move:
      const { x, width } = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - x
      const perc = clickX / width
      const seconds = this.sound.duration() * perc

      this.sound.seek(seconds)
      this.sound.once('seek', this.progress)
    }
  },
  getters: {
    playing: (state) => {
      if (state.sound.playing) {
        return state.sound.playing()
      }
      return false
    }
  }
})
