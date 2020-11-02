import Vue from "vue";
import Vuex from "vuex";
import { state, mutations } from "./common";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations,
  modules: {
  }
});
