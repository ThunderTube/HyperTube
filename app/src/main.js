import Vue from 'vue'
import VueTailwind from 'vue-tailwind'

import App from './App.vue'

import router from './router'
import store from './store'
import './assets/styles/app.css'

Vue.use(VueTailwind)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
