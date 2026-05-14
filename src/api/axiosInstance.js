import axios from 'axios';
import ENV from '../config/environment';

const instance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para 401 → logout automático
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('logout'));
    }
    return Promise.reject(error);
  }
);

export default instance;
