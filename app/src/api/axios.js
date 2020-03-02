import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL,
    withCredentials: true

});

instance.interceptors.response.use(response => {
    return response;
 }, error => {
    if (error.response.status === 400) {
        console.log('axios 400')
    }
   if (error.response.status === 401) {
        console.log('axios unauthorized')
   }
   return error;
 });

export default instance;
