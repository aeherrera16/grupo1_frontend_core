import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Pages - Públicas
import { LoginPage } from './pages/LoginPage';

// Pages - Dashboard
import { DashboardPage } from './pages/DashboardPage';

// Pages - Clientes
import { CustomerSearchPage } from './pages/customers/CustomerSearchPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { CustomerCreatePage } from './pages/customers/CustomerCreatePage';

// Pages - Cuentas
import { AccountDetailPage } from './pages/accounts/AccountDetailPage';
import { AccountCreatePage } from './pages/accounts/AccountCreatePage';

// Pages - Transacciones
import { TransactionFormPage } from './pages/transactions/TransactionFormPage';
import { TransactionHistoryPage } from './pages/transactions/TransactionHistoryPage';

// Pages - Módulos Secundarios
import { BranchesPage } from './pages/BranchesPage';
import { NotificationsPage } from './pages/NotificationsPage';

import './index.css';

const IntranetLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
      <Topbar />
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen((v) => !v)} />
      <main
        className="overflow-auto transition-all duration-300"
        style={{
          marginTop: '4rem',
          marginLeft: isSidebarOpen ? '14rem' : '3.5rem',
          height: 'calc(100vh - 4rem)',
        }}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Ruta pública de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas de intranet */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <IntranetLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />

            {/* Módulo Clientes */}
            <Route path="clientes" element={<CustomerSearchPage />} />
            <Route path="clientes/:id" element={<CustomerDetailPage />} />
            <Route path="clientes/nuevo" element={<CustomerCreatePage />} />

            {/* Módulo Cuentas */}
            <Route path="cuentas/:accountNumber" element={<AccountDetailPage />} />
            <Route path="cuentas/nueva" element={<AccountCreatePage />} />

            {/* Módulo Transacciones */}
            <Route path="transacciones/nueva" element={<TransactionFormPage />} />
            <Route path="transacciones/historial/:accountNumber" element={<TransactionHistoryPage />} />

            {/* Módulos Secundarios */}
            <Route path="sucursales" element={<BranchesPage />} />
<Route path="notificaciones" element={<NotificationsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
