import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

// Layout para rutas protegidas
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
    errorElement: <NotFoundPage />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/', element: <DashboardPage /> },
      // Las demás rutas se agregan aquí conforme se implementan las páginas
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
