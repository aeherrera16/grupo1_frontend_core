import axios from 'axios';
import ENV from '../config/environment';

const instance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('logout'));
    }
    if (import.meta.env.DEV && error.response?.status >= 500) {
      console.error('API Server Error:', {
        status: error.response.status,
        message: error.response.data?.message,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export default instance;
