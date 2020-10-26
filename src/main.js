import Vue from 'vue'
import App from './App.vue'
import "@/assets/style/reset.scss";
import "@/assets/style/flex.scss";
import "@/assets/style/common.scss";
import "@/assets/style/index.scss";

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
