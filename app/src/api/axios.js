import axios from 'axios'

const instance = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true

});

instance.interceptors.request.use(request => {
      const token = localStorage.getItem('csrfToken')
      if (token)
        instance.defaults.headers.common['X-CSRF-TOKEN'] = token
      return request
})

instance.interceptors.response.use(response => {
    if (response.data.csrfToken) {
      localStorage.setItem('csrfToken', response.data.csrfToken)
      instance.defaults.headers.common['X-CSRF-TOKEN'] = response.data.csrfToken
    }
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
