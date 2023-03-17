<script setup>
import { ref } from 'vue'

import { fetchRank } from './api'

import CompetitorRowVue from './components/CompetitorRow.vue'

const rank = ref([])

fetchRank().then((data)=>{
  rank.value = data
  console.log(data)
})

</script>

<template>
  <competitor-row-vue v-for="i in rank" :key="i.rank" :info="i"/>
</template>
