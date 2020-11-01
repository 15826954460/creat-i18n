<template>
  <transition name="modalmark">
    <div class="modal-mark-container" v-show="isShowModalMark">
      <i class="__cursor close-icon" @click="cancel()"></i>
      <!-- 文件重命名 -->
      <transition name="rename">
        <div class="__abs rename-box" v-show="renameModalShow">
          <p class="resume-title">{{'当前文已存在,将根据您的输入重新创建'}}</p>
          <div class="input-box">
            <input ref="inputRename" type="text" placeholder="请输入文件名" v-model="rename" />
          </div>
          <div class="__flex __rsbc button-box">
            <Btn class="__cursor cancel" @click="cancel()" text="取消"></Btn>
            <Btn class="__cursor confirm" @click="confirm()" text="确认"></Btn>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import Btn from './Button.vue';

export default {
  name: 'modal-mark-com',

  components: { Btn },

  data() {
    return {
      isShowModalMark: false,
      renameModalShow: false,
      rename: '',
      conversionType: '',
    }
  },

  methods: {
    handleModalMark(bool = true, conversionType = '') {
      this.isShowModalMark = bool;
      this.handleRenameShowStatus(bool);
      conversionType && (this.conversionType = conversionType);
    },

    handleRenameShowStatus(bool = true) {
      this.renameModalShow = bool;
    },

    cancel() {
      this.rename = '';
      this.handleModalMark(false);
    },

    confirm() {
      if (!this.rename.trim()) {
        this.$toast.show({ msg: '请输入文件名' })
        return;
      }
      this.$emit('click', { fileName: this.rename.trim(), type: this.conversionType });
      this.rename = '';
    }

  }
}
</script>

<style scoped lang="scss">
.modal-mark-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 99;
  background: var(--modal-mark-container-bg-color);

  .close-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-block;
    right: 5px;
    top: 5px;
    position: absolute;
    background-color: var(--modal-mark-colse-icon-bg-color);
    background-image: url('../../assets/images/common/icon-close.svg');
    background-size: 60% 60%;
    background-repeat: no-repeat;
    background-position: center;
  }

  .rename-box {
    background: var(--app-bg-color);
    width: 400px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 20px;
    border-radius: 5px;
    overflow: hidden;
    .resume-title {
      margin-bottom: 10px;
    }

    .input-box {
      width: 100%;
      height: 20px;
      border-bottom: 1px solid var(--modal-mark-input-berder-bottom);
      input {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
      }
    }

    .button-box {
      margin-top: 15px;
      .cancel, .confirm {
        font-size: 16px;
        font-weight: 400;
        line-height: 19px;
        height: 19px;
      }
      .cancel {
        color: var(--modal-mark-rename-btn-cancel);
      }
      .confirm {
        color: var(--modal-mark-rename-btn-confirm);
      }
    }
  }

}

// 黑色遮罩动画
.modalmark-enter-active {
  animation: modalmark-in 0s linear;
}
.modalmark-leave-active {
  animation: modalmark-out 0s linear 0.2s;
}

@keyframes modalmark-in {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}
@keyframes modalmark-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.rename-enter-active {
  animation: rename-in 0.2s linear;
}

.rename-leave-active {
  animation: rename-out 0.2s linear;
}

@keyframes rename-in {
  0% { top: 55%; }
  100% { top: 50%; }
}
@keyframes rename-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
