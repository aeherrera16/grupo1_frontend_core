/**
 * Configuración centralizada de variables de entorno
 * Todas las URLs y timeouts de API están aquí
 */

const ENV = {
  // API Base URL
  // En desarrollo: URL relativa para usar proxy de Vite
  // En producción: URL absoluta del backend
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? '/core/v1' : 'http://localhost:8080/core/v1'),

  // Timeouts
  API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000,

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Banquito Intranet',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',

  // Features
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || false,
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || false,
};

// Endpoints organizados por módulo
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN_STAFF: '/auth/core-users/login',
    LOGIN_CUSTOMER: '/auth/customers/login',
  },

  // Clientes
  CUSTOMERS: {
    GET_ALL: '/customers',
    GET: (id) => `/customers/${id}`,
    SEARCH: (type, identification) => `/customers/identification/${type}/${identification}`,
    CREATE: '/customers',
    UPDATE: (id) => `/customers/${id}`,
  },

  // Cuentas
  ACCOUNTS: {
    GET: (accountNumber) => `/accounts/${accountNumber}`,
    CREATE: '/accounts',
    GET_BY_CUSTOMER: (customerId) => `/accounts/customer/${customerId}`,
    INACTIVATE: (accountNumber) => `/accounts/${accountNumber}/inactivate`,
    BLOCK: (accountNumber) => `/accounts/${accountNumber}/block`,
    SUSPEND: (accountNumber) => `/accounts/${accountNumber}/suspend`,
    CREDIT: (accountNumber) => `/accounts/${accountNumber}/credit`,
    TRANSFER: '/accounts/transfer',
    GET_FAVORITE: '/accounts/default/favorite',
  },

  // Transacciones
  TRANSACTIONS: {
    DEBIT: '/transactions/debits',
    CREDIT: '/transactions/credits',
    TRANSFER: '/transactions/transfers',
    HISTORY: (accountNumber) => `/transactions/account/${accountNumber}`,
  },

  // Sucursales
  BRANCHES: {
    GET_ALL: '/branches',
    GET: (code) => `/branches/${code}`,
    CREATE: '/branches',
  },

  // Feriados
  HOLIDAYS: {
    // Nota: Este endpoint está en /api/holidays, no en /core/v1/holidays
    CHECK_BUSINESS_DAY: (date) => `/api/holidays/is-business-day?date=${date}`,
    // Nota: Endpoints para crear, obtener todos, eliminar feriados no están implementados aún
  },

  // Notificaciones
  NOTIFICATIONS: {
    // Nota: Los endpoints de notificaciones no están implementados en el backend aún
    // GET: (userId) => `/notifications/${userId}`,
    // GET_UNREAD_COUNT: (userId) => `/notifications/${userId}/unread-count`,
    // MARK_AS_READ: (notificationId) => `/notifications/${notificationId}/read`,
  },
};

export default ENV;
