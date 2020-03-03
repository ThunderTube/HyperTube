export const getAuthData = (state) => {
    return state.user
}

export const getAuthCSRF = (state) => {
    return state.csrf
}

export const isLoggedIn = (state) => {
    return state.isLoggedIn
}

export const getPasswordResetToken = (state) => {
    return state.passwordResetToken
}