<script setup>
// Components
import PopUpContainerVue from './PopUpContainer.vue'
</script>

<template>
  <pop-up-container-vue id="help" title="Help">
    <h2>Hotkeys</h2>
    <h3>Cruising</h3>
    <p><span class="key">C</span>Toggle cruising</p>
    <p><span class="key">V</span>Speed up cruising</p>
    <p><span class="key">X</span>Speed down cruising</p>
    <p><span class="key">Z</span>Switch cruising mode</p>
    <h3>Notification</h3>
    <p><span class="key">S</span>Silent notification</p>
    <p><span class="key">D</span>Show notification</p>
    <h3>Help</h3>
    <p><span class="key">Q</span>Toggle help</p>
  </pop-up-container-vue>
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
