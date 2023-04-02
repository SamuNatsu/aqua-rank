/* Trace module */

const data = {
  handle: null,
  startTimestamp: null,
  previousTimestamp: null,
  speed: 100,
  mode: 0,
  direction: 1
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
      scrollTo(0, scrollY + elapsed / 1000.0 * data.speed * data.direction)
    }

    // If at edge
    if (data.mode === 0) {
      if (innerHeight + scrollY >= body.offsetHeight) {
        topAnchor.scrollIntoView(true)
      }
    } else {
      if (innerHeight + scrollY >= body.offsetHeight) {
        scrollTo(0, body.offsetHeight - innerHeight - 1)
        data.direction = -1
      } else if (topAnchor.getBoundingClientRect().top > 0) {
        data.direction = 1
      }
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
  }
}

const speedDown = ()=>{
  // Check handle 
  if (data.handle !== null) {
    data.speed -= 20
    if (data.speed < 20) {
      data.speed = 20
    }
  }
}

const toggleMode = ()=>{
  if (data.mode === 0)
    data.mode = 1
  else
    data.mode = 0
  data.direction = 1
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
  toggleMode,
  getStatus,
  getSpeed
}

export default cruise
