<template>
  <p class="split-line" :style="{ backgroundSize: `${size * 2 }px 1px`}"></p>
</template>

<script>
export default {
  name: 'dashed-line-com',

  props: {
    // 虚线大小
    size: {
      type: Number,
      default: 9,
    }
  }

}
</script>

<style scoped lang="scss">
  .split-line {
    width: 100%;
    height: 1px;
    background-image: linear-gradient(to right, var(--split-line-color) 0%, var(--split-line-color), 50%, transparent 50%);
    background-repeat: repeat-x;
  }
</style>
