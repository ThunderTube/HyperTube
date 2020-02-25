import axios from './axios'

const AUTH = '/auth'

const register = (data) => axios.post(`${AUTH}/register`, data)

const login = (data) => axios.post(`${AUTH}/login`, data)

// const me = (data) => axios.get(`${AUTH}/me`, { data });

// const confirmAccount = (uuid, id, data) => axios.get(`${AUTH}/confirmaccount/${uuid}/${id}`, { data });

// const getUser = (id, data) => axios.get(`${AUTH}/user/${id}`, { data });

const forgotPassword = (data) => axios.post(`${AUTH}/forgotpassword`, data)

// const resetPassword = (data) => axios.put(`${AUTH}/resetpassword`, { data });

// const updateDetails = (data) => axios.put(`${AUTH}/updatedetails`, { data });

// const updatePassword = (data) => axios.put(`${AUTH}/updatepassword`, { data });

// const logout = (data) => axios.post(`${AUTH}/logout`, { data });

export {
  register,
  login,
  // me,
  // confirmAccount,
  // getUser,
  forgotPassword
  // resetPassword,
  // updateDetails,
  // updatePassword,
  // logout
}
