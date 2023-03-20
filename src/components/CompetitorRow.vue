<script setup>
import { reactive, ref, watch } from 'vue'
import { useContestStore } from '../store/contest'
import cruise from '../api/cruise'

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
    diff(optional): 'asc' | 'desc'
*/

// Stores
const contest = useContestStore()

// Reactive
const element = ref(null)
const status = ref(props.info.status)
const cruiseStatus = ref(cruise.getStatus())
const shadowClass = reactive({
  asc: false,
  desc: false
})

// Watch
watch(
  ()=>props.info,
  ()=>{
    status.value = props.info.status

    shadowClass.asc = shadowClass.desc = false
    if (props.info.diff === 'asc') {
      shadowClass.asc = true
    } else if (props.info.diff === 'desc') {
      shadowClass.desc = true
    }

    setTimeout(()=>{
      shadowClass.asc = shadowClass.desc = false
    }, 3000)
  }
)

// Actions
const delay = (ticks)=>new Promise((resolve)=>{
  setTimeout(()=>resolve(), ticks)
})
const focus = ()=>{
  const rect = element.value.getBoundingClientRect()
  cruiseStatus.value = cruise.getStatus()

  // Scroll to element
  cruise.stop(true)
  scrollTo(0, scrollY + rect.top + (rect.height - innerHeight) / 2)
}

// Subscribe state
contest.$subscribe((mutation, state)=>{
  // Competitor is focused
  if (mutation.type === 'patch object' && state.focusUserId === props.info.userId) {
    // Asynchronize animation
    new Promise(async (resolve)=>{
      // Focus on
      focus()

      // Flash updated
      for (let i = 0; i < 4; ++i) {
        await delay(400)
        status.value = state.focusUpdate
        await delay(400)
        status.value = props.info.status
      }
      status.value = state.focusUpdate

      resolve()
    }).then(()=>{
      // Clean up
      contest.focusUserId = null
      contest.focusUpdate = null

      // Restore cruising
      if (cruiseStatus.value) {
        cruise.start(cruise.getSpeed(), true)
      }

      // Generate new rank
      contest.genNewRank()
    })
  }
})
</script>

<template>
  <div 
    :data-user-id="info.userId"
    class="bg-gray-700 flex items-center m-4 p-4 relative rounded-md transition-shadow print:break-inside-avoid"
    :class="shadowClass"
    ref="element"
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
        v-for="i in status" 
        :key="i.id" 
        :status="i"
      />
    </div>

    <!-- Total solved & penalty -->
    <div class="font-bold text-center text-white w-1/12">{{ info.totalSolved }}</div>
    <div class="font-bold text-center text-white w-1/12">{{ info.totalPenalty }}</div>
  </div>
</template>

<style lang="postcss" scoped>
.asc {
  @apply shadow-md shadow-green-400
}

.desc {
  @apply shadow-md shadow-red-400
}
</style>
