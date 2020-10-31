<template>
  <transition name="modal-fade">
    <div class="toast-wrap" v-show="showToast">
      <p class="__flex __rfsc msg-box">
        <i v-if="success === true" class="__inb icon icon-success" />
        <i v-else  class="__inb icon icon-error" />
        <span class="message">{{ message }}</span>
      </p>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'toast-plugin',

  data() {
    return {
      message: "",
      success: false,
      showToast: false,
    };
  },
};
</script>

<style scoped lang="scss">
.toast-wrap {
  position: fixed;
  z-index: 999;
  left: 50%;
  transform: translateX(-50%);
  margin: 0 auto;
  bottom: 8%;
  width: 300px;
  border-radius: 5px;
  color: var(--app-bg-color);
  background-color: var(--toast-wrap-bg-color);
}

.msg-box {
  height: 36px;
  padding: 0 10px;
  .icon {
    margin-right: 8px;
    width: 16px;
    height: 16px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .icon-success {
    background-image: url('../../assets/images/common/toast-success-icon.svg');
  }

  .icon-error {
    background-image: url('../../assets/images/common/toast-error-icon.svg');
  }

  .message {
    font-size: 14px;
  }
}


/* 动画 */
.modal-fade-enter-active {
  animation: toast-in-bottom .25s;
}
.modal-fade-leave-active {
  animation: toast-out-bottom .2s;
}

@keyframes toast-in-bottom {
  0% { bottom: 4%; opacity: 0.5; }
  100% { bottom: 8%; opacity: 1; }
}
@keyframes toast-out-bottom {
  0% { bottom: 8%; opacity: 1; }

  100% { bottom: 4%; opacity: 0.8; }
}
</style>
