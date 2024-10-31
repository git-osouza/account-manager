import axios from 'axios';

const apiAuth = 'https://api.tenhafibra.com.br/account-manager/php';



const axiosInstance = axios.create({
    baseURL: apiAuth,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;