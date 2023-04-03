<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContestStore } from '../store/contest'

// Components
import CompetitorRowVue from '../components/CompetitorRow.vue'

// Router
const router = useRouter()

// Stores
const contest = useContestStore()

// Reactive
const exception = ref(null)

// Functions
const onKeyUp = async (e)=>{
  switch (e.code) {
    case 'Escape':
      router.push('/')
      break
    case 'KeyE':
      router.push('/settings')
      break
    case 'KeyF': {
      contest.rank = null
      const res = await contest.startLoop(true)
      if (res.code !== 0)
        exception.value = res.msg
      break
    }
    case 'KeyT': {
      contest.rank = null
      const res = await contest.testLoop(new Date('2022-12-07 18:00:00'))
      if (res.code !== 0)
        exception.value = res.msg
      break
    }
  }
}

// Life cycle
onMounted(async ()=>{
  document.addEventListener('keyup', onKeyUp)

  const res = await contest.startLoop()
  if (res.code !== 0)
    exception.value = res.msg
})
onBeforeUnmount(()=>{
  document.removeEventListener('keyup', onKeyUp)
})
</script>

<template>
  <!-- Title -->
  <div class="my-10">
    <div class="font-bold text-3xl text-center text-white">{{ contest.title }}</div>
    <div class="font-mono my-4 text-center text-white">{{ contest.startTime }} ~ {{ contest.endTime }}</div>
  </div>

  <!-- Header -->
  <a id="rank-top"/>
  <div class="bg-gray-800 flex items-center px-8 py-4 sticky top-0 z-10 print:relative">
    <div class="flex w-1/6">
      <div class="font-bold text-white w-1/3">Rank</div>
      <div class="font-bold text-center text-white w-2/3">Competitor</div>
    </div>
    <div class="font-bold text-center text-white w-2/3">Status</div>
    <div class="font-bold text-center text-white w-1/12">Solved</div>
    <div class="font-bold text-center text-white w-1/12">Panelty</div>
  </div>

  <!-- Competitors -->
  <transition-group v-if="contest.filteredRank !== null" name="competitors">
    <competitor-row-vue
      v-for="i in contest.filteredRank" 
      :key="i.id"
      :rank="i.rank"
      :name="i.name"
      :school="i.school"
      :solved="i.solved"
      :penalty="i.penalty"
      :change="i.change"
      :status="i.status"
    />
  </transition-group>
  <div v-else-if="exception === null" class="msg">
    <div class="spin"/>
    <div>Loading</div>
  </div>
  <div v-else class="warn">[Error] {{ exception }}</div>
</template>

<style lang="postcss" scoped>
.competitors-move,
.competitors-enter-active,
.competitors-leave-active {
  transition: all 1s ease;
}

.competitors-enter-from,
.competitors-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.competitors-leave-active {
  position: absolute;
}

.msg {
  @apply flex font-bold items-center justify-center 
          my-20 text-3xl text-center text-white
}

.warn {
  @apply flex font-bold items-center justify-center 
          my-20 text-3xl text-center text-red-500
}

.spin {
  @apply animate-spin border-4 border-b-white border-l-white 
          border-r-white border-t-transparent h-8 mx-8 rounded-full text-3xl w-8
}
</style>
