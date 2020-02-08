import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import movies from './modules/movies/index'
import user from './modules/user/index'

const store = () => {
    return new Vuex.Store({
        modules: {
            movies,
            user
        }
    })
}

export default store