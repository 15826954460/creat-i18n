import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import '@/plugin/index.js'
import "@/assets/style/reset.scss";
import "@/assets/style/flex.scss";
import "@/assets/style/common.scss";
import "@/assets/style/index.scss";

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
