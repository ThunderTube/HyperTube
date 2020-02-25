export const CLEAR_AUTH_DATA = (state) => {
    state.data = null
}

export const SET_AUTH_DATA = (state, data) => {
    state.data = data
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