import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { auth, movies } from './modules'

const store = () => {
  return new Vuex.Store({
    modules: {
      auth,
      movies
    }
  })
}

export default store
