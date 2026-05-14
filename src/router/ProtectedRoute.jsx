import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const auth = useAuth() || {};
  const { isAuthenticated = false } = auth;

  // Evita loop infinito: si ya estamos en /login, no rediriges más
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
