<script setup>
import { ref, watch, onMounted } from 'vue'
import _ from 'lodash'
import { useContestStore } from '../store/contest'
import cruise from '../api/cruise'

// Components
import StatusTagVue from './StatusTag.vue'

// Properties
const props = defineProps({
  key: String,
  rank: Number,
  name: String,
  school: String,
  solved: Number,
  penalty: Number,
  change: String,
  status: Array
})

// Stores
const contest = useContestStore()

// Reactive
const element = ref(null)
const localStatus = ref(props.status)
const shadowClass = ref([])

// Asynchronize function
const resetShadow = ()=>{
  setTimeout(()=>{
    shadowClass.value = []
  }, 2000)
}
const delay = (tick)=>{
  return new Promise((resolve)=>{
    setTimeout(resolve, tick)
  })
}

// Actions
const setShadow = ()=>{
  switch (props.change) {
    case 'up':
      shadowClass.value = ['up']
      resetShadow()
      break
    case 'down':
      shadowClass.value = ['down']
      resetShadow()
      break
    default:
      shadowClass.value = []
  }
}
const focus = ()=>{
  const rect = element.value.getBoundingClientRect()
  cruise.stop(true)
  scrollTo(0, scrollY + rect.top + (rect.height - innerHeight) / 2)
}

// Watch
watch(()=>props.rank, setShadow)
watch(
  ()=>contest.lastFocus,
  ()=>{
    if (contest.focusKey === props.key) {
      // Focus
      focus()

      // Animate
      new Promise(async (resolve)=>{
        for (let i = 0; i < 4; ++i) {
          localStatus.value = contest.focusStatus
          await delay(300)
          localStatus.value = props.status
          await delay(300)
        }
        localStatus.value = contest.focusStatus
        await delay(300)

        contest.update()
        localStatus.value = props.status
        cruise.start(cruise.getSpeed(), true)
        contest.focusKey = null
        resolve()
      })
    }
  }
)

// Live cycle
onMounted(setShadow)
</script>

<template>
  <div 
    class="bg-gray-700 duration-300 flex items-center m-4 p-4 relative rounded-md transition-shadow print:break-inside-avoid"
    :class="shadowClass"
    ref="element"
  >
    <!-- Focus light -->
    <template v-if="contest.focusKey === key">
      <div class="ping-dot animate-ping"></div>
      <div class="ping-dot"></div>
    </template>

    <!-- Rank & user info -->
    <div class="flex items-center w-1/6">
      <div class="font-bold font-mono text-zinc-100 w-1/3">#{{ rank }}</div>
      <div class="flex flex-col text-center text-white w-2/3">
        <div class="font-bold">{{ name }}</div>
        <div class="text-sm text-gray-400">{{ school }}</div>
      </div>
    </div>

    <!-- Status tags -->
    <div class="flex flex-wrap select-none w-2/3">
      <status-tag-vue 
        v-for="i in localStatus" 
        :key="i.problemId" 
        :result="i.result"
        :tries="i.tries"
        :penalty="i.penalty"
        :frozen-tries="i.frozenTries"
      />
    </div>

    <!-- Total solved & penalty -->
    <div class="font-bold text-center text-white w-1/12">{{ solved }}</div>
    <div class="font-bold text-center text-white w-1/12">{{ penalty }}</div>
  </div>
</template>

<style lang="postcss" scoped>
.down {
  @apply shadow-md shadow-red-400
}

.up {
  @apply shadow-md shadow-green-400
}

.ping-dot {
  @apply absolute bg-green-400 h-3 left-2 rounded-full top-2 w-3
}
</style>
