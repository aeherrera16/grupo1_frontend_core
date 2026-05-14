import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080/core/v1',
  timeout: 10000,
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
