<script setup>
import { ref } from 'vue'
import { useContestStore } from '../store/contest'

// Components
import StatusTagVue from './StatusTag.vue'

// Properties
const props = defineProps({ info: Object })
/*
  For info object:
    rank: Number
    userId: String
    totalSolved: Number
    totalPenalty: Number
    status: Array
*/

// Stores
const contest = useContestStore()

// Reactive
const status = ref(props.info.status)

// Subscribe
contest.$subscribe((_, state)=>{
  // Competitor is focused
  if (state.focusUserId === props.info.userId) {
    // Delay function
    const delay = (ticks)=>new Promise((resolve)=>{
      setTimeout(()=>resolve(), ticks)
    })

    // Status patch
    const patched = props.info.status.map((v, idx)=>{
      return state.focusUpdate[idx] ?? v
    })

    // Asynchronize animation
    new Promise(async (resolve)=>{
      // Flash updated
      for (let i = 0; i < 4; ++i) {
        await delay(400)
        status.value = patched
        await delay(400)
        status.value = props.info.status
      }
      status.value = patched
      resolve()
    }).then(()=>{
      // Clean up
      contest.focusUserId = null
      contest.focusUpdate = null
    })
  }
})
</script>

<template>
  <div 
    :data-user-id="info.userId"
    class="bg-gray-700 flex items-center m-4 p-4 relative rounded-md print:break-inside-avoid"
  >
    <!-- Focus light -->
    <template v-if="contest.focusUserId === info.userId">
      <div class="absolute animate-ping bg-green-400 h-3 left-2 rounded-full top-2 w-3"></div>
      <div class="absolute bg-green-400 h-3 left-2 rounded-full top-2 w-3"></div>
    </template>

    <!-- Rank & user ID -->
    <div class="flex w-1/6">
      <div class="font-bold font-mono text-zinc-100 w-1/3">#{{ info.rank }}</div>
      <div class="font-bold text-center text-white w-2/3">{{ info.userId }}</div>
    </div>

    <!-- Status tags -->
    <div class="flex flex-wrap select-none w-2/3">
      <status-tag-vue 
        v-for="(i, idx) in status" 
        :key="i.id" 
        :index="idx" 
        :status="i"
      />
    </div>

    <!-- Total solved & penalty -->
    <div class="font-bold text-center text-white w-1/12">{{ info.totalSolved }}</div>
    <div class="font-bold text-center text-white w-1/12">{{ info.totalPenalty }}</div>
  </div>
</template>
