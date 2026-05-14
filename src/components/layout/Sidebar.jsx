import { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

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
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-56' : 'w-20'
      } flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {isOpen && <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Menú</span>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
        >
          ☰
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition duration-200 group"
          >
            <span className="text-lg">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
