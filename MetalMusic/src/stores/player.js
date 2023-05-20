import { defineStore } from 'pinia'
import { Howl } from 'howler'

export default defineStore('player', {
  state: () => ({
    current_song: {},
    sound: {}
  }),
  actions: {
    async newSong(song) {
      this.current_song = song

      this.sound = new Howl({
        src: [song.url],
        html5: true
      })
      this.sound.play()
    },
    async toggleAudio() {
      //checking if 'playing'object is available on Howl object:
      if (!this.sound.playing) {
        return
      }
      this.sound.playing() ? this.sound.pause() : this.sound.play()
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
