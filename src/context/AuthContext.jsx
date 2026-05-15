import { useState, useEffect } from 'react';
import { AuthContext } from './authContextObject';

import { loginStaff } from '../api/authApi';

const staffPortals = new Set(['operador', 'cajero']);
const STORAGE_KEY = 'banquito_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    portal: null,
    user: null,
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch (e) {
        console.error('Error al restaurar sesión:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await loginStaff(username, password);
      const data = res.data;

      const userData = {
        id: data.coreUserId,
        name: data.fullName,
        username: data.username,
        role: data.role,
        status: typeof data.status === 'string' ? data.status : data.status?.toString() || 'ACTIVO',
      };

      const newAuth = {
        isAuthenticated: true,
        portal: 'operador',
        user: userData,
      };

      setAuth(newAuth);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));
      if (import.meta.env.DEV) {
        console.log('✅ Usuario autenticado:', userData);
      }
      return userData;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('❌ Error en login - Detalles:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          message: err.response?.data?.message,
          data: err.response?.data,
          url: err.config?.url,
        });
      } else {
        console.error('❌ Error en login');
      }
      throw err;
    }
  };

  const logout = () => {
    const newAuth = {
      isAuthenticated: false,
      portal: null,
      user: null,
    };

    setAuth(newAuth);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
