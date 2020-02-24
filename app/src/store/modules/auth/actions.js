import { register } from '@/api/auth'

export const registerUser = async ({ commit }, data) => {
    try {
        const response = await register(data)
        this.setAuthData(commit, response.data);
    } catch (error) {
        console.log('async function registerUser ', error)
    }
}

export const setAuthData = (commit, data) => {
    commit('SET_AUTH_DATA', data)
}

export const clearAuthData = ({ commit }) => {
    commit('CLEAR_AUTH_DATA')
}