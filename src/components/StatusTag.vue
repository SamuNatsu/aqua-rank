<script setup>
defineProps({ status: Object })
/*
  For status object:
    result: 0=>no submission, 1=>accepted, 2=>wrong answer, 3=>fronzen tries, 4=>first blood
    penalty: Used in result 1 & 4
    tried: Used in result 1, 2 & 4
    beforeTried: Used in result 3
    afterTried: Used in result 3
*/
</script>

<template>
  <!-- No submission -->
  <div v-if="status.result === 0" class="tag bg-black">
    &emsp;
  </div>

  <!-- Accepted -->
  <div v-else-if="status.result === 1" class="tag bg-green-600">
    {{ status.tried }}/{{ status.penalty }}
  </div>

  <!-- Wrong answer -->
  <div v-else-if="status.result === 2" class="tag bg-red-500">
    {{ status.tried }}
  </div>

  <!-- Frozen tries -->
  <div v-else-if="status.result === 3" class="tag bg-gray-500">
    {{ status.beforeTried }}+{{ status.afterTried }}
  </div>

  <!-- First blood -->
  <div v-else-if="status.result === 4" class="tag bg-blue-600">
    {{ status.tried }}/{{ status.penalty }}
  </div>
</template>

<style lang="postcss" scoped>
.tag {
  @apply mx-2 my-1 py-1 rounded text-center text-white w-20
}
</style>
