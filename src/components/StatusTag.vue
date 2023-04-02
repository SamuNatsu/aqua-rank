<script setup>
import { computed } from 'vue'

// Properties
const props = defineProps({
  result: String,
  tries: Number,
  penalty: Number,
  frozenTries: Number
})

// Computed
const resultClass = computed(()=>{
  switch (props.result) {
    case 'none':
      return ['bg-black']
    case 'first_blood':
      return ['bg-blue-600']
    case 'accepted':
      return ['bg-green-600']
    case 'wrong_answer':
      return ['bg-red-500']
    case 'frozen':
      return ['bg-gray-500']
    case 'pending':
      return ['bg-yellow-500']
    default:
      return ['bg-white']
  }
})
const statusText = computed(()=>{
  switch (props.result) {
    case 'none':
      return '\u2003'
    case 'first_blood':
    case 'accepted':
      return props.tries + '/' + props.penalty
    case 'wrong_answer':
      return props.tries
    case 'frozen':
      return props.tries + '+' + props.frozenTries
    case 'pending':
      return props.tries
    default:
      return '\u2003'
  }
})
</script>

<template>
  <div class="mx-2 my-1 py-1 rounded text-center text-white w-20" :class="resultClass">
    {{ statusText }}
  </div>
</template>
