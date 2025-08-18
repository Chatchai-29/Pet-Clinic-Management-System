import axios from 'axios';

// backend EC2
const axiosInstance = axios.create({
  baseURL: 'http://52.62.227.183:5001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default axiosInstance;
