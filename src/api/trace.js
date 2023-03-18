/* Trace module */
import { useNotifyStore } from '../store/notify'

// Cruise system
const cruiseData = {
  handle: null,
  startTimestamp: null,
  previousTimestamp: null,
  speed: 100
}

const cruiseStart = (speed)=>{
  // Check handle
  if (cruiseData.handle !== null) {
    return
  }

  // Initialize
  const body = document.body
  const topAnchor = document.querySelector('#rank-top')
  cruiseData.speed = Math.max(20, speed)
  useNotifyStore().push('info', 'Start cruising')

  // Start cruising
  const step = (timestamp)=>{
    // Startup
    if (cruiseData.startTimestamp === null) {
      cruiseData.startTimestamp = timestamp
      cruiseData.previousTimestamp = timestamp
    }

    // Scrolling
    const elapsed = timestamp - cruiseData.previousTimestamp
    if (cruiseData.previousTimestamp !== timestamp) {
      scrollTo(0, scrollY + elapsed / 1000.0 * cruiseData.speed)
    }

    // If at bottom
    if (innerHeight + scrollY >= body.offsetHeight) {
      topAnchor.scrollIntoView(true)
    }

    // Next loop
    cruiseData.previousTimestamp = timestamp
    cruiseData.handle = requestAnimationFrame(step)
  }
  cruiseData.handle = requestAnimationFrame(step)
}

const cruiseStop = ()=>{
  // Check handle
  if (cruiseData.handle !== null) {
    useNotifyStore().push('info', 'Stop cruising')
    cancelAnimationFrame(cruiseData.handle)
    cruiseData.handle = null
    cruiseData.startTimestamp = null
    cruiseData.previousTimestamp = null
  }
}

const cruiseToggle = ()=>{
  // Check handle
  if (cruiseData.handle === null) {
    cruiseStart(cruiseData.speed)
  } else {
    cruiseStop()
  }
}

const cruiseSpeedUp = ()=>{
  // Check handle
  if (cruiseData.handle !== null) {
    cruiseData.speed += 20
    useNotifyStore().push('info', `Increase cruising speed to ${cruiseData.speed}`)
  }
}

const cruiseSpeedDown = ()=>{
  // Check handle 
  if (cruiseData.handle !== null) {
    cruiseData.speed -= 20
    if (cruiseData.speed < 20) {
      cruiseData.speed = 20
    }
    useNotifyStore().push('info', `Decrease cruising speed to ${cruiseData.speed}`)
  }
}

export { cruiseStart, cruiseStop, cruiseToggle, cruiseSpeedUp, cruiseSpeedDown }

