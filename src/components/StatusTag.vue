<script setup>
defineProps({ status: Object })
/*
  For status object:
    result: 0=>no submit, 1=>accept, 2=>wrong answer, 3=>fronzen tries, 4=>first blood
    penalty: Used in result 1 & 4
    tried: Used in result 1, 2 & 4
    beforeTried: Used in result 3
    afterTried: Used in result 3
*/
</script>

<template>
  <div v-if="status.result === 0" class="tag bg-black">&emsp;</div>
  <div v-else-if="status.result === 1" class="tag bg-green-600">{{ status.tried }}/{{ status.penalty }}</div>
  <div v-else-if="status.result === 2" class="tag bg-red-500">{{ status.tried }}</div>
  <div v-else-if="status.result === 3" class="tag bg-gray-500">{{ status.beforeTried }}+{{ status.afterTried }}</div>
  <div v-else-if="status.result === 4" class="tag bg-blue-600">{{ status.tried }}/{{ status.penalty }}</div>
</template>

<style lang="postcss" scoped>
.tag {
  @apply mx-2 my-1 py-1 rounded text-center text-white w-20
}
</style>
