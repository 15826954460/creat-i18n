<template>
  <div class="loading-wrap"
    :style="{ width: loadSize, height: loadSize, color: color }"
  >
    <div class="loading-ring">
      <div class="outer" />
      <div v-if='inner' class="inner"
        :style="{ width: `${100 * innerSize}%`, height: `${100 * innerSize}%` }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "loading-com",

  props: {
    size: { // loading 大小
      type: [String, Number],
      default: 25,
    },
    inner: { // 是否展示内圈
      type: Boolean,
      default: false,
    },
    innerSize: { // 内圈尺寸大小[0~1] 之间的小数
      type: Number,
      default: 0.4,
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return value >= 0 && value <= 1;
      }
    },
    color: {
      type: String,
      default: '#62AFFC'
    }
  },

  computed: {
    loadSize() {
      return typeof this.size === 'string' ? this.size : `${this.size}px`
    }
  },
};
</script>

<style lang="scss" scoped>
.loading-wrap {
  display: inline-block;
  .loading-ring {
    position: relative;
    width: 100%;
    height: 100%;
    .inner, .outer {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      color: currentColor;
      &::after {
        content: "";
        display: block;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .outer {
      width: 100%;
      height: 100%;
      &::after {
        border-left: 2px solid currentColor;
        border-right: 2px solid currentColor;
        border-top: 2px solid currentColor;
        border-bottom: 2px solid transparent;
        animation: clockwise 0.8s infinite linear;
      }
    }

    .inner {
      &::after {
        border-top: 2px solid currentColor;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        border-left: 2px solid transparent;
        animation: anticlockwise 1.2s infinite linear;
      }
    }
  }
}

@keyframes clockwise {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes anticlockwise {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
