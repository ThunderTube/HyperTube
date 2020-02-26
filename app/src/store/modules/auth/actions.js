import { register, login, forgotPassword, me } from '@/api/auth'

export const registerUser = async ({ commit }, data) => {
  try {
    const res = await register(data)
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
      // dispatch('setAuthCSRF', res.data.csrfToken)
      // dispatch('setAuthIsLoggedIn', true)
      // dispatch('setAuthData', res.data.user)
        dispatch('getCurrentUser')
    }
    return res
  } catch (error) {
    console.log('loginUser ', error)
  }
}

export const getCurrentUser = async ({ dispatch }) => {
  try {
    const res = await me()
    if (res.data.success) {
      // dispatch('setAuthCSRF', res.data.csrfToken)
      dispatch('setAuthIsLoggedIn', true)
      dispatch('setAuthData', res.data.user)
    }
    return res
  } catch (error) {
    console.log('getCurrentUser ', error.message)
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

export const setPasswordResetToken = ({ commit }, token) => {
  commit('SET_AUTH_DATA', data)
}

export const clearAuthData = ({ commit }) => {
  commit('CLEAR_AUTH_DATA')
}
