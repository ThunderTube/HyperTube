import {
  register,
  login,
  forgotPassword,
  me,
  logout,
  resetPassword,
  updateDetails,
  updatePassword,
  fortyTwo,
  google,
  github
} from '@/api/auth'

export const registerUser = async ({ commit }, data) => {
  try {
    const res = await register(data)

    return res
  } catch (error) {
    console.log('registerUser ', error)
  }
}

export const fortyTwoUser = async ({ commit }) => {
  try {
    const res = await fortyTwo()
    console.log(res)
    return res
  } catch (error) {
    console.log('fortyTwoUser ', error)
  }
}

export const googleUser = async ({ commit }) => {
  try {
    const res = await google()
    console.log(res)
    return res
  } catch (error) {
    console.log('googleUser ', error)
  }
}

export const githubTwoUser = async ({ commit }) => {
  try {
    const res = await github()
    console.log(res)
    return res
  } catch (error) {
    console.log('githubTwoUser ', error)
  }
}

export const updateUserDetails = async ({ commit }, data) => {
  try {
    const res = await updateDetails(data)
    return res
  } catch (error) {
    console.log('updateUserDetails ', error)
  }
}

export const updateUserPassword = async ({ commit }, data) => {
  try {
    const res = await updatePassword(data)
    return res
  } catch (error) {
    console.log('registerUser ', error)
  }
}

export const passwordReset = async ({ commit }, data) => {
  try {
    const res = await resetPassword(data)
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
    if (res.message) return console.log(res.message)
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

export const logoutCurrentUser = async ({ dispatch }) => {
  try {
    const res = await logout()
    if (res.data.success) {
      dispatch('clearAuthData')
      dispatch('setAuthIsLoggedIn', false)
      localStorage.removeItem('csrfToken')
    }
  } catch (error) {
    console.log('logoutCurrentUser ', error.message)
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
