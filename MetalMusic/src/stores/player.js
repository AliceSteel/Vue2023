import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    current_song: {},
    sound: {}
  })
})
