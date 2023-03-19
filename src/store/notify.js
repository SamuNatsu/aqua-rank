/* Notify store */
import { defineStore } from 'pinia'

export const useNotifyStore = defineStore('notify', {
  state: ()=>({
    queue: [],
    silent: false
  }),
  actions: {
    setSilent(b) {
      // Skip when no effect
      if (this.silent === b) {
        return
      }

      if (b) {
        this.flush()
        this.push('info', 'Silent notifications')
        this.silent = true
      } else {
        this.silent = false
        this.push('info', 'Show notifications')
      }
    },
    push(type, msg) {
      // Check silent
      if (this.silent) {
        return
      }

      // Check message type
      if (!['info', 'warn', 'error'].includes(type)) {
        this.queue.push({
          type: 'error',
          msg: `Invalid notify type: "${type}"`,
          timestamp: new Date().getTime()
        })
      } else {
        this.queue.push({
          type, 
          msg,
          timestamp: new Date().getTime()
        })
      }
    },
    pop() {
      this.queue.shift()
    },
    flush() {
      this.queue = []
    }
  },
  persist: {
    paths: ['silent']
  }
})
