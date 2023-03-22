<script setup>
import { useNotifyStore } from '../store/notify'

// Components
import NotifyMsgVue from './NotifyMsg.vue'

// Get store
const notify = useNotifyStore()
</script>

<template>
  <transition-group name="notify" tag="div" class="fixed right-0 top-0 z-50">
    <notify-msg-vue
      v-for="i in notify.queue"
      :key="i.timestamp"
      :type="i.type"
      :msg="i.msg"
    />
  </transition-group>
</template>

<style scoped>
.notify-move,
.notify-enter-active,
.notify-leave-active {
  transition: all .5s ease;
}

.notify-enter-from,
.notify-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.notify-leave-active {
  position: absolute;
}

</style>
