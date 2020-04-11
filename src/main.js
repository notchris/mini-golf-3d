import Vue from 'vue';
import App from './App.vue';
import store from './store';
import splitPane from 'vue-splitpane';
import * as VueGL from 'vue-gl';
import VglConvexGeometry from './assets/js/VglConvexGeometry';
import './assets/css/style.css';

Object.keys(VueGL).forEach((name) => Vue.component(name, VueGL[name]));
Vue.component('vgl-convex-geometry', VglConvexGeometry);
Vue.component('split-pane', splitPane);
Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
