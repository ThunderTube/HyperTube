import Vue from 'vue'
import VueTailwind from 'vue-tailwind'

import App from './App.vue'

import router from './router'
import store from './store'
import './assets/styles/app.css'
import i18n from './i18n'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/index.css'

Vue.use(VueToast)

Vue.use(VueTailwind)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  let language = to.params.lang
  if (!language) {
    language = 'en'
  }

  i18n.locale = language
  next()
})

// Turn off all console log message
// console.log = function(){}

new Vue({
  store,
  router,
  i18n,
  render: (h) => h(App)
}).$mount('#app')
