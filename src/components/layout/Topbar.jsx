import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Topbar = () => {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { user = {}, logout } = auth;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
      {/* Logo y branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Banquito</h1>
        <span className="text-xs text-gray-500 ml-2">INTRANET</span>
      </div>

      {/* Navegación y usuario */}
      <div className="flex items-center gap-6">
        {/* Información del usuario */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{user?.name || user?.username || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'OPERARIO'}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {((user?.name || user?.username || 'U')[0]).toUpperCase()}
          </div>
        </div>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
        >
          Salir
        </button>
      </div>
    </header>
  );
};

export default Topbar;
