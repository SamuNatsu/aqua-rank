<script setup>
// Components
import StatusTagVue from './StatusTag.vue'

// Properties
defineProps({ info: Object })
</script>

<template>
  <div class="bg-gray-700 flex items-center m-4 p-4 rounded-md print:break-inside-avoid">
    <div class="flex w-1/6">
      <div class="font-bold font-mono text-zinc-100 w-1/3">#{{ info.rank }}</div>
      <div class="font-bold text-center text-white w-2/3">{{ info.userId }}</div>
    </div>
    <div class="flex flex-wrap w-2/3">
      <status-tag-vue v-for="i in info.status" :key="i.id" :status="i"/>
    </div>
    <div class="font-bold text-center text-white w-1/12">{{ info.totalSolved }}</div>
    <div class="font-bold text-center text-white w-1/12">{{ info.totalPenalty }}</div>
  </div>
</template>
