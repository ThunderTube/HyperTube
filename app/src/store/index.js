import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { auth } from './modules'

const store = new Vuex.Store({
  modules: {
    auth
  }
})

export async function loadStore() {
  return store.dispatch('auth/getCurrentUser')
}

export default store
