<template>
  <transition name="modal-fade">
    <div class="__flex __ccc toast-loading" v-show="showLoading">
      <Loading :size="50" :inner="true" :innerSize="0.8"></Loading>
      <span v-show="msg" class="text">{{msg}}</span>
    </div>
  </transition>
</template>

<script>
import Loading from '@/components/common/Loading.vue';

export default {
  name: 'loading-plu',

  components: {
    Loading
  },

  data() {
    return {
      showLoading: false,
      msg: '',
    };
  },
};
</script>

<style scoped lang="scss">
.toast-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: var(--loading-wrap-bg-color);

  .text {
    font-size: 12px;
    margin-top: 10px;
    color: var(--loading-text-color);
  }
}
</style>
