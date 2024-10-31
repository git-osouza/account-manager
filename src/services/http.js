import axios from 'axios';

const apiAuth = 'https://api.tenhafibra.com.br/account-manager';



const axiosInstance = axios.create({
    baseURL: apiAuth,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;