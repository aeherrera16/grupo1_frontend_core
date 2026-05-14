import { useContext } from 'react';
import { AuthContext } from '../context/authContextObject';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de AuthProvider');
  }
  return context;
}
