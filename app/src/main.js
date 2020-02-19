import Vue from 'vue'
import VueTailwind from 'vue-tailwind'

import App from './App.vue'

import router from './router'
import store from './store'
import './assets/styles/app.css'
import i18n from './i18n'

Vue.use(VueTailwind)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App)
}).$mount('#app')
