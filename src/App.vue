<template>
  <div id="app">
    <TopNav></TopNav>
    <router-view />
  </div>
</template>

<script>
import TopNav from './components/common/TopNav.vue';

export default {
  name: 'App',

  components: { TopNav },
}

</script>
<style lang="scss" scoped>
  #app {
    width: 100%;
    height: 100%;
    background: var(--app-bg-color);
  }
</style>