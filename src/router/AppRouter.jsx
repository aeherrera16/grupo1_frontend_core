import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { CustomerSearchPage } from '../pages/customers/CustomerSearchPage';
import { CustomerCreatePage } from '../pages/customers/CustomerCreatePage';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage';
import { AccountCreatePage } from '../pages/accounts/AccountCreatePage';
import { AccountDetailPage } from '../pages/accounts/AccountDetailPage';
import { AccountAvailabilityPage } from '../pages/accounts/AccountAvailabilityPage';
import { TransactionFormPage } from '../pages/transactions/TransactionFormPage';
import { TransactionHistoryPage } from '../pages/transactions/TransactionHistoryPage';
import { BranchesPage } from '../pages/BranchesPage';
import { NotificationsPage } from '../pages/NotificationsPage';

const Layout = ({ pageTitle = 'Dashboard' }) => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar />
    <div className="flex flex-col flex-1">
      <Topbar title={pageTitle} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: '', element: <DashboardPage /> },
      { path: 'clientes', element: <CustomerListPage /> },
      { path: 'clientes/buscar', element: <CustomerSearchPage /> },
      { path: 'clientes/nuevo', element: <CustomerCreatePage /> },
      { path: 'clientes/:id', element: <CustomerDetailPage /> },
      { path: 'cuentas/nueva', element: <AccountCreatePage /> },
      { path: 'cuentas/:accountNumber/disponibilidad', element: <AccountAvailabilityPage /> },
      { path: 'cuentas/:accountNumber', element: <AccountDetailPage /> },
      { path: 'transacciones/nueva', element: <TransactionFormPage /> },
      { path: 'transacciones/historial/:accountNumber', element: <TransactionHistoryPage /> },
      { path: 'sucursales', element: <BranchesPage /> },
      { path: 'notificaciones', element: <NotificationsPage /> },
    ]
  },
  {
    path: '*',
    element: <div className="flex items-center justify-center h-screen"><h1>404 - Página no encontrada</h1></div>
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
