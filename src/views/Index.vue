<template>
  <div class="fixed flex flex-col inset-0 items-center text-white">
    <div class="mt-32"><img class="h-24 mb-4 w-24" src="/logo.svg"/></div>
    <div class="font-bold mb-8 text-3xl">Aqua Rank</div>
    <div>
      <router-link to="/rank">Rank</router-link>
      <router-link to="/settings">Settings</router-link>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
a {
  @apply border border-solid border-white font-bold 
         inline-block mx-8 px-8 py-2 rounded-lg 
         text-xl hover:bg-white hover:text-black
}
</style>
