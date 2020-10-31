<template>
  <div class="__inb __cursor btn-container" :style="{ ...sty }" @click="$emit('click')">
    <span class="btn-text">{{text}}</span>
  </div>
</template>

<script>
export default {
  name: 'btn-com',

  props: {
    text: {
      type: String,
      required: true,
    },
    sty: {
      type: Object,
      default: () => {}
    }
  }
}
</script>

<style scoped lang="scss">
.btn-container {
  border-radius: 4px;
  overflow: hidden;
  color: var(--btn-text-color);
}
</style>
