<script setup>
import { storeToRefs } from 'pinia'
import { useStatusStore } from '../store/status'

// Get status
const { showHelp } = storeToRefs(useStatusStore())
</script>

<template>
  <div
    v-if="showHelp" 
    class="backdrop-brightness-50 flex fixed items-center justify-center h-full left-0 select-none top-0 w-full z-40"
  >
    <div class="bg-white p-4 rounded-xl">
      <!-- Title -->
      <h1 class="font-bold text-2xl text-center">Help</h1>
      <hr class="border border-dashed border-gray-300 my-2"/>

      <!-- Contents -->
      <h2>Hotkeys</h2>
      <h3>Cruising</h3>
      <p><span class="key">C</span>Toggle cruising</p>
      <p><span class="key">V</span>Speed up cruising</p>
      <p><span class="key">X</span>Speed down cruising</p>
      <h3>Notification</h3>
      <p><span class="key">S</span>Silent notification</p>
      <p><span class="key">D</span>Show notification</p>
      <h3>Help</h3>
      <p><span class="key">Q</span>Toggle help</p>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.key {
  @apply border-2 border-black border-solid font-bold inline-block m-1 px-4 rounded-md
}

h2 {
  @apply font-bold text-xl
}

h2::before {
  content: '§ '
}

h3 {
  @apply font-bold text-lg
}
</style>
