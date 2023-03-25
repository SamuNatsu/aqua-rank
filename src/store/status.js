/* Global status store */
import { defineStore } from 'pinia'

export const useStatusStore = defineStore('status', {
  state: ()=>({
    popUp: null
  }),
  actions: {
    toggle(name) {
      if (this.popUp === null) {
        this.popUp = name
      } else if (this.popUp === name) {
        this.popUp = null
      }
    },
    toggleHelp() {
      this.toggle('help')
    },
    toggleStatistics() {
      this.toggle('statistics')
    },
    toggleFilter() {
      this.toggle('filter')
    }
  }
})
