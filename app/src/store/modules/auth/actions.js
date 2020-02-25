import { register, login, forgotPassword } from '@/api/auth'

export const registerUser = async ({ commit }, data) => {
  try {
    const res = await register(data)
    // CSRF not necessary in the register phase because you give it back
    // on the login
    // also when do we confirm the account ?
    // whats the user auth path
    // no image upload is needed in correction
    // what does the me endpoint do ?
    // if (res.data.success)
    //     setAuthCSRF(commit, res.data.csrfToken)
    return res
  } catch (error) {
    console.log('registerUser ', error)
  }
}

export const forgotUserPassword = async ({ commit }, data) => {
  try {
    const res = await forgotPassword(data)
    return res
  } catch (error) {
    console.log('forgotPassword ', error)
  }
}

export const loginUser = async ({ dispatch }, data) => {
  try {
    const res = await login(data)
    if (res.data.success) {
      dispatch('setAuthCSRF', res.data.csrfToken)
      dispatch('setAuthIsLoggedIn', true)
      dispatch('setAuthData', res.data.user)
    }
    return res
  } catch (error) {
    console.log('loginUser ', error)
  }
}

export const setAuthIsLoggedIn = ({ commit }, bool) => {
  commit('SET_AUTH_IS_LOGGED_IN', bool)
}

export const setAuthCSRF = ({ commit }, csrf) => {
  commit('SET_AUTH_CSRF', csrf)
}

export const setAuthData = ({ commit }, data) => {
  commit('SET_AUTH_DATA', data)
}

export const clearAuthData = ({ commit }) => {
  commit('CLEAR_AUTH_DATA')
}
