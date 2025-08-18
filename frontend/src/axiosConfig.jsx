import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',   //use relative path
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
