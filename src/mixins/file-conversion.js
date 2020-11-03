export default {
  methods: {
    conversionStatusChange(bool) {
      this.isConversioning = bool;
    },

    needShowLoading() {
      let __setp = 0;
      let __timer = setInterval(() => {
        if (!this.isConversioning) {
          clearInterval(__timer);
          __timer = null;
        } else if (__setp >= 2000 && this.isConversioning) {
          this.$loading.show();
          clearInterval(__timer);
          __timer = null;
        }
        __setp += 200;
      }, 200);
    },
  }
}