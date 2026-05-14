import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/cuentas/nueva', label: 'Nueva Cuenta', icon: '🏦' },
    { path: '/transacciones/nueva', label: 'Transacciones', icon: '💸' },
    { path: '/sucursales', label: 'Sucursales', icon: '🏢' },
    { path: '/feriados', label: 'Feriados', icon: '📅' },
    { path: '/notificaciones', label: 'Notificaciones', icon: '🔔' },
  ];

  return (
    <aside className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold">Banquito</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-800 rounded"
        >
          ☰
        </button>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-4 p-3 rounded hover:bg-gray-800 transition mb-2"
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        {isOpen && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">Usuario</p>
            <p className="font-semibold">{user?.fullName || 'No disponible'}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          {isOpen ? 'Cerrar sesión' : '🚪'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
