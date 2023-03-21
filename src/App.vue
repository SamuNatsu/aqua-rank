<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useContestStore } from './store/contest'

// Components
import CompetitorRowVue from './components/CompetitorRow.vue'
import HelpPageVue from './components/HelpPage.vue'
import NotifyListVue from './components/NotifyList.vue'

// Stores
const contest = useContestStore()
const { rank } = storeToRefs(contest)

// Reactive
const exception = ref(null)

// Asynchronize
contest
  .fetchInfo()
  .then(()=>{
    return contest.fetchSubmissions(0)
  })
  .then((data)=>{
    const patch = contest.genRawStatusPatch(data)
    contest.patchRawStatus(patch)
    contest.genNewRank()

    let timestamp = 20
    const step = ()=>{
      contest
        .fetchSubmissions(timestamp)
        .then((data)=>{
          const patch = contest.genRawStatusPatch(data)
          //contest.patchRawStatus(patch)
          contest.autoFocus(patch)

          timestamp += 20
          setTimeout(step, 5000)
        })
    }
    setTimeout(step, 5000)
  })
  .catch((err)=>{
    console.log(err)
    exception.value = err.message
  })
</script>

<template>
  <!-- Notify -->
  <notify-list-vue/>

  <!-- Help page -->
  <help-page-vue/>

  <!-- Title -->
  <div class="my-10">
    <div class="font-bold text-3xl text-center text-white">{{ contest.getName }}</div>
    <div class="font-mono my-4 text-center text-white">{{ contest.getSpan }}</div>
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
  <transition-group v-if="rank !== null" name="competitors">
    <competitor-row-vue
      v-for="i in rank" 
      :key="i.userId"
      :rank="i.rank"
      :user-id="i.userId"
      :solved="i.solved"
      :penalty="i.penalty"
      :change="i.change"
      :status="i.status"
      :info="i"
    />
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
