<template>
  <div id="app">
    <TopNav></TopNav>
    <FileConversion></FileConversion>
  </div>
</template>

<script>
import TopNav from './components/common/TopNav.vue';
import FileConversion from './components/home/FileConversion.vue';

export default {
  name: 'App',

  components: {
    TopNav, FileConversion
  },

}
</script>
<style lang="scss" scoped>
  #app {
    width: 100%;
    height: 100%;
    background: var(--app-bg-color);
    .btn {
      -webkit-app-region: no-drag;
    }
  }
</style>