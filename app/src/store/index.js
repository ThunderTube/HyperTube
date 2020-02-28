import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { auth } from './modules'

const store = () => {
  return new Vuex.Store({
    modules: {
      auth    }
  })
}

export default store
