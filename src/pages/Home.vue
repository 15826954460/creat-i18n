<template>
  <div class="__flex __cfsc home-container">
    <span class="title">JSON、EXCEL 相互转换</span>
    <FileConversion />
  </div>
</template>

<script>
import FileConversion from '../components/home/FileConversion.vue';

export default {
  name: 'home-page',

  components: { FileConversion },
}
</script>

<style scoped lang="scss">
.home-container {
  padding: 0 35px;
  background-color: var(--app-bg-color);
  width: 100%;
  height: calc(100% - 40px);

  .title {
    color: var(--home-page-title-color);
    font-size: 24px;
    font-weight: bold;
    margin: 36px 0;
  }
}
</style>
