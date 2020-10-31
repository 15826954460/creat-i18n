import Toast from './toast.vue';

export default {
  install(Vue, options = {}) {
    const property = options.property || '$toast';
    const instance = new Vue(Toast);
    document.body.appendChild(instance.$mount().$el);

    const toast = {
      start({ msg = '', autoClose = true, success = false } = {}) {
        instance.message = msg;
        instance.showToast = true;
        instance.success = success;
        if (autoClose) {
          let timer = setTimeout(() => {
            instance.showToast = false;
            clearTimeout(timer);
            timer = null;
          }, 2000);
        }
      },

      stop() {
        instance.message = '';
        instance.showToast = false;
      },
    };
    Vue.prototype[property] = toast;
  },
};
