<script setup>
import { ref } from 'vue'
import { fetchContestInfo, fetchRank } from './api'

// Components
import CompetitorRowVue from './components/CompetitorRow.vue'
import NotifyListVue from './components/NotifyList.vue'

// Reactive
const title = ref("")
const rank = ref(null)
const exception = ref(null)

// Asynchronize
fetchContestInfo()
  .then((data)=>{
    title.value = data.name
    document.title = data.name + ' | Aqua Rank'
  })
fetchRank()
  .then((data)=>{ rank.value = data })
  .catch((err)=>{
    console.log(err)
    exception.value = err.message
  })
</script>

<template>
  <!-- Notify -->
  <notify-list-vue/>

  <!-- Title -->
  <div class="font-bold my-10 text-3xl text-center text-white">{{ title }}</div>

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
  <transition-group v-if="rank !== null" name="competitors">
    <competitor-row-vue v-for="i in rank" :key="i.userId" :info="i"/>
  </transition-group>
  <div v-else-if="exception === null" class="msg">
    <div class="spin"/>
    <div>Loading</div>
  </div>
  <div v-else class="warn">Error: {{ exception }}</div>
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
