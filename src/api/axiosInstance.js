import axios from 'axios';
import ENV from '../config/environment';

const instance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('banquito_auth');
    if (stored) {
      const auth = JSON.parse(stored);
      if (auth?.user?.id) {
        config.headers['X-Core-User-Id'] = String(auth.user.id);
      }
    }
  } catch {
    // ignore
  }
  return config;
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
