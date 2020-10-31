import Loading from './loading.vue';

export default {
  install(Vue, options = {}) {
    const property = options.property || '$loading';
    const instance = new Vue(Loading);
    document.body.appendChild(instance.$mount().$el);

    const loading = {
      show({ msg = '' } = {}) {
        instance.showLoading = true;
        instance.msg = msg || 'Conversioning';
      },

      hidden() {
        instance.showLoading = false;
      },
    };
    Vue.prototype[property] = loading;
  },
};
