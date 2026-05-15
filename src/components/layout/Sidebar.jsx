import { useState } from 'react';
import { NavLink } from 'react-router-dom';

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
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-[#001f3f] to-[#003d66] transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      } flex flex-col shadow-lg z-40`}
      style={{
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header del sidebar */}
      <div className="p-4 flex items-center justify-between border-b border-white border-opacity-10">
        {isOpen && (
          <span className="text-xs font-bold text-white uppercase tracking-widest opacity-80">
            Menú
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition duration-200 text-white"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                isActive
                  ? 'bg-white bg-opacity-20 text-white font-semibold shadow-md'
                  : 'text-white text-opacity-80 hover:bg-white hover:bg-opacity-10 hover:text-opacity-100'
              }`
            }
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer del sidebar */}
      {isOpen && (
        <div className="p-4 border-t border-white border-opacity-10">
          <div className="text-xs text-white text-opacity-60 text-center">
            <p className="mb-1">Banquito</p>
            <p className="text-opacity-50">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
