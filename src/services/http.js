import axios from 'axios';

const apiAuth = 'https://account-manager.tenhafibra.com.br';



const axiosInstance = axios.create({
    baseURL: apiAuth,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;