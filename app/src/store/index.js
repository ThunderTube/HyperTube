import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// import user from './modules/user'
import auth from './modules/auth'

const store = () => {
    return new Vuex.Store({
        modules: {
            auth
        }
    })
}

export default store