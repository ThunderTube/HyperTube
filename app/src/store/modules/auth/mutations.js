export const CLEAR_AUTH_DATA = (state) => {
  state.user = null
}

export const SET_AUTH_DATA = (state, data) => {
  state.user = data
}

export const CLEAR_AUTH_CSRF = (state) => {
  state.csrf = null
}

export const SET_AUTH_CSRF = (state, csrf) => {
  state.csrf = csrf
}

export const SET_AUTH_IS_LOGGED_IN = (state, bool) => {
  state.isLoggedIn = bool
}

export const SET_AUTH_PASSWORD_RESET_TOKEN = (state, token) => {
  state.passwordResetToken = token
}

export const CLEAR_AUTH_PASSWORD_RESET_TOKEN = (state) => {
  state.passwordResetToken = null
}
