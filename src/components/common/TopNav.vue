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
  name: 'top-nav-com',

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
  height: 40px;
  -webkit-app-region: drag;
  background-color: var(--nav-bg-color);
  .icon {
    display: inline-block;
    width: 50px;
    height: 100%;
    background-size: 30px 15px;
    background-repeat: no-repeat;
    background-position: center;
    -webkit-app-region: no-drag;
    &:hover {
      background-color: var(--nav-icon-hover-bg-color);
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
