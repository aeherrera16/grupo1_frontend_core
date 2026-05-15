import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard',           label: 'Dashboard' },
  { path: '/clientes',            label: 'Clientes' },
  { path: '/cuentas/nueva',       label: 'Nueva Cuenta' },
  { path: '/transacciones/nueva', label: 'Transacciones' },
  { path: '/sucursales',          label: 'Sucursales' },
  { path: '/notificaciones',      label: 'Notificaciones' },
];

const Sidebar = ({ isOpen, onToggle }) => {

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-40 ${
        isOpen ? 'w-56' : 'w-14'
      }`}
    >
      {/* Toggle */}
      <div className={`flex items-center border-b border-slate-100 h-11 ${isOpen ? 'justify-between px-4' : 'justify-center'}`}>
        {isOpen && (
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 select-none">
            Menú
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Expandir o contraer menú"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={!isOpen ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-md transition-colors duration-150 no-underline ${
                isOpen ? 'px-3 py-2.5' : 'justify-center px-0 py-2.5'
              } ${
                isActive
                  ? 'bg-blue-50 text-[#1E40AF] font-semibold'
                  : 'text-[#1E293B] font-semibold hover:bg-blue-50 hover:text-[#1E40AF]'
              }`
            }
          >
            {isOpen ? (
              <span className="text-sm whitespace-nowrap tracking-tight">
                {item.label}
              </span>
            ) : (
              <span className="text-xs font-bold w-7 h-7 flex items-center justify-center rounded bg-slate-100 text-slate-500">
                {item.label.slice(0, 2).toUpperCase()}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center tracking-wide">Banquito v1.0.0</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
