<script setup>
import { computed } from 'vue'

// Properties
const props = defineProps({
  radius: Number,
  progress: Number,
  stroke: Number
});

// Constants
const normalizeRadius = props.radius - props.stroke * 2
const circumference = normalizeRadius * 2 * Math.PI

// Computed
const strokeDashoffset = computed(()=>{
  return circumference - props.progress / 100 * circumference
})
</script>

<template>
  <svg :width="radius * 2" :height="radius * 2">
    <circle
      stroke="white"
      fill="transparent"
      :style="{ strokeDashoffset }"
      :stroke-dasharray="circumference + ' ' + circumference"
      :stroke-width="stroke"
      :r="normalizeRadius"
      :cx="radius"
      :cy="radius"
    />
  </svg>
</template>

<style scoped>
circle {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset .35s;
}
</style>
