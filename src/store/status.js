/* Global status store */
import { defineStore } from 'pinia'

export const useStatusStore = defineStore('status', {
  state: ()=>({
    showHelp: false
  }),
  actions: {
    toggleHelp() {
      this.showHelp = !this.showHelp
    }
  }
})
