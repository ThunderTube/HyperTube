import Vue from 'vue'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/index.css'

import './assets/styles/app.css'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import { I18N_LOCAL_STORAGE_KEY } from '@/constants.js'

Vue.use(VueToast)

Vue.config.productionTip = false

i18n.locale = localStorage.getItem(I18N_LOCAL_STORAGE_KEY) || 'en'

new Vue({
  store,
  router,
  i18n,
  render: (h) => h(App)
}).$mount('#app')
