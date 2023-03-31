<script setup>
import { ref } from 'vue'
import { useApiStore } from '../store/api'
import { useContestStore } from '../store/contest'

// Stores
const api = useApiStore()
const contest = useContestStore()

// Reactive
const userId = ref("")
const passwd = ref("")
const loginWarn = ref("")
const contestListWarn = ref("")

// Action
const login = async ()=>{
  loginWarn.value = ""

  if (userId.value.length === 0) {
    loginWarn.value = "User ID cannot be empty"
    return
  }

  if (passwd.value.length === 0) {
    loginWarn.value = "Password cannot be empty"
    return
  }

  const res = await api.login(userId.value, passwd.value)
  if (res.code !== 0)
    loginWarn.value = res.msg
}

const validateContestList = async ()=>{
  contestListWarn.value = ""

  if (/^(\d*)(,\d+)*$/.test(contest.contestList) === false) {
    contestListWarn.value = "Invalid list"
    return
  }

  contest.mergeList = contest.contestList.split(',')

  console.log(await contest.init())
}
</script>

<template>
  <div class="p-8 text-white">
    <h1>Settings</h1>

    <h2>Service API</h2>
    <input v-model="api.baseUrl" type="url"/>

    <h2>User</h2>
    <template v-if="api.userId === null">
      <input v-model="userId" placeholder="User ID" type="text"/>
      <input v-model="passwd" placeholder="Password" type="password"/>
      <p class="font-bold text-red-500 mb-4">{{ loginWarn }}</p>
      <button @click="login">Login</button>
    </template>
    <template v-else>
      <p><b>Name: </b>{{ api.userId }}</p>
      <p class="mb-2"><b>Last Refresh: </b>{{ new Date(api.lastRefreshTime).toLocaleString() }}</p>
      <button @click="api.logout">Logout</button>
    </template>

    <h2>Contest Title</h2>
    <input v-model="contest.title" type="text"/>

    <h2>Start Time</h2>
    <input v-model="contest.startTime" type="datetime-local"/>

    <h2>End Time</h2>
    <input v-model="contest.endTime" type="datetime-local"/>

    <h2>Contest Merging</h2>
    <input @blur="validateContestList" v-model="contest.contestList" placeholder="1001,1002,1003,..." type="text"/>
    <p class="font-bold text-red-500 mb-4">{{ contestListWarn }}</p>
  </div>
</template>

<style lang="postcss" scoped>
h1 {
  @apply font-bold mb-4 select-none text-3xl
}

h2 {
  @apply font-bold mb-2 mt-4 select-none text-2xl
}

input {
  @apply bg-transparent block border border-solid border-white mb-4 outline-none p-2 rounded w-1/2 focus:border-red-500
}

button {
  @apply border-2 border-solid border-white px-4 py-2 rounded-lg hover:bg-white hover:font-bold hover:text-black
}
</style>
