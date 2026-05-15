import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
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

// createBrowserRouter habilita el data router, requerido para useBlocker y usePrompt
const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <IntranetLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },

        // Clientes — rutas estáticas antes que dinámicas
        { path: 'clientes', element: <CustomerSearchPage /> },
        { path: 'clientes/nuevo', element: <CustomerCreatePage /> },
        { path: 'clientes/:id', element: <CustomerDetailPage /> },

        // Cuentas
        { path: 'cuentas/nueva', element: <AccountCreatePage /> },
        { path: 'cuentas/:accountNumber', element: <AccountDetailPage /> },

        // Transacciones
        { path: 'transacciones/nueva', element: <TransactionFormPage /> },
        { path: 'transacciones/historial/:accountNumber', element: <TransactionHistoryPage /> },

        // Secundarios
        { path: 'sucursales', element: <BranchesPage /> },
        { path: 'notificaciones', element: <NotificationsPage /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  );
}
