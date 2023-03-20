/* Trace module */
import { useNotifyStore } from '../store/notify'

// Cruise system
const data = {
  handle: null,
  startTimestamp: null,
  previousTimestamp: null,
  speed: 100
}

const start = (speed, silent)=>{
  // Check handle
  if (data.handle !== null) {
    return
  }

  // Initialize
  const body = document.body
  const topAnchor = document.querySelector('#rank-top')
  data.speed = Math.max(20, speed)

  // Send notification
  if (silent !== true) {
    useNotifyStore().push('info', 'Start cruising')
  }

  // Start cruising
  const step = (timestamp)=>{
    // Startup
    if (data.startTimestamp === null) {
      data.startTimestamp = timestamp
      data.previousTimestamp = timestamp
    }

    // Scrolling
    const elapsed = timestamp - data.previousTimestamp
    if (data.previousTimestamp !== timestamp) {
      scrollTo(0, scrollY + elapsed / 1000.0 * data.speed)
    }

    // If at bottom
    if (innerHeight + scrollY >= body.offsetHeight) {
      topAnchor.scrollIntoView(true)
    }

    // Next loop
    data.previousTimestamp = timestamp
    data.handle = requestAnimationFrame(step)
  }
  data.handle = requestAnimationFrame(step)
}

const stop = (silent)=>{
  // Check handle
  if (data.handle !== null) {
    if (silent !== true) {
      useNotifyStore().push('info', 'Stop cruising')
    }

    cancelAnimationFrame(data.handle)
    data.handle = null
    data.startTimestamp = null
    data.previousTimestamp = null
  }
}

const toggle = (silent)=>{
  // Check handle
  if (data.handle === null) {
    start(data.speed, silent)
  } else {
    stop(silent)
  }
}

const speedUp = ()=>{
  // Check handle
  if (data.handle !== null) {
    data.speed += 20
    useNotifyStore().push('info', `Increase cruising speed to ${data.speed}`)
  }
}

const speedDown = ()=>{
  // Check handle 
  if (data.handle !== null) {
    data.speed -= 20
    if (data.speed < 20) {
      data.speed = 20
    }
    useNotifyStore().push('info', `Decrease cruising speed to ${data.speed}`)
  }
}

const getStatus = ()=>{
  return data.handle !== null
}

const getSpeed = ()=>{
  return data.speed
}

const cruise = {
  start,
  stop,
  toggle,
  speedUp,
  speedDown,
  getStatus,
  getSpeed
}

export default cruise