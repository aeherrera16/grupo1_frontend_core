import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { AccountOperationsPage } from './pages/AccountOperationsPage';
import { CashierPage } from './pages/CashierPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { CustomerAccountsPage } from './pages/CustomerAccountsPage';
import { CustomerOnboardingPage } from './pages/CustomerOnboardingPage';
import { CustomerTransferPage } from './pages/CustomerTransferPage';
import { PagosMasivosPage } from './pages/PagosMasivosPage';
import { SftpMailboxPage } from './pages/SftpMailboxPage';
import { LoginPage } from './pages/LoginPage';
import { LayoutEmpresas } from './components/LayoutEmpresas';
import './index.css';

function Protected({ portal, children }) {
  return <LayoutEmpresas allowedPortal={portal}>{children}</LayoutEmpresas>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/:portal" element={<LoginPage />} />

          <Route
            path="/operador"
            element={
              <Protected portal="operador">
                <CustomerOnboardingPage />
              </Protected>
            }
          />
          <Route
            path="/operador/credenciales"
            element={
              <Protected portal="operador">
                <CredentialsPage />
              </Protected>
            }
          />
          <Route
            path="/operador/cuentas"
            element={
              <Protected portal="operador">
                <AccountOperationsPage />
              </Protected>
            }
          />
          <Route
            path="/empresa/cuentas"
            element={
              <Protected portal="empresa">
                <CustomerAccountsPage />
              </Protected>
            }
          />
          <Route
            path="/empresa/pagos-masivos"
            element={
              <Protected portal="empresa">
                <PagosMasivosPage />
              </Protected>
            }
          />
          <Route
            path="/empresa/sftp"
            element={
              <Protected portal="empresa">
                <SftpMailboxPage />
              </Protected>
            }
          />
          <Route
            path="/persona-natural"
            element={
              <Protected portal="personaNatural">
                <CustomerAccountsPage />
              </Protected>
            }
          />
          <Route
            path="/persona-natural/transferencias"
            element={
              <Protected portal="personaNatural">
                <CustomerTransferPage />
              </Protected>
            }
          />
          <Route
            path="/cajero"
            element={
              <Protected portal="cajero">
                <CashierPage />
              </Protected>
            }
          />
          <Route
            path="/cajero/consulta"
            element={
              <Protected portal="cajero">
                <CustomerAccountsPage cashierMode />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
