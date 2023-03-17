<script setup>
import { computed } from 'vue'

import StatusTagVue from './StatusTag.vue'

const props = defineProps({ info: Object })

// Computed
const totalSolved = computed(()=>{
  return props.info.status.filter((v)=>v.result === 1 || v.result === 4).length
})
const totalPenalty = computed(()=>{
  let total = 0
  props.info.status
    .filter((v)=>v.result === 1 || v.result === 4)
    .forEach((v)=>total += v.penalty)
  return total
})
</script>

<template>
  <div class="bg-gray-700 flex items-center m-4 p-4 rounded-md">
    <div class="flex w-1/6">
      <div class="font-bold font-mono text-zinc-100 w-1/3">#{{ info.rank }}</div>
      <div class="font-bold text-center text-white w-2/3">{{ info.userId }}</div>
    </div>
    <div class="flex flex-wrap w-2/3">
      <status-tag-vue v-for="i in info.status" :key="i.id" :status="i"/>
    </div>
    <div class="font-bold text-center text-white w-1/12">{{ totalSolved }}</div>
    <div class="font-bold text-center text-white w-1/12">{{ totalPenalty }}</div>
  </div>
</template>
