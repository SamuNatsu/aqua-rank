<script setup>
import { useStatusStore } from '../../store/status'

// Stores
const status = useStatusStore()

// Properties
defineProps({
  id: String,
  title: String
})
</script>

<template>
  <div
    v-if="status.popUp === id"
    class="backdrop-brightness-50 flex fixed items-center justify-center h-full left-0 select-none top-0 w-full z-40"
  >
    <div class="bg-white p-4 rounded-xl">
      <!-- Title -->
      <h1 class="font-bold text-2xl text-center">{{ title }}</h1>
      <hr class="border border-dashed border-gray-300 my-2"/>

      <!-- Contents -->
      <slot/>
    </div>
  </div>
</template>
