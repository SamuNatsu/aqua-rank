/* Hotkey module */
import cruise from './cruise'
import { useNotifyStore } from '../store/notify'
import { useStatusStore } from '../store/status'

const register = ()=>{
  document.addEventListener('keyup', (e)=>{
    switch (e.key) {
      // Cruising
      case 'c':
        cruise.toggle()
        break
      case 'v':
        cruise.speedUp()
        break
      case 'x':
        cruise.speedDown()
        break
      case 'z':
        cruise.toggleMode()
        break
      // Notification
      case 's':
        useNotifyStore().setSilent(true)
        break
      case 'd':
        useNotifyStore().setSilent(false)
        break
      // Help
      case 'q':
        useStatusStore().toggleHelp()
        break
    }
  }, false)
}

export { register }
