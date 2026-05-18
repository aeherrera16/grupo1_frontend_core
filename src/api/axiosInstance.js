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
    // Try several localStorage keys / shapes for historical compatibility
    const candidates = [
      localStorage.getItem('banquito_auth'),
      localStorage.getItem('banquito_session'),
      localStorage.getItem('banquitoSession'),
      localStorage.getItem('banquitoSession'.toLowerCase())
    ].filter(Boolean);

    for (const raw of candidates) {
      try {
        const obj = JSON.parse(raw);
        // common shapes
        const maybeId = obj?.user?.id || obj?.coreUserId || obj?.userId || obj?.session?.coreUserId || obj?.session?.user?.id || obj?.session?.userId;
        if (maybeId) {
          config.headers['X-Core-User-Id'] = String(maybeId);
          break;
        }
      } catch (_) {
        // ignore parse errors per candidate
      }
    }
  } catch (e) {
    // ignore any unexpected errors reading storage
  }
  // DEV fallback: if no core user id found, do NOT set a default
  // This prevents 403 errors when the user is not properly authenticated
  if (import.meta.env.DEV && !config.headers['X-Core-User-Id']) {
    // eslint-disable-next-line no-console
    console.warn('axios - No X-Core-User-Id found in localStorage. User may not be authenticated.');
  }
  if (import.meta.env.DEV) {
    try {
      const sent = config.headers['X-Core-User-Id'] || null;
      // eslint-disable-next-line no-console
      console.debug('axios - X-Core-User-Id header:', sent, '->', config.method?.toUpperCase(), config.url);
    } catch {
      // ignore
    }
  }
  return config;
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('logout'));
    }
    if (import.meta.env.DEV) {
      try {
        // eslint-disable-next-line no-console
        console.debug('axios - API Error response:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      } catch (e) {
        // ignore
      }
      if (error.response?.status >= 500) {
        // eslint-disable-next-line no-console
        console.error('API Server Error:', {
          status: error.response.status,
          message: error.response.data?.message,
          url: error.config?.url,
        });
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
