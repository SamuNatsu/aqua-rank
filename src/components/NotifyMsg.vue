<script setup>
import { computed, ref } from 'vue'
import { useNotifyStore } from '../store/notify'

// Components
import ProgressRingVue from './ProgressRing.vue'

// Images
import iconInfo from '../assets/img/info.svg'
import iconWarn from '../assets/img/warning.svg'
import iconError from '../assets/img/error.svg'

// Stores
const notify = useNotifyStore()

// Properties
const props = defineProps({
  type: String,
  msg: String
})

// Reactive
const progress = ref(0)

// Computed
const iconImg = computed(()=>{
  switch (props.type) {
    case 'info':
      return iconInfo
    case 'warn':
      return iconWarn
    case 'error':
      return iconError
    default:
      return ''
  }
})

// Animate
const step = ()=>{
  progress.value += 5

  if (progress.value < 100) {
    progress.value += 5
    setTimeout(step, 100)
  } else {
    progress.value = 100
    setTimeout(()=>notify.pop(), 400)
  }
}
setTimeout(step, 100)
</script>

<template>
  <div class="bg-indigo-900 flex justify-between mx-2 my-4 p-4 rounded-lg w-60">
    <div class="flex items-center justify-center relative w-6">
      <div class="absolute">
        <progress-ring-vue :radius="20" :progress="progress" :stroke="3"/>
      </div>
      <div>
        <img class="h-6 w-6" :class="[type]" :src="iconImg">
      </div>
    </div>
    <div class="text-white w-40">{{ msg }}</div>
  </div>
</template>

<style scoped>
.info {
  filter: invert(70%) sepia(55%) saturate(1415%) hue-rotate(186deg) brightness(110%) contrast(98%);
}

.warn {
  filter: invert(82%) sepia(68%) saturate(938%) hue-rotate(344deg) brightness(99%) contrast(98%);
}

.error {
  filter: invert(38%) sepia(34%) saturate(3295%) hue-rotate(335deg) brightness(95%) contrast(96%);
}
</style>
