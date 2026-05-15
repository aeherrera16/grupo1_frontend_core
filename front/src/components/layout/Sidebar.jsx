import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Repeat,
  Building2,
  Bell,
  LogOut,
  Menu,
} from 'lucide-react';

const ICON_PROPS = { size: 20, strokeWidth: 1.5, color: '#9CA3AF' };

const menuItems = [
  { path: '/dashboard',          label: 'Dashboard',      Icon: LayoutDashboard },
  { path: '/clientes',           label: 'Clientes',       Icon: Users },
  { path: '/cuentas/nueva',      label: 'Nueva Cuenta',   Icon: UserPlus },
  { path: '/transacciones/nueva',label: 'Transacciones',  Icon: Repeat },
  { path: '/sucursales',         label: 'Sucursales',     Icon: Building2 },
  { path: '/notificaciones',     label: 'Notificaciones', Icon: Bell },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold tracking-wide">Banquito</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-800 rounded"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={1.5} color="#9CA3AF" />
        </button>
      </div>

      <nav className="p-4">
        {menuItems.map(({ path, label, Icon }) => (
          <Link
            key={path}
            to={path}
            className="flex items-center gap-4 p-3 rounded hover:bg-gray-800 transition mb-1"
          >
            <Icon {...ICON_PROPS} />
            {isOpen && <span className="text-sm text-gray-300">{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        {isOpen && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Usuario</p>
            <p className="text-sm font-semibold text-gray-200 mt-1">
              {user?.fullName || 'No disponible'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded transition text-sm"
        >
          <LogOut size={16} strokeWidth={1.5} />
          {isOpen && 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
