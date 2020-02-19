import axios from './axios';

const AUTH = '/auth';

const register = (data) => axios.post(`${AUTH}/register`, { data });

export {
    register
}