import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Topbar = () => {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { user = {}, logout } = auth;
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = ((user?.name || user?.username || 'U')[0]).toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center justify-between px-8 z-50"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid #e9ecef'
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
          style={{
            background: 'linear-gradient(135deg, #0052a3 0%, #001f3f 100%)'
          }}
        >
          B
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 m-0">Banquito</h1>
          <p className="text-xs text-gray-500 m-0" style={{ letterSpacing: '1px' }}>
            INTRANET BANCARIA
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          className="relative p-2 rounded-lg transition duration-200"
          style={{ color: '#495057' }}
          onMouseEnter={e => e.target.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          aria-label="Notificaciones"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e9ecef' }}></div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200"
            onMouseEnter={e => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 m-0">
                {user?.name || user?.username || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 m-0">{user?.role || 'OPERARIO'}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{
                background: 'linear-gradient(135deg, #0052a3 0%, #001f3f 100%)'
              }}
            >
              {initials}
            </div>
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-10"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                border: '1px solid #e9ecef'
              }}
            >
              <a
                href="#perfil"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Mi Perfil
              </a>
              <a
                href="#configuracion"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Configuración
              </a>
              <div style={{ height: '1px', backgroundColor: '#e9ecef', margin: '0.5rem 0' }}></div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
