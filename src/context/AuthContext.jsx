import { useState, useEffect } from 'react';
import { AuthContext } from './authContextObject';

import { loginStaff, loginCustomer } from '../services/apiClient';

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

  const login = async (portal, username, password) => {
    const isStaff = staffPortals.has(portal);
    let userData;

    try {
      if (isStaff) {
        const res = await loginStaff(username, password);
        userData = {
          id: res.coreUserId,
          name: res.fullName,
          username: res.username,
          role: res.role,
        };
      } else {
        const res = await loginCustomer(username, password);
        userData = {
          id: res.customerId,
          credentialId: res.credentialId,
          name: res.customerName,
          username: res.username,
          role: 'CUSTOMER',
        };
      }

      const newAuth = {
        isAuthenticated: true,
        portal,
        user: userData,
      };

      setAuth(newAuth);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));
      return userData;
    } catch (err) {
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
