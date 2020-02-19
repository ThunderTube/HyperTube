import axios from 'axios';

const instance = axios.create({
    timeout: 1500,
    baseURL: 'http://localhost/api/v1',
    headers: {
        "Content-Type": "application/json",
    }
});

export default instance;                                                          