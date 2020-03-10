import axios from './axios'

const AUTH = '/auth'

const register = (data) => axios.post(`${AUTH}/register`, data)

const login = (data) => axios.post(`${AUTH}/login`, data)

const me = () => axios.get(`${AUTH}/me`)

const confirmAccount = (uuid, id) =>
  axios.get(`${AUTH}/confirmaccount/${uuid}/${id}`)

const getUser = (id) => axios.get(`${AUTH}/user/${id}`)

const forgotPassword = (data) => axios.post(`${AUTH}/forgotpassword`, data)

const resetPassword = (data) => axios.put(`${AUTH}/resetpassword`, data)

const updateDetails = (data) => axios.put(`${AUTH}/updatedetails`, data)

const updatePassword = (data) => axios.put(`${AUTH}/updatepassword`, data)

const logout = () => axios.post(`${AUTH}/logout`)

export {
  register,
  login,
  me,
  confirmAccount,
  getUser,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout
}
