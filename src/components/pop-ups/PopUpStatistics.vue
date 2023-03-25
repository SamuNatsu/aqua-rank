<script setup>
import { computed } from 'vue'
import _ from 'lodash'
import { useContestStore } from '../../store/contest'

// Components
import PopUpContainerVue from './PopUpContainer.vue'

// Stores
const contest = useContestStore()

// Computed
const statistics = computed(()=>{
  const list = new Array(contest.info.problems).fill(0)
  const ret = {
    total: _.cloneDeep(list),
    accepted: _.cloneDeep(list),
    wrongAnswer: _.cloneDeep(list)
  }

  contest.rank.forEach((competitor)=>{
    competitor.status.forEach((problem, index)=>{
      if (problem.result === 'none') {
        return
      }

      ret.total[index]++
      if (['first_blood', 'accepted'].includes(problem.result)) {
        ret.accepted[index]++
      } else {
        ret.wrongAnswer[index]++
      }
    })
  })

  return ret
})
</script>

<template>
  <pop-up-container-vue id="statistics" title="Statistics">
    <table>
      <tr>
        <th></th>
        <th v-for="i in contest.info.problems" class="w-16">{{ String.fromCharCode(i + 64) }}</th>
      </tr>
      <tr class="bg-blue-50">
        <td class="font-bold">Total</td>
        <td v-for="i in statistics.total">{{ i }}</td>
      </tr>
      <tr class="bg-green-50">
        <td class="font-bold">Accepted</td>
        <td v-for="i in statistics.accepted">{{ i }}</td>
      </tr>
      <tr class="bg-red-50">
        <td class="font-bold">Wrong Answer</td>
        <td v-for="i in statistics.wrongAnswer">{{ i }}</td>
      </tr>
    </table>
  </pop-up-container-vue>
</template>

<style lang="postcss" scoped>
td, th {
  @apply border border-gray-300 p-2 text-center
}
</style>
