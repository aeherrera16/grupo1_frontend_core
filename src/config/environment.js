const ENV = {
  // En desarrollo: URL relativa para proxy de Vite; en producción: URL absoluta del backend
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? '/core/v1' : 'http://localhost:8080/core/v1'),

  API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Banquito Intranet',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || false,
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || false,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN_STAFF: '/auth/core-users/login',
    LOGIN_CUSTOMER: '/auth/customers/login',
  },

  CUSTOMERS: {
    GET_ALL: '/customers',
    GET: (id) => `/customers/${id}`,
    SEARCH: (type, identification) => `/customers/identification/${type}/${identification}`,
    CREATE: '/customers',
    UPDATE: (id) => `/customers/${id}`,
    SUBTYPES: '/customers/subtypes',
  },

  ACCOUNTS: {
    GET: (accountNumber) => `/accounts/${accountNumber}`,
    CREATE: '/accounts',
    GET_BY_CUSTOMER: (customerId) => `/accounts/customer/${customerId}`,
    ACTIVATE: (accountNumber) => `/accounts/${accountNumber}/activate`,
    INACTIVATE: (accountNumber) => `/accounts/${accountNumber}/inactivate`,
    BLOCK: (accountNumber) => `/accounts/${accountNumber}/block`,
    SUSPEND: (accountNumber) => `/accounts/${accountNumber}/suspend`,
    CREDIT: (accountNumber) => `/accounts/${accountNumber}/credit`,
    TRANSFER: '/accounts/transfer',
    GET_FAVORITE: '/accounts/default/favorite',
    AVAILABILITY: (accountNumber) => `/integration/balance/${accountNumber}`,
  },

  TRANSACTIONS: {
    DEBIT: '/transactions/debits',
    CREDIT: '/transactions/credits',
    TRANSFER: '/transactions/transfers',
    HISTORY: (accountNumber) => `/transactions/account/${accountNumber}`,
  },

  BRANCHES: {
    GET_ALL: '/branches',
    GET: (code) => `/branches/${code}`,
    CREATE: '/branches',
  },

  HOLIDAYS: {
    // Este endpoint está en /api/holidays, no en /core/v1/holidays
    CHECK_BUSINESS_DAY: (date) => `/api/holidays/is-business-day?date=${date}`,
  },

  NOTIFICATIONS: {},
};

export default ENV;
