import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const auth = useAuth() || {};
  const { user = {} } = auth;

  const quickAccessLinks = [
    {
      title: 'Buscar Clientes',
      description: 'Búsqueda de clientes por identificación',
      icon: '👥',
      path: '/clientes',
      color: 'bg-blue-500'
    },
    {
      title: 'Nueva Transacción',
      description: 'Realizar débito, crédito o transferencia',
      icon: '💸',
      path: '/transacciones/nueva',
      color: 'bg-green-500'
    },
    {
      title: 'Gestionar Sucursales',
      description: 'Ver y crear sucursales',
      icon: '🏢',
      path: '/sucursales',
      color: 'bg-purple-500'
    },
    {
      title: 'Feriados',
      description: 'Gestionar calendario de feriados',
      icon: '📅',
      path: '/feriados',
      color: 'bg-orange-500'
    },
    {
      title: 'Notificaciones',
      description: 'Ver tus notificaciones',
      icon: '🔔',
      path: '/notificaciones',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenido, {user?.name || 'Operario'}
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control de la Intranet Banquito
        </p>
      </div>

      {/* Grid de accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickAccessLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="group bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
          >
            <div className={`${link.color} text-white rounded-lg w-16 h-16 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition`}>
              {link.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {link.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {link.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 text-sm">Usuario</p>
            <p className="text-lg font-semibold text-gray-900">{user?.username || '-'}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-gray-600 text-sm">Rol</p>
            <p className="text-lg font-semibold text-gray-900">{user?.role || 'OPERARIO'}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-gray-600 text-sm">Estado</p>
            <p className="text-lg font-semibold text-gray-900">{user?.status || 'ACTIVO'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
