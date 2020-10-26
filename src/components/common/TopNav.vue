<template>
  <div class="__flex __rfec nav-wrap">
    <i class="__cursor icon icon-minimized" @click="minimizeWin"></i>
    <i class="__cursor icon icon-maximized" @click="maximizeWin"></i>
    <i class="__cursor icon icon-close" @click="closeWin"></i>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  components: {},
  data() {
    return {

    }
  },
  computed: {},
  created() {
    
  },
  mounted() {},

  methods: {
    minimizeWin(){
       ipcRenderer.send('window-min') // 通知主进程我要进行窗口最小化操作
    },
    maximizeWin(){
      ipcRenderer.send('window-max')
    },
    closeWin(){
      ipcRenderer.send('window-close')
    }
  }
}
</script>

<style scoped lang="scss">
.nav-wrap {
  height: 30px;
  -webkit-app-region: drag;
  background-color: var(--top-nav-bg-color);
  .icon {
    display: inline-block;
    width: 40px;
    height: 100%;
    background-size: 20px 10px;
    background-repeat: no-repeat;
    background-position: center;
    -webkit-app-region: no-drag;
    &:hover {
      background-color: var(--top-nav-icon-hover-bg-color);
      -webkit-app-region: no-drag;
    }
  }

  .icon-minimized {
    background-image: url('../../assets/images/common/icon-minimized.svg');
  }

  .icon-maximized {
    background-image: url('../../assets/images/common/icon-maximized.svg');
    
  }

  .icon-close {
    background-image: url('../../assets/images/common/icon-close.svg');
  }

}
</style>
